// src/types/api/EmailService.types.ts

import { EmailJSResponseStatus } from '@emailjs/browser';

/**
 * EmailJS configuration
 */
export interface EmailJSConfig {
  PUBLIC_KEY: string;
  SERVICE_ID: string;
  TEMPLATE_ID: string;
}

/**
 * Demo request form data
 */
export interface DemoRequestFormData {
  name: string;
  organizationName: string;
  organizationEmail: string;
  contactPhone: string;
}

/**
 * Email template parameters for demo request
 */
export interface DemoRequestTemplateParams extends Record<string, unknown> {
  to_email_1: string;
  to_email_2: string;
  from_name: string;
  organization_name: string;
  organization_email: string;
  contact_phone: string;
  subject: string;
  request_date: string;
  request_time: string;
  message: string;
}

/**
 * Email send response (mock for development mode)
 */
export interface EmailSendResponse {
  status: number;
  text: string;
}

/**
 * EmailJS configuration details (safe for debugging)
 */
export interface EmailJSConfigDetails {
  PUBLIC_KEY: string; // Masked version
  SERVICE_ID: string;
  TEMPLATE_ID: string;
}

/**
 * Email service interface
 */
export interface IEmailService {
  sendDemoRequestEmail(formData: DemoRequestFormData): Promise<EmailSendResponse | EmailJSResponseStatus>;
  testEmailJSConfiguration(): Promise<boolean>;
  getEmailJSConfig(): EmailJSConfigDetails;
}
