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

    debugger;

    const pageTransactions = text
      .split("Date   Description   Amount  ")
      .slice(1);

    let i = 0;
    while (i < 5) {
      try {
        i++;
        transactions.push({
          date: "",
          merchant: "",
          amount: 0,
          description: "",
          accountType: "amex",
          confidence: 0,
        });
      } catch (error) {
        errors.push(`Failed to parse AMEX transaction: ${error}`);
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
}
