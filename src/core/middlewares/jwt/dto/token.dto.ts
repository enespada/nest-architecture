import { User } from '@domain/user/entities/user.entity';

export interface TokenPayload {
  user: User;
  refresh?: boolean;
  resetPassword?: boolean;
}
