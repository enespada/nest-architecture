import { User } from '@controller/users/entities/user.entity';
import { HttpConfigDTO } from '@environments/dto/http-config.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AES, enc } from 'crypto-js';

@Injectable()
export class SessionService {
  private httpConfig: HttpConfigDTO;

  constructor(private readonly configService: ConfigService) {
    this.httpConfig = this.configService.get<HttpConfigDTO>('httpConfig');
  }

  /**
   * Generates brand new user access token
   * @param {Employee} user User data
   * @returns {string} User access token
   */
  createToken(user: User, refresh?: boolean, resetPassword?: boolean): string {
    const expiresIn = refresh
      ? this.httpConfig.token.refreshExpirationTime
      : resetPassword
      ? this.httpConfig.token.passwordExpirationTime
      : this.httpConfig.token.expirationTime;

    const token = jwt.sign(
      { user, refresh, resetPassword },
      this.httpConfig.token.secret,
      {
        expiresIn,
      },
    );

    return token;
  }

  isEncrypted(value: string) {
    return !(this.decrypt(value) === '');
  }

  encrypt(value: string) {
    return AES.encrypt(value, this.httpConfig.encriptionKey).toString();
  }

  decrypt(value: string) {
    return AES.decrypt(value, this.httpConfig.encriptionKey).toString(enc.Utf8);
  }
}
