import { type ReactNode } from "react";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) return { valid: false, message: "Email is required" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { valid: false, message: "Invalid email format" };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: "Password is required" };
  if (password.length < 6)
    return { valid: false, message: "Password must be at least 6 characters" };
  return { valid: true };
}

export function validateRequired(
  value: string,
  fieldName: string,
): ValidationResult {
  if (!value || !value.trim())
    return { valid: false, message: `${fieldName} is required` };
  return { valid: true };
}

export function validateNumber(
  value: string,
  fieldName: string,
): ValidationResult {
  if (!value) return { valid: false, message: `${fieldName} is required` };
  if (isNaN(Number(value)) || Number(value) <= 0)
    return { valid: false, message: `${fieldName} must be a positive number` };
  return { valid: true };
}

export type FieldErrors = Record<string, string | undefined>;

export function getErrorClass(error?: string): string {
  return error ? "border-red-400 bg-red-50 focus:ring-red-400" : "";
}

export function getErrorText(error?: string): ReactNode {
  if (!error) return null;
  return <p className="text-red-500 text-xs mt-1">{error}</p>;
}
