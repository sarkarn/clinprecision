import emailjs from '@emailjs/browser';

/**
 * EmailJS Service for sending emails from frontend
 * 
 * Setup Instructions:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template
 * 4. Get your Public Key, Service ID, and Template ID
 * 5. Add these to your environment variables or config
 */

// EmailJS Configuration
// NOTE: These values need to be configured in EmailJS dashboard
const EMAILJS_CONFIG = {
    PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'YOUR_EMAILJS_PUBLIC_KEY',
    SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'YOUR_EMAILJS_SERVICE_ID',
    TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'YOUR_EMAILJS_TEMPLATE_ID'
};

/**
 * Initialize EmailJS with public key
 */
const initializeEmailJS = () => {
    if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
};

/**
 * Send demo request email using EmailJS
 * @param {Object} formData - Demo request form data
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendDemoRequestEmail = async (formData) => {
    // Initialize EmailJS if not already done
    initializeEmailJS();

    // Check if EmailJS is properly configured
    if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY' || 
        EMAILJS_CONFIG.SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID' ||
        EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_EMAILJS_TEMPLATE_ID') {
        
        // For development, log the request and simulate success
        console.log('📧 Demo Request Email (Development Mode)');
        console.log('To: naren.sarkar@gmail.com, mahua.naren@gmail.com');
        console.log('Subject: New Demo Request from ClinPrecision');
        console.log('Form Data:', formData);
        
        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return mock success response
        return {
            status: 200,
            text: 'Email sent successfully (development mode)'
        };
    }

    // Prepare email template parameters
    const templateParams = {
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
        `.trim()
    };

    try {
        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );

        console.log('✅ Demo request email sent successfully:', response);
        return response;

    } catch (error) {
        console.error('❌ Failed to send demo request email:', error);
        throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
};

/**
 * Test EmailJS configuration
 * @returns {Promise<boolean>} - Returns true if configuration is valid
 */
export const testEmailJSConfiguration = async () => {
    try {
        initializeEmailJS();
        
        // Check if configuration keys are set
        if (EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
            console.warn('⚠️ EmailJS PUBLIC_KEY not configured');
            return false;
        }
        
        if (EMAILJS_CONFIG.SERVICE_ID === 'YOUR_EMAILJS_SERVICE_ID') {
            console.warn('⚠️ EmailJS SERVICE_ID not configured');
            return false;
        }
        
        if (EMAILJS_CONFIG.TEMPLATE_ID === 'YOUR_EMAILJS_TEMPLATE_ID') {
            console.warn('⚠️ EmailJS TEMPLATE_ID not configured');
            return false;
        }

        console.log('✅ EmailJS configuration looks valid');
        return true;
        
    } catch (error) {
        console.error('❌ EmailJS configuration test failed:', error);
        return false;
    }
};

// Export configuration for debugging
export const getEmailJSConfig = () => ({
    ...EMAILJS_CONFIG,
    // Don't expose the actual public key in logs
    PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY ? `${EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 8)}...` : 'Not set'
});

export default {
    sendDemoRequestEmail,
    testEmailJSConfiguration,
    getEmailJSConfig
};