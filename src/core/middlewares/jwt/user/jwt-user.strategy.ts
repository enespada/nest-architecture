import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../dto/token.dto';
import environment from '@environments/environment';
import { ErrorDTO } from '@core/response/dto/error.dto';
import { UserService } from '@application/user/user.service';
import { User } from '@domain/user/entities/user.entity';

@Injectable()
export class JwtUserStrategy extends PassportStrategy(Strategy, 'jwt.user') {
  constructor(private usersService: UserService) {
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
    if (decodedToken?.refresh || decodedToken?.resetPassword)
      throw new HttpException(
        'Bearer Token must be an access token',
        HttpStatus.FORBIDDEN,
      );

    const user: User = await this.usersService.findOne({
      where: { id: decodedToken?.user?.id },
    });

    if (!user)
      throw new HttpException(
        { name: 'Forbidden', message: 'User token not found' } as ErrorDTO,
        HttpStatus.FORBIDDEN,
      );

    request['user'] = user;

    return request['user'];
  }
}
