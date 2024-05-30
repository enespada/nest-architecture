import { RolesEnum } from '@core/constants/constants';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RolesEnum[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const role = request?.user?.decodedToken?.admin
      ? RolesEnum.ADMIN
      : RolesEnum.USER;

    return roles.includes(role);
  }
}
