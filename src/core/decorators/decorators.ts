import { User } from '@controller/users/entities/user.entity';
import { RolesEnum } from '@core/constants/constants';
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

export const UserToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request?.user?.user;
  },
);

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request?.user.token;
  },
);

export const DecodedToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    return request?.user?.decodedToken;
  },
);

export const Roles = (...roles: RolesEnum[]) => SetMetadata('roles', roles);
