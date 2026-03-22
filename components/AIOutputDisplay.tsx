'use client';

/**
 * AI Output Display — shows the FULL AI output, no truncation.
 * Reviewer must see exactly what was hashed.
 */
interface AIOutputDisplayProps {
  aiOutput: string;
  aiTool: string;
  outputHash: string;
}

export function AIOutputDisplay({ aiOutput, aiTool, outputHash }: AIOutputDisplayProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-gray-700">{aiTool}</span>
          <span className="text-xs text-gray-400">AI Output</span>
        </div>
        <span className="text-xs font-mono text-gray-400 truncate max-w-xs" title={outputHash}>
          SHA-256: {outputHash.slice(0, 16)}…
        </span>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
          {aiOutput}
        </pre>
      </div>
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
        <p className="text-xs text-yellow-700">
          You are reviewing the exact output that will be cryptographically hashed.
          Scroll to read the complete response before deciding.
        </p>
      </div>
    </div>
  );
}
