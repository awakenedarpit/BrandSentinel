import React, { useState, useRef } from 'react';
import { ingestDocumentFile } from '../../modules/ai/aiService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionComplete: (docName: string, ruleCount: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onExtractionComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);
    setIsProcessing(true);
    setProgressText(`Reading ${file.name} (${Math.round(file.size / 1024)} KB)...`);

    try {
      setTimeout(() => {
        setProgressText('Extracting text and page boundaries...');
      }, 400);

      setTimeout(() => {
        setProgressText('Chunking into semantic passages & generating Gemini 768-dim embeddings...');
      }, 1000);

      const result = await ingestDocumentFile(file);

      if (result.success) {
        setProgressText('Indexed into pgvector knowledge base!');
        setTimeout(() => {
          setIsProcessing(false);
          onExtractionComplete(file.name, Math.max(1, Math.round((result.chunkCount || 2) / 2)));
          onClose();
        }, 500);
      } else {
        setIsProcessing(false);
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Failed to ingest document.');
    }
  };


  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-surface-container-lowest shadow-2xl p-space-xl flex flex-col gap-space-md border border-outline-variant/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[24px]">post_add</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Import Brand Guidelines
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Live RAG PDF, TXT, and Markdown Ingestion with Gemini Embeddings
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-error mt-0.5">error</span>
            <div>
              <p className="font-semibold text-error">Ingestion Notice</p>
              <p className="text-[12px] mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />

        {/* Dropzone Area */}
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
          className="p-6 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-[40px] text-primary mb-2">upload_file</span>
          <p className="font-body-md text-body-md font-semibold text-on-surface">
            Drop your compliance guidelines or brand stylebook here
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mt-1">
            Supported: PDF, Markdown (.md), and TXT files up to 25MB. Text will be chunked and embedded using Gemini.
          </p>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isProcessing}
            className="mt-4 px-4 py-2 rounded-lg bg-primary-container text-on-primary font-body-sm text-body-sm font-semibold shadow-sm hover:bg-secondary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">folder_open</span>
            <span>Select File from Device</span>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3.5 rounded-xl bg-primary-fixed/30 border border-primary/20 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            <p className="font-body-sm text-body-sm text-primary font-medium">{progressText}</p>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm font-semibold hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary font-body-sm text-body-sm font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">bolt</span>
            <span>{isProcessing ? 'Ingesting with Gemini...' : 'Choose your own document'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
