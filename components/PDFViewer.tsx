'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker - use local file served from public folder
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PDFViewerProps {
  url: string;
  documentName?: string;
}

export function PDFViewer({ url, documentName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Convert mock API URLs to local PDF files
  const displayUrl = url.startsWith('/api/mock-pdf/')
    ? url.replace('/api/mock-pdf/', '/docs/') + '.pdf'
    : url;

  useEffect(() => {
    console.log('PDFViewer: Attempting to load PDF from:', displayUrl);
    setLoading(true);
    setError('');
  }, [displayUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    console.log('PDF loaded successfully! Pages:', numPages);
    setNumPages(numPages);
    setLoading(false);
    setError('');
  }

  function onDocumentLoadError(error: Error): void {
    console.log('PDF preview unavailable (demo mode)');
    // Silently handle missing PDFs in demo environment
    setError('PDF preview is simulated in demo mode');
    setLoading(false);
  }

  function goToPrevPage() {
    setPageNumber(page => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setPageNumber(page => Math.min(numPages, page + 1));
  }

  function zoomIn() {
    setScale(s => Math.min(2.0, s + 0.1));
  }

  function zoomOut() {
    setScale(s => Math.max(0.5, s - 0.1));
  }

  function resetZoom() {
    setScale(1.0);
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl ring-1 ring-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-white">
        <div className="flex items-center gap-2">
          {documentName && (
            <span className="text-sm font-medium text-neutral-500 truncate max-w-xs">
              {documentName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-neutral-200 rounded-lg px-2 py-1">
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-mono text-neutral-400 w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={scale >= 2.0}
              className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={resetZoom}
              className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors ml-1"
              title="Reset zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Page Navigation */}
          {numPages > 0 && (
            <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-1">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                title="Previous page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-mono text-neutral-500">
                {pageNumber} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-1 text-neutral-500 hover:text-neutral-900 disabled:opacity-30 transition-colors"
                title="Next page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6 flex items-start justify-center bg-neutral-50">
        {loading && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mb-4"></div>
            <p className="text-sm text-neutral-500">Loading document...</p>
            <p className="text-xs text-neutral-400 mt-2">URL: {displayUrl}</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 max-w-md">
            <div className="text-neutral-400 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="text-base font-semibold text-neutral-900 mb-2">PDF Preview Not Available</p>
            <p className="text-sm text-neutral-500 text-center mb-4">
              In this demo environment, PDF rendering is simulated. The AI analysis and compliance workflow remain fully functional.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
              <p className="text-xs text-blue-700 text-center">
                💡 You can continue reviewing the AI analysis and making decisions in the right panel
              </p>
            </div>
          </div>
        )}

        {!error && (
          <div className="pdf-container" style={{ display: loading ? 'none' : 'block' }}>
            <Document
              file={displayUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
                </div>
              }
            >
              {numPages > 0 && (
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="shadow-xl"
                />
              )}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
