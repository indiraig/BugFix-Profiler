"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TestDashboard() {
  const router = useRouter();

  const [actualBug, setActualBug] = useState("");
  const [expectedFix, setExpectedFix] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actualBug || !expectedFix) {
      alert("⚠️ Please fill in both fields before submitting.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("actual_bug", actualBug);
      formData.append("expected_fix", expectedFix);
      if (file) formData.append("bug_file", file);

      const response = await fetch("http://127.0.0.1:8001/process-bug", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("📥 Backend result:", result);

      if (!response.ok) {
        alert(`❌ ${result?.detail || JSON.stringify(result)}`);
        return;
      }

      sessionStorage.setItem("bugResult", JSON.stringify(result));
      router.push("/processing");
    } catch (error: any) {
      console.error("❌ Error submitting bug report:", error);
      alert(`Failed to submit bug report: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{
      backgroundImage: "url('/bgdimg.webp')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left spacer for balance */}
            <div className="w-10"></div>
            
            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-gray-900">🤖 BugFix Profiler</h1>
            </div>
            
            {/* Right - User Avatar */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Welcome, User</span>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl w-full">
          <p className="text-gray-600 text-center mb-6">
            Describe a bug and our AI will analyze, fix, test, and create a pull request automatically!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Actual Bug Field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Actual Bug</label>
              <textarea
                value={actualBug}
                onChange={(e) => setActualBug(e.target.value)}
                placeholder="e.g., 'The add_numbers function returns 2 when adding 5+3 instead of 8'"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Expected Fix Field */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Expected Behavior
              </label>
              <textarea
                value={expectedFix}
                onChange={(e) => setExpectedFix(e.target.value)}
                placeholder="e.g., 'The add_numbers function should return 8 when adding 5+3'"
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Attach File (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full border border-gray-300 rounded-xl p-2 text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white font-semibold py-3 px-4 rounded-xl transition duration-300`}
            >
              {loading ? "Processing..." : "Submit Bug"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              🤖 <strong>BugFix Profiler</strong> is an AI-powered tool that automatically analyzes bug reports, 
              generates fixes, runs tests, and creates pull requests. Simply describe your bug and expected behavior, 
              and let our intelligent agents handle the rest!
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}