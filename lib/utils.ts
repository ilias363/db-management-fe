import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ActionState } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStateFieldErrors(field: string, state: ActionState | undefined):
  string | string[] | undefined {
  if (state?.errors && typeof state.errors === "object" && field in state.errors) {
    return state.errors[field as keyof typeof state.errors];
  }
  return undefined;
}

export function getStateGeneralErrors(state: ActionState | undefined):
  string | string[] | undefined {
  if (state?.errors && typeof state.errors === "object" && "general" in state.errors) {
    return state.errors["general"];
  }
  return undefined;
}