"use client";
import './globals.css';
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [actualBug, setActualBug] = useState("");
  const [expectedFix, setExpectedFix] = useState("");
  const [file, setFile] = useState<File | null>(null); // ✅ Added file support
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!actualBug || !expectedFix) {
      alert("⚠️ Please fill in both fields before submitting.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Use FormData (multipart/form-data) for FastAPI compatibility
      const formData = new FormData();
      formData.append("actual_bug", actualBug);
      formData.append("expected_fix", expectedFix);
      if (file) formData.append("bug_file", file);

      const response = await fetch("http://127.0.0.1:8001/process-bug", {
        method: "POST",
        body: formData, // ❌ no Content-Type header (browser sets automatically)
      });

      const result = await response.json();
      console.log("📥 Backend result:", result);

      if (!response.ok) {
        // ✅ Show detailed error instead of [object Object]
        alert(`❌ ${result?.detail || JSON.stringify(result)}`);
        return;
      }

      // Save the backend response so processing page can use it
      sessionStorage.setItem("bugResult", JSON.stringify(result));

      // Navigate to processing page
      router.push("/processing");
    } catch (error: any) {
      console.error("❌ Error submitting bug report:", error);
      alert(`Failed to submit bug report: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50"
      style={{
        backgroundImage: "url('/bgdimg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🤖 BugFix Profiler
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Describe a bug and our AI will analyze, fix, test, and create a pull request automatically!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Actual Bug Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Bug Description</label>
            <textarea
              value={actualBug}
              onChange={(e) => setActualBug(e.target.value)}
              placeholder="e.g., 'The add_numbers function returns 2 when adding 5+3 instead of 8'"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring focus:ring-blue-200"
              rows={3}
            />
          </div>

          {/* Expected Fix Field */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Expected Behavior
            </label>
            <textarea
              value={expectedFix}
              onChange={(e) => setExpectedFix(e.target.value)}
              placeholder="e.g., 'The add_numbers function should return 8 when adding 5+3'"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring focus:ring-blue-200"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Attach Bug Report (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full border border-gray-300 rounded-xl p-2"
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
            {loading ? "Submitting..." : "Submit Bug"}
          </button>
        </form>
      </div>
    </div>
  );
}
