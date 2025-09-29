import * as pdfjsLib from "pdfjs-dist";
import type { ParsedTransaction } from "../types";

// Set up PDF.js worker with fallback options
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Fallback worker configuration
if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PdfParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  accountInfo?: {
    accountType: string;
    lastFour?: string;
    statementPeriod?: string;
  };
}

interface BankParser {
  name: string;
  patterns: string[];
  parseStatement: (text: string, errors: string[]) => PdfParseResult;
}

export class PdfParser {
  private static bankParsers: BankParser[] = [
    {
      name: "amex",
      patterns: ["american express", "amex"],
      parseStatement: (text, errors) => this.parseAmexStatement(text, errors),
    },
    {
      name: "cibc",
      patterns: ["cibc", "canadian imperial bank"],
      parseStatement: (text, errors) => this.parseCibcStatement(text, errors),
    },
  ];

  static async parseFile(file: File): Promise<PdfParseResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

      let fullText = "";
      const errors: string[] = [];

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: unknown) =>
              typeof item === "object" && item !== null && "str" in item
                ? (item as { str: string }).str
                : ""
            )
            .join(" ");
          fullText += pageText + "\n";
        } catch (error) {
          errors.push(`Failed to parse page ${i}: ${error}`);
        }
      }

      // Find matching bank parser
      const parser = this.detectBankParser(fullText);

      if (parser) {
        return parser.parseStatement(fullText, errors);
      } else {
        return {
          transactions: [],
          errors: ["Unable to detect supported bank type from PDF content"],
        };
      }
    } catch (error) {
      return {
        transactions: [],
        errors: [`Failed to parse PDF: ${error}`],
      };
    }
  }

  static registerBankParser(parser: BankParser): void {
    this.bankParsers.push(parser);
  }

  private static detectBankParser(text: string): BankParser | null {
    const lowerText = text.toLowerCase();

    return (
      this.bankParsers.find(parser =>
        parser.patterns.some(pattern => lowerText.includes(pattern))
      ) || null
    );
  }

  private static parseAmexStatement(
    text: string,
    errors: string[]
  ): PdfParseResult {
    const transactions: ParsedTransaction[] = [];
    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    // AMEX statement patterns
    // Look for date patterns: MM/DD/YY or MM/DD/YYYY
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dateMatch = line.match(datePattern);

      if (dateMatch) {
        try {
          const transaction = this.parseAmexTransaction(line);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(
            `Failed to parse AMEX transaction on line ${i + 1}: ${error}`
          );
        }
      }
    }

    return {
      transactions,
      errors,
      accountInfo: {
        accountType: "amex",
        statementPeriod: this.extractAmexStatementPeriod(text),
      },
    };
  }

  private static parseAmexTransaction(line: string): ParsedTransaction | null {
    // AMEX format: DATE MERCHANT AMOUNT
    // Example: "01/15/25 STARBUCKS #12345 NEW YORK NY $5.67"

    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;
    const amountPattern = /\$?([\d,]+\.?\d{0,2})$/;

    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);

    if (!dateMatch || !amountMatch) {
      return null;
    }

    const rawDate = dateMatch[1];
    const rawAmount = amountMatch[1].replace(/,/g, "");
    const amount = -parseFloat(rawAmount); // AMEX amounts are expenses (negative)

    // Convert MM/DD/YY to YYYY-MM-DD
    const [month, day, year] = rawDate.split("/");
    const fullYear = year.length === 2 ? `20${year}` : year;
    const date = `${fullYear}-${month.padStart(2, "0")}-${day.padStart(
      2,
      "0"
    )}`;

    // Extract merchant name (everything between date and amount)
    const merchantText = line
      .replace(dateMatch[0], "")
      .replace(amountMatch[0], "")
      .trim();

    const merchant = this.cleanMerchantName(merchantText);

    return {
      date,
      merchant,
      amount,
      description: merchantText,
      accountType: "amex",
      confidence: 0.8,
    };
  }

  private static parseCibcStatement(
    text: string,
    errors: string[]
  ): PdfParseResult {
    const transactions: ParsedTransaction[] = [];
    const lines = text
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean);

    // CIBC statement patterns
    // Look for transaction lines with date, description, and amount
    const datePattern = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dateMatch = line.match(datePattern);

      if (dateMatch) {
        try {
          const transaction = this.parseCibcTransaction(line);
          if (transaction) {
            transactions.push(transaction);
          }
        } catch (error) {
          errors.push(
            `Failed to parse CIBC transaction on line ${i + 1}: ${error}`
          );
        }
      }
    }

    return {
      transactions,
      errors,
      accountInfo: {
        accountType: "cibc",
        statementPeriod: this.extractCibcStatementPeriod(text),
      },
    };
  }

  private static parseCibcTransaction(line: string): ParsedTransaction | null {
    // CIBC format varies, but typically: DATE DESCRIPTION AMOUNT
    // Example: "2025-01-15 INTERAC e-Transfer STARBUCKS -5.67"

    const datePattern = /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/;
    const amountPattern = /([-]?\$?[\d,]+\.?\d{0,2})$/;

    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);

    if (!dateMatch || !amountMatch) {
      return null;
    }

    let date = dateMatch[1];
    const rawAmount = amountMatch[1].replace(/\$|,/g, "");
    const amount = parseFloat(rawAmount);

    // Convert MM/DD/YYYY to YYYY-MM-DD if needed
    if (date.includes("/")) {
      const [month, day, year] = date.split("/");
      date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Extract description (everything between date and amount)
    const description = line
      .replace(dateMatch[0], "")
      .replace(amountMatch[0], "")
      .trim();

    const merchant = this.cleanMerchantName(description);

    return {
      date,
      merchant,
      amount,
      description,
      accountType: "cibc",
      confidence: 0.8,
    };
  }

  private static cleanMerchantName(rawMerchant: string): string {
    // Remove common prefixes/suffixes and clean up merchant names
    return rawMerchant
      .replace(/^(INTERAC e-Transfer|PURCHASE|PAYMENT|POS|ATM)\s*/i, "")
      .replace(/\s*(TORONTO|ONTARIO|ON|CANADA|CA|USA|US)$/i, "")
      .replace(/\s*#\d+.*$/, "") // Remove reference numbers
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();
  }

  private static extractAmexStatementPeriod(text: string): string | undefined {
    const periodPattern =
      /statement period:?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})\s*-\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i;
    const match = text.match(periodPattern);
    return match ? `${match[1]} - ${match[2]}` : undefined;
  }

  private static extractCibcStatementPeriod(text: string): string | undefined {
    const periodPattern =
      /statement period:?\s*(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})/i;
    const match = text.match(periodPattern);
    return match ? `${match[1]} to ${match[2]}` : undefined;
  }
}
