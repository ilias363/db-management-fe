"use client";

import { login } from "@/lib/actions/auth";
import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { ErrorMessage } from "@/components/common";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginForm() {
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get("expiredsession") === "true";
  const [state, loginAction] = useActionState(login, undefined);

  return (
    <form action={loginAction} className="space-y-4">
      {sessionExpired && (
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
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Enter your username"
          required
          className="h-11"
        />
        <ErrorMessage error={state?.errors?.username} />
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
        />
        <ErrorMessage error={state?.errors?.password} />
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}
