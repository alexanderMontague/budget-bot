import { useState, useRef } from "react";
import { PdfParser } from "../services/pdfParser";
import { DeduplicationService } from "../services/deduplicationService";
import { CategorizationService } from "../services/categorizationService";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import type { ParsedTransaction, Transaction } from "../types";

interface TransactionUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadResult {
  fileName: string;
  totalParsed: number;
  duplicatesFound: number;
  newTransactions: number;
  errors: string[];
  accountInfo?: {
    accountType: string;
    lastFour?: string;
    statementPeriod?: string;
  };
}

export default function TransactionUpload({
  isOpen,
  onClose,
}: TransactionUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<
    Array<{
      transaction: ParsedTransaction;
      isDuplicate: boolean;
      duplicateOf?: string;
      confidence: number;
      suggestedCategoryId?: string;
      categoryConfidence?: number;
    }>
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { transactions, createMultipleTransactions } = useTransactions();
  const { categories } = useCategories();

  const processFiles = async (files: FileList | File[]) => {
    const pdfFiles = Array.from(files).filter(
      file => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please select PDF files only");
      return;
    }

    setUploading(true);
    setUploadResults([]);
    setPendingTransactions([]);

    const results: UploadResult[] = [];
    const allPendingTransactions: Array<{
      transaction: ParsedTransaction;
      isDuplicate: boolean;
      duplicateOf?: string;
      confidence: number;
      suggestedCategoryId?: string;
      categoryConfidence?: number;
    }> = [];

    for (const file of pdfFiles) {
      try {
        // Parse PDF
        const parseResult = await PdfParser.parseFile(file);

        if (parseResult.errors.length > 0) {
          console.warn(
            `PDF parsing errors for ${file.name}:`,
            parseResult.errors
          );
        }

        // Check for duplicates
        const deduplicationResults = DeduplicationService.batchCheckDuplicates(
          parseResult.transactions,
          transactions
        );

        // Categorize transactions
        const categorizationResults =
          CategorizationService.batchCategorizeTransactions(
            parseResult.transactions,
            categories
          );

        // Process results
        const newTransactions: ParsedTransaction[] = [];
        const filePendingTransactions: typeof allPendingTransactions = [];

        deduplicationResults.forEach((result, index) => {
          const categorization = categorizationResults[index]?.categorization;

          if (
            result.deduplication.isLikelyDuplicate &&
            result.deduplication.confidence > 0.8
          ) {
            filePendingTransactions.push({
              transaction: result.transaction,
              isDuplicate: true,
              duplicateOf: result.deduplication.duplicateOf,
              confidence: result.deduplication.confidence,
              suggestedCategoryId: categorization?.categoryId,
              categoryConfidence: categorization?.confidence,
            });
          } else {
            newTransactions.push(result.transaction);
            filePendingTransactions.push({
              transaction: result.transaction,
              isDuplicate: false,
              confidence: result.deduplication.confidence,
              suggestedCategoryId: categorization?.categoryId,
              categoryConfidence: categorization?.confidence,
            });
          }
        });

        allPendingTransactions.push(...filePendingTransactions);

        const result: UploadResult = {
          fileName: file.name,
          totalParsed: parseResult.transactions.length,
          duplicatesFound: filePendingTransactions.filter(d => d.isDuplicate)
            .length,
          newTransactions: newTransactions.length,
          errors: parseResult.errors,
          accountInfo: parseResult.accountInfo,
        };

        results.push(result);
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        results.push({
          fileName: file.name,
          totalParsed: 0,
          duplicatesFound: 0,
          newTransactions: 0,
          errors: [`Failed to process file: ${error}`],
        });
      }
    }

    setPendingTransactions(allPendingTransactions);
    setUploadResults(results);
    setUploading(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleConfirmImport = async () => {
    const transactionsToImport = pendingTransactions
      .filter(pt => !pt.isDuplicate)
      .map(pt => {
        const transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt"> =
          {
            date: pt.transaction.date,
            merchant: pt.transaction.merchant,
            amount: pt.transaction.amount,
            originalDescription: pt.transaction.description,
            accountType: pt.transaction.accountType,
            description: pt.transaction.description,
            confidence: pt.transaction.confidence,
            categoryId: pt.suggestedCategoryId,
          };
        return transaction;
      });

    if (transactionsToImport.length === 0) {
      alert("No new transactions to import");
      return;
    }

    setUploading(true);
    try {
      await createMultipleTransactions(transactionsToImport);
      alert(
        `Successfully imported ${transactionsToImport.length} transactions!`
      );
      onClose();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import transactions. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setUploadResults([]);
    setPendingTransactions([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const totalNewTransactions = uploadResults.reduce(
    (sum, result) => sum + result.newTransactions,
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Import Transactions</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {uploadResults.length === 0 ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Upload AMEX or CIBC PDF statements to automatically import
                transactions. The system will detect duplicates and categorize
                transactions.
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-primary-400 bg-primary-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className={`cursor-pointer ${uploading ? "opacity-50" : ""}`}
                >
                  <div className="text-4xl mb-4">📄</div>
                  <div className="text-lg font-medium text-gray-900 mb-2">
                    {uploading
                      ? "Processing..."
                      : isDragOver
                      ? "Drop files here"
                      : "Choose PDF files or drag and drop"}
                  </div>
                  <div className="text-sm text-gray-500">
                    Supports multiple files • AMEX, CIBC, and other bank
                    statements
                  </div>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  Upload Summary ({uploadResults.length} file
                  {uploadResults.length !== 1 ? "s" : ""})
                </h3>
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className={`${
                      index > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2">
                        <span className="text-gray-500">File:</span>
                        <span className="ml-2 font-medium">
                          {result.fileName}
                        </span>
                        {result.accountInfo?.accountType && (
                          <span className="ml-2 text-xs text-gray-500 uppercase">
                            ({result.accountInfo.accountType})
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Total Parsed:</span>
                        <span className="ml-2 font-medium">
                          {result.totalParsed}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duplicates:</span>
                        <span className="ml-2 font-medium text-yellow-600">
                          {result.duplicatesFound}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">New Transactions:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {result.newTransactions}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="text-sm font-medium">
                    <span className="text-gray-700">
                      Total New Transactions:{" "}
                    </span>
                    <span className="text-green-600">
                      {totalNewTransactions}
                    </span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {uploadResults.some(result => result.errors.length > 0) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Warnings</h3>
                  {uploadResults.map(
                    (result, index) =>
                      result.errors.length > 0 && (
                        <div key={index} className={index > 0 ? "mt-3" : ""}>
                          <div className="text-sm font-medium text-red-800">
                            {result.fileName}:
                          </div>
                          <ul className="text-sm text-red-700 space-y-1 mt-1">
                            {result.errors.map((error, errorIndex) => (
                              <li key={errorIndex}>• {error}</li>
                            ))}
                          </ul>
                        </div>
                      )
                  )}
                </div>
              )}

              {/* Transaction Preview */}
              {pendingTransactions.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Transaction Preview
                  </h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {pendingTransactions.slice(0, 10).map((pt, index) => (
                      <div
                        key={index}
                        className={`p-3 border-b border-gray-100 last:border-b-0 ${
                          pt.isDuplicate ? "bg-yellow-50" : "bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {pt.transaction.merchant}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pt.transaction.date} •{" "}
                              {pt.transaction.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium ${
                                pt.transaction.amount < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ${Math.abs(pt.transaction.amount).toFixed(2)}
                            </div>
                            {pt.isDuplicate && (
                              <div className="text-xs text-yellow-600">
                                Duplicate
                              </div>
                            )}
                            {pt.suggestedCategoryId && !pt.isDuplicate && (
                              <div className="text-xs text-blue-600">
                                {
                                  categories.find(
                                    c => c.id === pt.suggestedCategoryId
                                  )?.name
                                }
                                {pt.categoryConfidence &&
                                  pt.categoryConfidence > 0.8 &&
                                  " ✓"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingTransactions.length > 10 && (
                      <div className="p-3 text-center text-sm text-gray-500">
                        ... and {pendingTransactions.length - 10} more
                        transactions
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                {totalNewTransactions > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    className="btn-primary"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Importing..."
                      : `Import ${totalNewTransactions} Transactions`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
