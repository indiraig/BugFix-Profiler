// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm"; // Ensure this component handles form submission and calls onSuccess prop after successful login

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // ✅ after login, redirect to the dashboard page
    router.push("/dashboard");
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
}
