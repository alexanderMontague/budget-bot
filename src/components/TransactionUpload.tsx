import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { PdfParser } from "../services/pdfParser";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../hooks/useCategories";
import type { ParsedTransaction, Transaction } from "../types";

interface TransactionUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialUploadResults: {
  transactions: ParsedTransaction[];
  errors: string[];
} = { transactions: [], errors: [] };

export default function TransactionUpload({
  isOpen,
  onClose,
}: TransactionUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    transactions: ParsedTransaction[];
    errors: string[];
  }>(initialUploadResults);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createTransactions } = useTransactions();
  const { categories } = useCategories();
  const navigate = useNavigate();

  const processFiles = async (files: FileList | File[]) => {
    const pdfFiles = Array.from(files).filter(
      file => file.type === "application/pdf"
    );

    if (pdfFiles.length === 0) {
      alert("Please select PDF files only");
      return;
    }

    setUploading(true);
    setFileNames(pdfFiles.map(file => file.name));
    setUploadResults(initialUploadResults);
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

        setUploadResults(prev => ({
          ...prev,
          transactions: parseResult.transactions,
          errors: parseResult.errors,
        }));
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setUploadResults(prev => ({
          ...prev,
          transactions: [],
          errors: [`Failed to process file: ${error}`],
        }));
      }
    }

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
    if (uploadResults.transactions.length === 0) {
      alert("No new transactions to import");
      return;
    }

    setUploading(true);
    try {
      await createTransactions(
        uploadResults.transactions as Omit<
          Transaction,
          "id" | "createdAt" | "updatedAt"
        >[]
      );
      alert(
        `Successfully imported ${uploadResults.transactions.length} transactions!`
      );
      onClose();
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import transactions. Please try again.");
    } finally {
      setUploading(false);
      setUploadResults(initialUploadResults);
      setFileNames([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClose = () => {
    setUploadResults(initialUploadResults);
    setFileNames([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  if (!isOpen) return null;

  const accountType = uploadResults.transactions[0]?.accountType;
  const totalTransactionCount = uploadResults.transactions.length;
  const hasCategories = categories.length > 0;

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
          {!hasCategories ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Categories First
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Before importing transactions, you need to set up at least one
                category. Categories help you organize and track your spending.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/budget");
                    onClose();
                  }}
                  className="btn-primary"
                >
                  Go to Budget Page
                </button>
                <p className="text-sm text-gray-500">
                  You already have an "Other" category for uncategorized
                  transactions. Create more categories to better organize your
                  spending.
                </p>
              </div>
            </div>
          ) : totalTransactionCount === 0 ? (
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
                  Upload Summary ({fileNames.length} file
                  {fileNames.length !== 1 ? "s" : ""})
                </h3>
                {fileNames.map((fileName, index) => (
                  <div
                    key={index}
                    className={`${
                      index > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="col-span-2">
                        <span className="text-gray-500 text-ellipsis">
                          File:
                        </span>
                        <span className="ml-2 font-medium">{fileName}</span>
                        {accountType && (
                          <span className="ml-2 text-xs text-gray-500 uppercase">
                            ({accountType})
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500">Total Parsed:</span>
                        <span className="ml-2 font-medium">
                          {totalTransactionCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Errors */}
              {uploadResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-800 mb-2">Warnings</h3>
                  {uploadResults.errors.map((error, index) => {
                    return (
                      error.length > 0 && (
                        <ul className="text-sm text-red-700 space-y-1 mt-1">
                          <li key={index}>• {error}</li>
                        </ul>
                      )
                    );
                  })}
                </div>
              )}

              {/* Transaction Preview */}
              {totalTransactionCount > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Transaction Preview
                  </h3>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {uploadResults.transactions.map((transaction, index) => (
                      <div
                        key={index}
                        className={`p-3 border-b border-gray-100 last:border-b-0 bg-white`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {transaction.merchant}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.date} • {transaction.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-medium ${
                                transaction.amount < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              ${Math.abs(transaction.amount).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                {totalTransactionCount > 0 && (
                  <button
                    onClick={handleConfirmImport}
                    className="btn-primary"
                    disabled={uploading}
                  >
                    {uploading
                      ? "Importing..."
                      : `Import ${totalTransactionCount} Transactions`}
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
