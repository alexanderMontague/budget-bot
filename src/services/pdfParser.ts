import * as pdfjsLib from "pdfjs-dist";
import type { ParsedTransaction } from "../types";
import { formatDateToYYYYMMDD } from "../util";

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
    const transactions = text
      .split("  Date   Description   Amount  ")
      .slice(1)
      .flatMap(it => it.split("  This is not a billing Statement.")[0])
      .flatMap(it =>
        // split on $ dollar sign and then the date, capturing the transaction data
        it.split(
          /(?<=-\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s+(?=\d{1,2}\s[A-Z][a-z]{2}\.?\s\d{4})/
        )
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
        date: formatDateToYYYYMMDD(new Date(it[0])),
        description: it[1],
        merchant: it[2],
        amount: Number(it[it.length - 1]),
        accountType: "amex",
        transactionType: "CREDIT" as const,
      }));

    return {
      transactions,
      errors,
      accountInfo: {
        accountType: "amex",
      },
    };
  }

  private static parseCibcStatement(
    _text: string,
    errors: string[]
  ): PdfParseResult {
    return {
      transactions: [],
      errors,
    };
  }
}
