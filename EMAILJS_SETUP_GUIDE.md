# EmailJS Setup Guide for ClinPrecision Request Demo

This guide explains how to set up EmailJS to enable frontend-only email sending for demo requests.

## Overview

The Request Demo functionality uses EmailJS to send emails directly from the frontend without requiring a backend email service. This is perfect for:
- Static websites
- Frontend-only applications
- Quick prototyping
- Avoiding backend email infrastructure

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Create an Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider:
   - **Gmail**: You'll need to use App Passwords (not your regular password)
   - **Outlook**: Use your regular Microsoft credentials
5. Test the service connection
6. Note down your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template structure:

```html
Subject: New Demo Request from ClinPrecision - {{from_name}}

Hello Team,

A new demo request has been submitted through the ClinPrecision login page.

Contact Details:
- Name: {{from_name}}
- Organization: {{organization_name}}
- Email: {{organization_email}}
- Phone: {{contact_phone}}

Request Details:
- Date: {{request_date}}
- Time: {{request_time}}

Please follow up with this prospect within 1-2 business days.

Best regards,
ClinPrecision Demo System
```

4. Configure recipients:
   - To Email: `naren.sarkar@gmail.com`
   - CC/BCC: `mahua.naren@gmail.com`
5. Save the template and note down your **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `user_abcXYZ123`)

## Step 5: Configure Environment Variables

Create a `.env` file in your frontend project root with:

```env
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key_here
REACT_APP_EMAILJS_SERVICE_ID=your_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id_here
```

**Example:**
```env
REACT_APP_EMAILJS_PUBLIC_KEY=user_abcXYZ123
REACT_APP_EMAILJS_SERVICE_ID=service_gmail_123
REACT_APP_EMAILJS_TEMPLATE_ID=template_demo_request
```

## Step 6: Test the Setup

1. Start your React application: `npm start`
2. Go to the login page
3. Click "Request Demo"
4. Fill out the form and submit
5. Check the EmailJS dashboard for email logs
6. Verify emails are received at the target addresses

## Development Mode

If EmailJS is not configured, the system runs in development mode:
- Form submission works normally
- Email sending is simulated (logged to console)
- Success messages are shown
- No actual emails are sent

## Security Considerations

1. **Public Key Safety**: The EmailJS public key is safe to expose in frontend code
2. **Rate Limiting**: EmailJS has built-in rate limiting (200 emails/month on free plan)
3. **Template Validation**: EmailJS validates templates server-side
4. **Spam Protection**: EmailJS includes spam protection mechanisms

## Troubleshooting

### Common Issues:

1. **"User ID is required"**
   - Check that `REACT_APP_EMAILJS_PUBLIC_KEY` is set correctly
   - Verify the public key is valid in EmailJS dashboard

2. **"Service not found"**
   - Verify `REACT_APP_EMAILJS_SERVICE_ID` matches your service ID
   - Check that the email service is active

3. **"Template not found"**
   - Verify `REACT_APP_EMAILJS_TEMPLATE_ID` matches your template ID
   - Check that the template is published (not draft)

4. **Emails not received**
   - Check spam folders
   - Verify recipient emails in template configuration
   - Check EmailJS dashboard for delivery logs

### Debug Mode:

Check browser console for detailed logging:
```javascript
// The EmailService logs all attempts and results
console.log('📧 Demo Request Email (Development Mode)');
```

## Production Deployment

For production deployment:

1. Set environment variables in your hosting platform:
   - **Vercel**: Add to project settings
   - **Netlify**: Add to site settings
   - **Railway**: Add to environment variables

2. Test the production deployment thoroughly

3. Monitor EmailJS usage in the dashboard

## Alternative Solutions

If EmailJS doesn't meet your needs, consider:

1. **Formspree**: Form handling service
2. **Netlify Forms**: Built-in form handling for Netlify sites
3. **Backend Email Service**: Implement proper backend email service
4. **Mailto Links**: Simple email client redirection

## Support

- EmailJS Documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
- EmailJS Support: Available through their dashboard
- ClinPrecision Team: Contact your development team for assistance