import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

@ValidatorConstraint({ name: 'customText', async: false })
export class StringDatetime implements ValidatorConstraintInterface {
  validate(text: string) {
    return moment(text, 'YYYY-MM-DD', true).isValid();
  }

  defaultMessage(args: ValidationArguments) {
    return `Incorrect datetime value '${args.value}'`;
  }
}
