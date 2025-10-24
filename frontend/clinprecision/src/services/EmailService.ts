// src/services/EmailService.ts
import emailjs, { EmailJSResponseStatus } from '@emailjs/browser';
import {
  EmailJSConfig,
  DemoRequestFormData,
  DemoRequestTemplateParams,
  EmailSendResponse,
  EmailJSConfigDetails,
  IEmailService,
} from '../types/api/EmailService.types';

/**
 * EmailService - EmailJS integration for sending emails from frontend
 * 
 * Setup Instructions:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template
 * 4. Get your Public Key, Service ID, and Template ID
 * 5. Add these to your environment variables:
 *    - REACT_APP_EMAILJS_PUBLIC_KEY
 *    - REACT_APP_EMAILJS_SERVICE_ID
 *    - REACT_APP_EMAILJS_TEMPLATE_ID
 * 
 * Usage:
 *   import EmailService from './services/EmailService';
 *   await EmailService.sendDemoRequestEmail(formData);
 */

// EmailJS Configuration
// NOTE: These values need to be configured in EmailJS dashboard and .env file
const EMAILJS_CONFIG: EmailJSConfig = {
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'YOUR_EMAILJS_SERVICE_ID',
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'YOUR_EMAILJS_TEMPLATE_ID',
};

/**
 * Initialize EmailJS with public key
 */
const initializeEmailJS = (): void => {
  if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.log('*** EmailService: Initializing EmailJS with public key');
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  } else {
    console.log('*** EmailService: EmailJS not configured, running in development mode');
  }
};

/**
 * Check if EmailJS is properly configured
 */
const isEmailJSConfigured = (): boolean => {
  return (
    EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY' &&
    EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_EMAILJS_TEMPLATE_ID'
  );
};

/**
 * EmailService implementation
 */
const EmailService: IEmailService = {
  /**
   * Send demo request email using EmailJS
   * @param formData - Demo request form data
   * @returns Promise that resolves when email is sent
   */
  sendDemoRequestEmail: async (
    formData: DemoRequestFormData
  ): Promise<EmailSendResponse | EmailJSResponseStatus> => {
    console.log('*** EmailService.sendDemoRequestEmail: Sending demo request email');
    
    // Initialize EmailJS if not already done
    initializeEmailJS();

    // Check if EmailJS is properly configured
    if (!isEmailJSConfigured()) {
      console.log('*** EmailService: Running in DEVELOPMENT MODE (EmailJS not configured)');
      console.log('📧 Demo Request Email (Development Mode)');
      console.log('To: naren.sarkar@gmail.com, mahua.naren@gmail.com');
      console.log('Subject: New Demo Request from ClinPrecision');
      console.log('Form Data:', formData);

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Return mock success response
      return {
        status: 200,
        text: 'Email sent successfully (development mode)',
      };
    }

    // Prepare email template parameters
    const templateParams: DemoRequestTemplateParams = {
      // Recipient emails (configured in EmailJS template)
      to_email_1: 'naren.sarkar@gmail.com',
      to_email_2: 'mahua.naren@gmail.com',

      // Form data
      from_name: formData.name,
      organization_name: formData.organizationName,
      organization_email: formData.organizationEmail,
      contact_phone: formData.contactPhone,

      // Additional template variables
      subject: 'New Demo Request from ClinPrecision',
      request_date: new Date().toLocaleDateString(),
      request_time: new Date().toLocaleTimeString(),

      // Message body (can be customized in EmailJS template)
      message: `
A new demo request has been submitted through the ClinPrecision login page.

Contact Details:
- Name: ${formData.name}
- Organization: ${formData.organizationName}
- Email: ${formData.organizationEmail}
- Phone: ${formData.contactPhone}

Please follow up with this prospect within 1-2 business days.

This request was submitted on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.
      `.trim(),
    };

    try {
      console.log('*** EmailService: Sending email via EmailJS');
      
      // Send email using EmailJS
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ EmailService: Demo request email sent successfully:', response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ EmailService: Failed to send demo request email:', error);
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  },

  /**
   * Test EmailJS configuration
   * @returns Returns true if configuration is valid
   */
  testEmailJSConfiguration: async (): Promise<boolean> => {
    console.log('*** EmailService.testEmailJSConfiguration: Testing configuration');
    
    try {
      initializeEmailJS();

      // Check if configuration keys are set
      if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        console.warn('⚠️ EmailService: PUBLIC_KEY not configured');
        return false;
      }

      if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') {
        console.warn('⚠️ EmailService: SERVICE_ID not configured');
        return false;
      }

      if (EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_EMAILJS_TEMPLATE_ID') {
        console.warn('⚠️ EmailService: TEMPLATE_ID not configured');
        return false;
      }

      console.log('✅ EmailService: Configuration looks valid');
      return true;
    } catch (error) {
      console.error('❌ EmailService: Configuration test failed:', error);
      return false;
    }
  },

  /**
   * Get EmailJS configuration (safe for debugging - PUBLIC_KEY is masked)
   * @returns EmailJS configuration details
   */
  getEmailJSConfig: (): EmailJSConfigDetails => {
    return {
      ...EMAILJS_CONFIG,
      // Don't expose the actual public key in logs
      PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY
        ? `${EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 8)}...`
        : 'Not set',
    };
  },
};

// Export default service
export default EmailService;

// Named exports
export { initializeEmailJS, isEmailJSConfigured };
export const { sendDemoRequestEmail } = EmailService;
export type { IEmailService };
