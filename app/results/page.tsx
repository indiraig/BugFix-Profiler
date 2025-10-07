"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import '../globals.css';

export default function ResultsPage() {
  const router = useRouter();
  const [bugResult, setBugResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load result from session storage
    const stored = sessionStorage.getItem("bugResult");
    if (!stored) {
      setError("⚠️ No bug data found. Please resubmit.");
      return;
    }

    try {
      const result = JSON.parse(stored);
      setBugResult(result);
    } catch (e) {
      setError("⚠️ Invalid bug data. Please resubmit.");
    }
  }, []);

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50" 
       style={{ backgroundImage: "url('/bgdimg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!bugResult) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-600 mb-4">Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50">
      {/* ✅ White card background for consistency */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col items-center space-y-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-green-600">
          ✅ Bug Fix Pipeline Complete
        </h1>

        {/* Result Summary */}
        <div className="bg-gray-100 p-4 rounded-xl w-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            🤖 AI Processing Result:
          </h2>
          <p className="text-gray-600 text-sm mb-2">
            {bugResult.message}
          </p>
          {bugResult.branch && (
            <p className="text-gray-600 text-sm">
              <strong>Branch:</strong> {bugResult.branch}
            </p>
          )}
          
          {/* AI Analysis */}
          {bugResult.ai_analysis && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🧠 AI Analysis:</h3>
              <p className="text-blue-700 text-sm mb-2">
                {bugResult.ai_analysis.analysis || "No analysis available"}
              </p>
              <p className="text-blue-700 text-sm">
                <strong>Confidence:</strong> {bugResult.ai_analysis.confidence || "Unknown"}
              </p>
            </div>
          )}
          
          {/* Test Results */}
          {bugResult.test_results && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">🧪 Test Results:</h3>
              <p className="text-green-700 text-sm">
                <strong>Status:</strong> {bugResult.test_results.success ? "✅ Passed" : "❌ Failed"}
              </p>
              {bugResult.test_results.output && (
                <pre className="text-xs text-green-600 mt-1 bg-green-100 p-2 rounded overflow-x-auto">
                  {bugResult.test_results.output}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* PR Button - Only show if PR was created */}
        {bugResult.pr_url ? (
          <button
            onClick={() => window.open(bugResult.pr_url, "_blank")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
          >
            View Pull Request
          </button>
        ) : (
          <div className="bg-yellow-100 p-4 rounded-xl w-full text-center">
            <p className="text-yellow-800">
              No pull request was created. This might be because the bug text wasn't found in the file or no changes were needed.
            </p>
          </div>
        )}

        {/* Back to Home */}
        <button
          onClick={() => router.push("/")}
          className="mt-4 text-blue-600 underline hover:text-blue-800"
        >
          ⬅️ Submit Another Bug
        </button>
      </div>
    </main>
  );
}
