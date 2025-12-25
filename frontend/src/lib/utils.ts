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
  GOOGLE_FORM_TRIGGER = "GOOGLE_FORM_TRIGGER",
  GEMINI = "GEMINI",
  ANTHROPIC = "ANTHROPIC",
  OPEN_AI = "OPEN_AI",
  DISCORD = "DISCORD",
  SLACK = "SLACK",
}

export enum CredentialType {
  GEMINI = "GEMINI",
  OPEN_AI = "OPEN_AI",
  ANTHROPIC = "ANTHROPIC",
  DISCORD = "DISCORD",
  SLACK = "SLACK",
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

export const generateGoogleFormScript = (
  webhookUrl: string,
) => `function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // Build responses object
  var responses = {};
  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];
    responses[itemResponse.getItem().getTitle()] = itemResponse.getResponse();
  }

  // Prepare webhook payload
  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses
  };

  // Send to webhook
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  var WEBHOOK_URL = '${webhookUrl}';

  try {
    UrlFetchApp.fetch(WEBHOOK_URL, options);
  } catch(error) {
    console.error('Webhook failed:', error);
  }
}`;