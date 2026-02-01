"use client";
import { useState } from "react";

interface GitHubConfigFormProps {
  onComplete: (repoData: { repoName: string; repoUrl: string; token: string }) => void;
}

export default function GitHubConfigForm({ onComplete }: GitHubConfigFormProps) {
  const [formData, setFormData] = useState({
    repoName: "",
    repoUrl: "",
    token: ""
  });
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Store the GitHub configuration
      const existingRepos = sessionStorage.getItem("githubRepos");
      const repos = existingRepos ? JSON.parse(existingRepos) : [];
      repos.push(formData.repoName);
      sessionStorage.setItem("githubRepos", JSON.stringify(repos));
      sessionStorage.setItem("githubUrl", formData.repoUrl);
      sessionStorage.setItem("githubToken", formData.token);

      // Call the parent callback
      onComplete(formData);
    } catch (error) {
      console.error("Error saving GitHub configuration:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect GitHub Repository</h2>
        <p className="text-gray-600">Add your GitHub repository details to enable AI-powered bug fixes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Repository Name */}
        <div>
          <label htmlFor="repoName" className="block text-sm font-semibold text-gray-700 mb-2">
            Repository Name
          </label>
          <input
            type="text"
            id="repoName"
            name="repoName"
            placeholder="username/repository"
            value={formData.repoName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Repository URL */}
        <div>
          <label htmlFor="repoUrl" className="block text-sm font-semibold text-gray-700 mb-2">
            Repository URL
          </label>
          <input
            type="url"
            id="repoUrl"
            name="repoUrl"
            placeholder="https://github.com/username/repository"
            value={formData.repoUrl}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* GitHub Token */}
        <div>
          <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
            Personal Access Token
          </label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              id="token"
              name="token"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={formData.token}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 transition-colors"
              title={showToken ? "Hide token" : "Show token"}
            >
              {showToken ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 001.438-.548l-3.434-3.434a3 3 0 00-.548 1.438m.908 5.858A3 3 0 0012 15c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3a3 3 0 00-.548 1.438m5.858.908l-3.434-3.434m0 0a3 3 0 00-1.438-.548m-1.438.548L12 12m0 0l3.434 3.434m-3.434-3.434a3 3 0 01-.548-1.438" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Your token will be stored securely in your browser
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={() => onComplete(null)}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Connecting..." : "Connect Repository"}
          </button>
        </div>
      </form>
    </div>
  );
}