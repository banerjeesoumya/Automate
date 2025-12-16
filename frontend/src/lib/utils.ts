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
  GEMINI = "GEMINI",
  OPEN_AI = "OPEN_AI",
  ANTHROPIC = "ANTHROPIC",
}

export interface Credential {
  id: string
  name: string
  value: string
  type: CredentialType

  userId: string

  createdAt: string | Date
  updatedAt: string | Date
}