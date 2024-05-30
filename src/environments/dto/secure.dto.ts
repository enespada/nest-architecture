import { Options } from 'express-rate-limit';

export interface SecureDTO {
  rateLimitConfig: Options;
  payloadSizeLimit: string;
}
