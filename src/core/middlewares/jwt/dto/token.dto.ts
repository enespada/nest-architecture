export interface TokenPayload {
  sub: string;
  refresh?: boolean;
  resetPassword?: boolean;
}
