import { SessionService } from '@core/services/session/session.service';
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

@ValidatorConstraint({ name: 'customText', async: false })
@Injectable()
export class PasswordEncrypted implements ValidatorConstraintInterface {
  constructor(private sessionservice: SessionService) {}
  validate(text: string) {
    return this.sessionservice.isEncrypted(text);
  }

  defaultMessage(args: ValidationArguments) {
    return `Password must be encrypted. Value: '${args.value}'`;
  }
}
