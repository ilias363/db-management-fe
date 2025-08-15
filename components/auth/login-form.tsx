"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import { ErrorMessage } from "@/components/common";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const expired = searchParams.get("expired") === "true";
  const callbackUrl = searchParams.get("callbackUrl");

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setError(null);
      setFieldErrors({});

      const result = await loginAction(undefined, formData);

      if (result.success) {
        const redirectTo = callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/";
        router.push(redirectTo);
        router.refresh();
      } else if (result.errors) {
        setFieldErrors(result.errors);
      } else {
        setError("Login failed. Please try again.");
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {expired && (
        <Alert
          variant="destructive"
          className="flex items-center border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            Your session has expired. Please sign in again to continue.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert
          variant="destructive"
          className="flex items-center border-destructive/50 bg-destructive/10"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-medium">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          required
          className="h-11"
          disabled={isPending}
        />
        <ErrorMessage error={fieldErrors.username} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          className="h-11"
          disabled={isPending}
        />
        <ErrorMessage error={fieldErrors.password} />
      </div>

      <Button type="submit" className="w-full h-11" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
