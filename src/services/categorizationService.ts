import type { ParsedTransaction, Category } from "../types";

interface CategorizationResult {
  categoryId?: string;
  confidence: number;
  reasoning?: string;
}

interface MerchantPattern {
  patterns: string[];
  categoryName: string;
  confidence: number;
}

export class CategorizationService {
  // Common merchant patterns for automatic categorization
  private static merchantPatterns: MerchantPattern[] = [
    // Groceries
    {
      patterns: [
        "walmart",
        "superstore",
        "loblaws",
        "metro",
        "sobeys",
        "whole foods",
        "costco",
        "no frills",
      ],
      categoryName: "groceries",
      confidence: 0.9,
    },
    // Restaurants/Dining
    {
      patterns: [
        "mcdonalds",
        "starbucks",
        "tim hortons",
        "subway",
        "pizza",
        "restaurant",
        "bistro",
        "cafe",
      ],
      categoryName: "dining out",
      confidence: 0.85,
    },
    // Transportation
    {
      patterns: [
        "shell",
        "esso",
        "petro",
        "gas",
        "uber",
        "lyft",
        "taxi",
        "ttc",
        "go transit",
      ],
      categoryName: "transportation",
      confidence: 0.8,
    },
    // Entertainment
    {
      patterns: [
        "netflix",
        "spotify",
        "amazon prime",
        "disney",
        "cinema",
        "movie",
        "theatre",
      ],
      categoryName: "entertainment",
      confidence: 0.85,
    },
    // Utilities
    {
      patterns: [
        "hydro",
        "rogers",
        "bell",
        "telus",
        "enbridge",
        "toronto hydro",
      ],
      categoryName: "utilities",
      confidence: 0.9,
    },
    // Healthcare
    {
      patterns: [
        "pharmacy",
        "shoppers",
        "medical",
        "dental",
        "clinic",
        "hospital",
      ],
      categoryName: "healthcare",
      confidence: 0.8,
    },
  ];

  /**
   * Categorize a transaction using rule-based matching
   */
  static categorizeTransaction(
    transaction: ParsedTransaction,
    categories: Category[]
  ): CategorizationResult {
    const merchantLower = transaction.merchant.toLowerCase();
    const descriptionLower = transaction.description.toLowerCase();

    // Try to match against known patterns
    for (const pattern of this.merchantPatterns) {
      for (const patternText of pattern.patterns) {
        if (
          merchantLower.includes(patternText) ||
          descriptionLower.includes(patternText)
        ) {
          // Find matching category
          const category = categories.find(
            cat =>
              cat.name.toLowerCase().includes(pattern.categoryName) ||
              pattern.categoryName.includes(cat.name.toLowerCase())
          );

          if (category) {
            return {
              categoryId: category.id,
              confidence: pattern.confidence,
              reasoning: `Matched pattern: ${patternText}`,
            };
          }
        }
      }
    }

    // Special rules for income vs expenses
    if (transaction.amount > 0) {
      // Positive amounts are usually income
      const incomeCategory = categories.find(
        cat =>
          cat.name.toLowerCase().includes("income") ||
          cat.name.toLowerCase().includes("salary")
      );

      if (incomeCategory) {
        return {
          categoryId: incomeCategory.id,
          confidence: 0.7,
          reasoning: "Positive amount categorized as income",
        };
      }
    }

    // Default: no category found
    return {
      confidence: 0.1,
      reasoning: "No matching category found",
    };
  }

  /**
   * Batch categorize multiple transactions
   */
  static batchCategorizeTransactions(
    transactions: ParsedTransaction[],
    categories: Category[]
  ): Array<{
    transaction: ParsedTransaction;
    categorization: CategorizationResult;
  }> {
    return transactions.map(transaction => ({
      transaction,
      categorization: this.categorizeTransaction(transaction, categories),
    }));
  }

  /**
   * Learn from user corrections to improve categorization
   * This could be enhanced with machine learning in the future
   */
  static learnFromCorrection(
    merchant: string,
    originalCategoryId: string | undefined,
    correctedCategoryId: string,
    categories: Category[]
  ): void {
    // For now, this is a placeholder for future ML implementation
    // Could store user corrections in localStorage or send to a learning API
    console.log("Learning from correction:", {
      merchant,
      originalCategory: categories.find(c => c.id === originalCategoryId)?.name,
      correctedCategory: categories.find(c => c.id === correctedCategoryId)
        ?.name,
    });
  }

  /**
   * Enhanced categorization using OpenAI (future implementation)
   * This would send transaction data to OpenAI for intelligent categorization
   */
  static async categorizeWithAI(
    transaction: ParsedTransaction,
    categories: Category[]
  ): Promise<CategorizationResult> {
    // Placeholder for future OpenAI integration
    // For now, fall back to rule-based categorization
    return this.categorizeTransaction(transaction, categories);
  }

  /**
   * Get confidence threshold recommendations
   */
  static getConfidenceThresholds() {
    return {
      high: 0.8, // Auto-assign categories with high confidence
      medium: 0.6, // Suggest categories with medium confidence
      low: 0.3, // Flag for manual review with low confidence
    };
  }
}
