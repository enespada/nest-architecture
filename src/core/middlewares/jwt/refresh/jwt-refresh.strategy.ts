import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Observable, firstValueFrom } from 'rxjs';
import { TokenPayload } from '../dto/token.dto';
import environment from '@environments/environment';
import { UsersService } from '@application/users/users.service';
import { User } from '@controller/users/entities/user.entity';
import { ErrorDTO } from '@core/response/dto/error.dto';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt.refresh',
) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      passReqToCallback: true,
      secretOrKeyProvider: async (
        request,
        rawJwtToken: string,
        done: (...any) => any,
      ) => {
        request['token'] = rawJwtToken;
        done(null, environment().httpConfig.token.secret);
      },
      ignoreExpiration: false,
    });
  }

  public async validate(
    request: Request,
    decodedToken: TokenPayload,
  ): Promise<User> {
    if (!decodedToken?.refresh)
      throw new HttpException(
        'Bearer Token must be a refresh token',
        HttpStatus.FORBIDDEN,
      );

    const user: User = await firstValueFrom(
      this.usersService.findOne({
        where: { id: decodedToken?.user?.id },
      }) as Observable<User>,
    );

    if (!user)
      throw new HttpException(
        { name: 'Forbidden', message: 'User token not found' } as ErrorDTO,
        HttpStatus.FORBIDDEN,
      );

    request['user'] = user;

    return request['user'];
  }
}
