import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = { title: "Sign up — Macroloom" };

export default function SignUpPage() {
  return <SignUpForm />;
}
