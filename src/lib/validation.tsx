import { type ReactNode } from "react";

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email) return { valid: false, message: "Email wajib diisi" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, message: "Format email tidak valid" };
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: "Password wajib diisi" };
  if (password.length < 6) return { valid: false, message: "Password minimal 6 karakter" };
  return { valid: true };
}

export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || !value.trim()) return { valid: false, message: `${fieldName} wajib diisi` };
  return { valid: true };
}

export function validateNumber(value: string, fieldName: string): ValidationResult {
  if (!value) return { valid: false, message: `${fieldName} wajib diisi` };
  if (isNaN(Number(value)) || Number(value) <= 0) return { valid: false, message: `${fieldName} harus angka positif` };
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
