import { MailService } from '@core/services/mail/mail.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDTO as LoginDto } from '@controller/auth/dto/login.dto';
import { User } from '@domain/user/entities/user.entity';
import { UserToken } from '@controller/auth/dto/token.dto';
import { SessionService } from '@core/services/session/session.service';
import { RegisterDTO } from '@controller/auth/dto/register.dto';
import { UserService } from '@application/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user: User = await this.usersService.findOne({
      where: {
        email: loginDto.email,
      },
      select: { password: true },
    });

    if (!user)
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );

    // const decriptedBodyPassword = this.sessionService.decrypt(
    //   loginDto.password,
    // );
    const decriptedUserPassword = this.sessionService.decrypt(user.password);

    if (loginDto.password !== decriptedUserPassword)
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );

    return this.refresh(user);
  }

  refresh(user: User, token?: string) {
    const accessToken = this.sessionService.createToken(user);
    const refreshToken = token ?? this.sessionService.createToken(user, true);
    return { accessToken, refreshToken } as UserToken;
  }

  async register(registerDto: RegisterDTO) {
    return await this.usersService.create(registerDto);
  }
}
