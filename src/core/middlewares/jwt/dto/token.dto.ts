import { User } from '@controller/users/entities/user.entity';

export interface TokenPayload {
  user: User;
  refresh?: boolean;
  resetPassword?: boolean;
}
