import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 5,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 1,
}

export enum NodeType {
  Initial = "Initial",
  Manual_Trigger = "Manual_Trigger",
  HTTP_Request = "HTTP_Request",
}

export enum CredentialType {
  Gemini = "Gemini",
  OpenAI = "OpenAI",
  Anthropic = "Anthropic",
}
