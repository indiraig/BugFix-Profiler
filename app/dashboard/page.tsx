"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GitHubConfigForm from "./GitHubConfigForm";

const steps = ["🤖 AI Analyzing Bug", "🔧 Generating Fix", "🧪 Running Tests", "📝 Creating PR"];

export default function Dashboard() {
  const router = useRouter();

  const [actualBug, setActualBug] = useState("");
  const [expectedFix, setExpectedFix] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  
  // User login and GitHub repo state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [githubRepo, setGithubRepo] = useState("");
  const [showGitHubForm, setShowGitHubForm] = useState(false);
  const [githubRepos, setGithubRepos] = useState<string[]>([]);

  // Check login status and get GitHub repo on component mount
  useEffect(() => {
    const loggedInStatus = sessionStorage.getItem("isLoggedIn");
    const storedRepos = sessionStorage.getItem("githubRepos");
    const storedRepo = sessionStorage.getItem("githubRepo");
    
    if (loggedInStatus === "true") {
      setIsLoggedIn(true);
    }
    
    if (storedRepos) {
      setGithubRepos(JSON.parse(storedRepos));
    } else if (storedRepo) {
      setGithubRepos([storedRepo]);
    } else {
      // Default to the repo from environment
      setGithubRepos(["indiraig/Auto-Hot-fix"]);
    }
  }, [githubRepos]);

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("githubRepo");
    sessionStorage.removeItem("githubRepos");
    setIsLoggedIn(false);
    setGithubRepos([]);
    router.push("/login");
  };

  // Handle GitHub configuration completion
  const handleGitHubConfigComplete = (repoData: any) => {
    if (repoData) {
      setGithubRepos(prev => [...prev, repoData.repoName]);
    }
    setShowGitHubForm(false);
  };


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
      
      // Instead of redirecting, show processing content
      setShowProcessing(true);
      setActiveStep(0);
      
      // Start the step animation
      const timer = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= steps.length - 1) {
            clearInterval(timer);
            setTimeout(() => router.push("/results"), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);

    } catch (error: any) {
      console.error("❌ Error submitting bug report:", error);
      alert(`Failed to submit bug report: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200" style={{
        backgroundImage: "url('/bgdimg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left spacer for balance */}
            <div className="w-32"></div>
            
            {/* Center - Title */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-white">🤖 BugFix Profiler</h1>
            </div>
            
            {/* Right - User Avatar and GitHub Repo */}
            <div className="flex items-center space-x-4">
              {/* GitHub Repo Display */}
              {isLoggedIn && githubRepos.length > 0 && (
                <div className="flex items-center space-x-2">
                  {githubRepos.map((repo, index) => (
                    <div key={index} className="bg-white px-3 py-1 rounded-lg shadow-sm">
                      <a 
                        href={`https://github.com/${repo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-800 hover:text-blue-600 text-sm font-medium"
                      >
                        📁 {repo}
                      </a>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add GitHub Repo Button */}
              <button 
                onClick={() => setShowGitHubForm(true)}
                className="bg-white px-4 py-2 rounded-lg shadow-sm text-blue-800 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                + Add GitHub Repo
              </button>
              
              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white">Welcome, User</span>
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-start py-12 px-4">
        <div className="flex w-full max-w-7xl mx-auto space-x-8">
          {/* Left Side - Form */}
          <div className="flex-1 max-w-2xl">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
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
                    disabled={showProcessing}
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
                    disabled={showProcessing}
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
                    disabled={showProcessing}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || showProcessing}
                  className={`w-full ${
                    loading || showProcessing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-semibold py-3 px-4 rounded-xl transition duration-300`}
                >
                  {loading ? "Processing..." : showProcessing ? "Processing..." : "Submit Bug"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Processing Content or GitHub Form */}
          <div className="flex-1">
            {showProcessing ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Processing Your Bug Report...
                  </h2>
                  <p className="text-gray-600">Our AI is working on your bug fix</p>
                </div>

                {/* Animated step indicators */}
                <div className="flex flex-col items-center w-full space-y-5">
                  {steps.map((step, index) => (
                    <div key={index} className={`flex items-center space-x-4 w-full max-w-md ${
                      index <= activeStep ? 'opacity-100' : 'opacity-40'
                    } transition-opacity duration-300`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index < activeStep ? 'bg-green-500' : 
                        index === activeStep ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                      } transition-colors duration-300`}>
                        {index < activeStep ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">{step}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress indicator */}
                <div className="mt-8">
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Step {activeStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
            ) : showGitHubForm ? (
              <GitHubConfigForm onComplete={handleGitHubConfigComplete} />
            ) : (
              <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Submit a Bug</h3>
                <p className="text-gray-600">Fill out the form on the left to get started with AI-powered bug fixing!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto" style={{
        backgroundImage: "url('/bgdimg.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
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