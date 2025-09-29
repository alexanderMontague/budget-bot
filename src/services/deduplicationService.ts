import type {
  Transaction,
  ParsedTransaction,
  DeduplicationResult,
} from "../types";

export class DeduplicationService {
  /**
   * Check if a parsed transaction is likely a duplicate of existing transactions
   */
  static checkForDuplicates(
    parsedTransaction: ParsedTransaction,
    existingTransactions: Transaction[]
  ): DeduplicationResult {
    // Check for exact matches first
    const exactMatch = this.findExactMatch(
      parsedTransaction,
      existingTransactions
    );
    if (exactMatch) {
      return {
        isLikelyDuplicate: true,
        duplicateOf: exactMatch.id,
        confidence: 0.95,
        reason: "Exact match found",
      };
    }

    // Check for credit card payment duplicates (AMEX payment showing up in bank statement)
    const transferMatch = this.findTransferMatch(
      parsedTransaction,
      existingTransactions
    );
    if (transferMatch) {
      return {
        isLikelyDuplicate: true,
        duplicateOf: transferMatch.id,
        confidence: 0.9,
        reason: "Credit card payment duplicate",
      };
    }

    // Check for similar transactions (same merchant, similar amount, close dates)
    const similarMatch = this.findSimilarMatch(
      parsedTransaction,
      existingTransactions
    );
    if (similarMatch) {
      return {
        isLikelyDuplicate: true,
        duplicateOf: similarMatch.transaction.id,
        confidence: similarMatch.confidence,
        reason: similarMatch.reason,
      };
    }

    return {
      isLikelyDuplicate: false,
      confidence: 0.1,
    };
  }

  private static findExactMatch(
    parsedTransaction: ParsedTransaction,
    existingTransactions: Transaction[]
  ): Transaction | null {
    return (
      existingTransactions.find(
        existing =>
          existing.date === parsedTransaction.date &&
          existing.merchant === parsedTransaction.merchant &&
          Math.abs(existing.amount - parsedTransaction.amount) < 0.01
      ) || null
    );
  }

  private static findTransferMatch(
    parsedTransaction: ParsedTransaction,
    existingTransactions: Transaction[]
  ): Transaction | null {
    // Look for credit card payments in bank statements
    const merchantLower = parsedTransaction.merchant.toLowerCase();

    // Common credit card payment descriptions
    const creditCardPayments = [
      "american express",
      "amex",
      "visa payment",
      "mastercard payment",
      "credit card payment",
      "cc payment",
      "payment thank you",
      "payment received",
    ];

    const isLikelyCreditCardPayment = creditCardPayments.some(payment =>
      merchantLower.includes(payment)
    );

    if (isLikelyCreditCardPayment && parsedTransaction.amount < 0) {
      // Look for credit card transactions that sum to this payment amount
      const creditCardTransactions = existingTransactions.filter(
        t =>
          t.accountType !== parsedTransaction.accountType && // Different account type
          this.isWithinDateRange(t.date, parsedTransaction.date, 30) && // Within 30 days
          t.amount < 0 // Only expenses
      );

      const totalCreditAmount = creditCardTransactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );
      const paymentAmount = Math.abs(parsedTransaction.amount);

      // If the payment amount roughly matches the sum of credit transactions
      if (Math.abs(totalCreditAmount - paymentAmount) < 1.0) {
        return creditCardTransactions[0]; // Return first matching transaction
      }
    }

    return null;
  }

  private static findSimilarMatch(
    parsedTransaction: ParsedTransaction,
    existingTransactions: Transaction[]
  ): { transaction: Transaction; confidence: number; reason: string } | null {
    for (const existing of existingTransactions) {
      // Skip if different account types (unless checking for transfers)
      if (existing.accountType === parsedTransaction.accountType) {
        const merchantSimilarity = this.calculateStringSimilarity(
          existing.merchant,
          parsedTransaction.merchant
        );

        const amountMatch =
          Math.abs(existing.amount - parsedTransaction.amount) < 0.01;
        const dateDistance = this.calculateDateDistance(
          existing.date,
          parsedTransaction.date
        );

        // High similarity threshold
        if (merchantSimilarity > 0.8 && amountMatch && dateDistance <= 1) {
          return {
            transaction: existing,
            confidence: 0.85,
            reason: `Similar transaction: ${merchantSimilarity.toFixed(
              2
            )} merchant similarity, same amount, ${dateDistance} day(s) apart`,
          };
        }

        // Medium similarity threshold
        if (merchantSimilarity > 0.6 && amountMatch && dateDistance <= 3) {
          return {
            transaction: existing,
            confidence: 0.7,
            reason: `Possible duplicate: ${merchantSimilarity.toFixed(
              2
            )} merchant similarity, same amount, ${dateDistance} day(s) apart`,
          };
        }
      }
    }

    return null;
  }

  private static calculateStringSimilarity(str1: string, str2: string): number {
    // Simple Jaccard similarity for merchant names
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  private static calculateDateDistance(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
  }

  private static isWithinDateRange(
    date1: string,
    date2: string,
    days: number
  ): boolean {
    return this.calculateDateDistance(date1, date2) <= days;
  }

  /**
   * Batch process multiple parsed transactions for deduplication
   */
  static batchCheckDuplicates(
    parsedTransactions: ParsedTransaction[],
    existingTransactions: Transaction[]
  ): Array<{
    transaction: ParsedTransaction;
    deduplication: DeduplicationResult;
  }> {
    return parsedTransactions.map(transaction => ({
      transaction,
      deduplication: this.checkForDuplicates(transaction, existingTransactions),
    }));
  }

  /**
   * Filter out likely duplicates based on confidence threshold
   */
  static filterDuplicates(
    results: Array<{
      transaction: ParsedTransaction;
      deduplication: DeduplicationResult;
    }>,
    confidenceThreshold: number = 0.8
  ): ParsedTransaction[] {
    return results
      .filter(
        result =>
          !result.deduplication.isLikelyDuplicate ||
          result.deduplication.confidence < confidenceThreshold
      )
      .map(result => result.transaction);
  }
}
