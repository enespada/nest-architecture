import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MailOptions, TransportOptions } from './dto/mail.dto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailConfigDTO } from '@environments/dto/mail-config.dto';

@Injectable()
export class MailService {
  transporter: nodemailer.Transporter;
  transportOptions: MailConfigDTO;

  constructor(private config: ConfigService) {
    this.transportOptions = this.config.get<MailConfigDTO>('mailConfig');
    this.transporter = nodemailer.createTransport(this.transportOptions);
  }

  setTransporter(options: MailConfigDTO) {
    this.transporter = nodemailer.createTransport(options);
  }

  sendMail(options: MailOptions) {
    if (!this.transporter)
      throw new HttpException(
        'You must set a transport before send an email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    if (!options.from) options.from = this.transportOptions.auth.user;

    this.transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(error);
        return error;
      }
      return '¡E-mail enviado correctamente!';
    });
  }
}
