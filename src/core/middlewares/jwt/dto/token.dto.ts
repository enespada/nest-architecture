import { User } from '@domain/user/models/user.model';

export interface TokenPayload {
  user: User;
  refresh?: boolean;
  resetPassword?: boolean;
}
