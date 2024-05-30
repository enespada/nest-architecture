import { Readable } from 'stream';

export interface MailOptions {
  to: string;
  from?: string;
  subject?: string;
  html?: string;
  attachments?: Array<Attachments>;
  contentBase64?: string;
  fileName?: string;
}

export interface Attachments {
  filename: string;
  contentType: ContentTypes;
  content: Buffer | Readable;
}

const ContentTypes = {
  pdf: 'application/pdf',
  png: 'image/png',
  mp4: 'video/mp4',
} as const;

export type ContentTypes = (typeof ContentTypes)[keyof typeof ContentTypes];

export interface TransportOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls: {
    ciphers: 'SSLv3';
  };
}
