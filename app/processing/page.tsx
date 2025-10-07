"use client";
import StepIndicator from "@/components/StepIndicator";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import '../globals.css';

const steps = ["🤖 AI Analyzing Bug", "🔧 Generating Fix", "🧪 Running Tests", "📝 Creating PR"];

export default function ProcessingPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load result from session storage
    const stored = sessionStorage.getItem("bugResult");
    if (!stored) {
      setError("⚠️ No bug data found. Please resubmit.");
      return;
    }

    // Animate step-by-step progress
    let timer: NodeJS.Timeout;
    if (activeStep < steps.length - 1) {
      timer = setTimeout(() => setActiveStep((prev) => prev + 1), 1500);
    } else {
      // After final step, go to results page
      timer = setTimeout(() => router.push("/results"), 1500);
    }

    return () => clearTimeout(timer);
  }, [activeStep, router]);

  if (error) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center"
     >
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

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50"
    style={{ backgroundImage: "url('/bgdimg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-xl flex flex-col items-center space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Processing Your Bug Report...
        </h1>

        {/* Animated step indicators */}
        <div className="flex flex-col items-center w-full space-y-5">
          {steps.map((step, index) => (
            <StepIndicator
              key={index}
              step={index + 1}
              label={step}
              active={index === activeStep}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
