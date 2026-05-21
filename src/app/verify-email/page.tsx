"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Pill, CheckCircle, XCircle } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setStatus("success");
          setMessage("Your email is verified. You can sign in now.");
          setTimeout(() => router.replace("/login"), 3000);
        } else {
          setStatus("error");
          setMessage(data.error ?? "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20">
          {status === "success" ? (
            <CheckCircle className="h-8 w-8 text-accent" />
          ) : status === "error" ? (
            <XCircle className="h-8 w-8 text-danger" />
          ) : (
            <Pill className="h-8 w-8 text-accent animate-pulse" />
          )}
        </div>
        <CardTitle>Email verification</CardTitle>
        <CardDescription className="mt-2">
          {status === "loading" ? "Verifying your email…" : message}
        </CardDescription>
        {status !== "loading" && (
          <Link href="/login" className="mt-6 inline-block">
            <Button>Go to sign in</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
