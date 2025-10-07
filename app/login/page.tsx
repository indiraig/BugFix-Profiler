// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  const handleLoginSuccess = () => {
    // ✅ after login, redirect to root page.tsx
    router.push("/");
  };

  return <LoginForm onSuccess={handleLoginSuccess} />;
}
