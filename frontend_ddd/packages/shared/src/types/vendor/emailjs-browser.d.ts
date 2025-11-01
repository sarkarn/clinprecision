declare module '@emailjs/browser' {
  export interface EmailJSResponseStatus {
    status: number;
    text: string;
  }

  export type EmailJSTemplateParams = Record<string, unknown>;

  export function init(publicKey: string, options?: Record<string, unknown>): void;

  export function send(
    serviceID: string,
    templateID: string,
    templateParams?: EmailJSTemplateParams,
    publicKey?: string
  ): Promise<EmailJSResponseStatus>;

  const emailjs: {
    init: typeof init;
    send: typeof send;
  };

  export default emailjs;
}
