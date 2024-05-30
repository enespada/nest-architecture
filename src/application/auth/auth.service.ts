import { MailService } from '@core/services/mail/mail.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { mergeMap, of } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDTO } from '@controller/auth/dto/login.dto';
import { User } from '@controller/users/entities/user.entity';
import { UserToken } from '@controller/auth/dto/token.dto';
import { SessionService } from '@core/services/session/session.service';
import { RegisterDto } from '@controller/auth/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  login(body: LoginDTO) {
    return this.usersService
      .findOne({
        where: {
          email: body.email,
        },
      })
      .pipe(
        mergeMap((user: User) => {
          if (!user)
            throw new HttpException(
              'User or password incorrect',
              HttpStatus.FORBIDDEN,
            );

          const decriptedBodyPassword = this.sessionService.decrypt(
            body.password,
          );
          const decriptedUserPassword = this.sessionService.decrypt(
            user.password,
          );

          if (decriptedBodyPassword !== decriptedUserPassword)
            throw new HttpException(
              'User or password incorrect',
              HttpStatus.FORBIDDEN,
            );

          return this.refresh(user);
        }),
      );
  }

  refresh(user: User, token?: string) {
    const accessToken = this.sessionService.createToken(user);
    const refreshToken = token ?? this.sessionService.createToken(user, true);
    return of({ accessToken, refreshToken } as UserToken);
  }

  register(body: RegisterDto) {
    return this.usersService.create(body);
  }
}
