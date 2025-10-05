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
      patterns: [
        "cibc",
        "canadian imperial bank",
        "cibc advisor",
        "cibc online banking",
      ],
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

    const amexTransactions = text
      .split("  Date   Description   Amount  ")
      .slice(1)
      .flatMap(it => it.split("  This is not a billing Statement.")[0])
      .flatMap(it =>
        it.split(/(?<=\$\d+\.\d{2})\s(?=\d{1,2}\s[A-Z][a-z]{2}\.\s\d{4})/)
      )
      .map(it =>
        it
          .split("   ")
          .map(it =>
            it
              .replace("  Merchant:", "")
              .replace("  Date Processed:", "")
              .replace("  Foreign Spend Amount:", "")
          )
          .filter(
            it => !it.includes("Commission") || !it.includes("Exchange Rate")
          )
      )
      .map(it => [...it, it[it.length - 1].split(" $")[1]])
      .filter(it => !it[1].includes("PAYMENT RECEIVED"))
      .map(it => ({
        date: it[0],
        description: it[1],
        merchant: it[2],
        amount: Number(it[it.length - 1]),
      }));

    debugger;

    return {
      transactions,
      errors,
      accountInfo: {
        accountType: "amex",
        statementPeriod: this.extractAmexStatementPeriod(text),
      },
    };
  }

  private static parseCibcStatement(
    text: string,
    errors: string[]
  ): PdfParseResult {
    const transactions: ParsedTransaction[] = [];

    let i = 0;
    while (i < 5) {
      i++;
      try {
        transactions.push({
          date: "",
          merchant: "",
          amount: 0,
          description: "",
          accountType: "cibc",
          confidence: 0,
        });
      } catch (error) {
        errors.push(`Failed to parse CIBC transaction: ${error}`);
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

  private static extractAmexStatementPeriod(text: string): string {
    // Look for date range pattern like "28 Aug. 2025 - 22 Sep. 2025"
    const periodMatch = text.match(
      /(\d{1,2}\s+\w{3}\.\s+\d{4})\s*-\s*(\d{1,2}\s+\w{3}\.\s+\d{4})/
    );
    return periodMatch ? `${periodMatch[1]} - ${periodMatch[2]}` : "";
  }

  private static extractCibcStatementPeriod(text: string): string {
    // CIBC might have different date format - adjust as needed based on actual CIBC statements
    const periodMatch = text.match(
      /(\d{1,2}\s+\w{3}\.\s+\d{4})\s*-\s*(\d{1,2}\s+\w{3}\.\s+\d{4})/
    );
    return periodMatch ? `${periodMatch[1]} - ${periodMatch[2]}` : "";
  }
}
