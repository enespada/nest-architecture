import { AuthRepository } from '@domain/auth/auth.repository';
import { SessionDevice } from '@domain/auth/models/session-device.model';
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@domain/user/models/user.model';
import { SessionService } from '@core/services/session/session.service';
import { UserService } from '@application/user/user.service';
import { DeleteSessionDevicePayloadDTO } from '@application/auth/dto/delete-session-device-payload.dto';
import { LoginResponseDto } from '@application/auth/dto/login-response.dto';
import { UpsertSessionDevicePayloadDTO } from '@application/auth/dto/upsert-session-device-payload.dto';
import { LoginRequestDTO } from '@application/auth/dto/login-request.dto';
import { RegisterRequestDTO } from '@application/auth/dto/register-request.dto';
import { SignOutRequestDTO } from '@application/auth/dto/sign-out-request.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    @Inject('AuthRepository')
    private readonly authRepository: AuthRepository,
  ) {}

  async login(loginRequestDto: LoginRequestDTO): Promise<LoginResponseDto> {
    const user: User = await this.userService.findOne({
      where: {
        email: loginRequestDto.email,
      },
      select: ['id', 'password'] as (keyof User)[],
    });

    if (!user) {
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    // const decriptedBodyPassword = this.sessionService.decrypt(
    //   loginRequestDto.password,
    // );
    const decriptedUserPassword: string = this.sessionService.decrypt(
      user.password,
    );

    if (loginRequestDto.password !== decriptedUserPassword) {
      throw new HttpException(
        'User or password incorrect',
        HttpStatus.FORBIDDEN,
      );
    }

    const authenticatedUser: User = { id: user.id } as User;
    const accessToken: string =
      this.sessionService.createToken(authenticatedUser);
    const refreshToken: string = this.sessionService.createToken(
      authenticatedUser,
      true,
    );
    const upsertSessionDevicePayloadDto: UpsertSessionDevicePayloadDTO = {
      userId: user.id,
      deviceId: loginRequestDto.sessionDevice.deviceId,
      sessionDeviceType: loginRequestDto.sessionDevice.sessionDeviceType,
      name: loginRequestDto.sessionDevice.name,
      accessToken,
      refreshToken,
    };

    await this.authRepository.upsertSessionDevice(
      upsertSessionDevicePayloadDto,
    );

    return {
      accessToken,
      refreshToken,
    } as LoginResponseDto;
  }

  async refresh(user: User, token: string): Promise<LoginResponseDto> {
    if (!token) {
      throw new ForbiddenException('Refresh token is required');
    }

    const sessionDevice: SessionDevice | null =
      await this.authRepository.findByRefreshToken(token);

    if (!sessionDevice) {
      throw new ForbiddenException('Session device not found');
    }

    if (sessionDevice.userId !== user.id) {
      throw new ForbiddenException(
        'Refresh token does not belong to authenticated user',
      );
    }

    const accessToken: string = this.sessionService.createToken(user);
    const upsertSessionDevicePayloadDto: UpsertSessionDevicePayloadDTO = {
      userId: sessionDevice.userId,
      deviceId: sessionDevice.deviceId,
      sessionDeviceType: sessionDevice.sessionDeviceType,
      name: sessionDevice.name,
      accessToken,
      refreshToken: sessionDevice.refreshToken,
    };

    await this.authRepository.upsertSessionDevice(
      upsertSessionDevicePayloadDto,
    );

    return {
      accessToken,
      refreshToken: sessionDevice.refreshToken,
    } as LoginResponseDto;
  }

  async register(registerRequestDto: RegisterRequestDTO): Promise<User> {
    return await this.userService.create(registerRequestDto);
  }

  async signOut(
    signOutRequestDto: SignOutRequestDTO,
    userId: string,
    accessToken: string,
  ): Promise<void> {
    const refreshTokenPayload: jwt.JwtPayload = this.decodeRefreshToken(
      signOutRequestDto.refreshToken,
    );
    this.assertRefreshTokenBelongsToUser(refreshTokenPayload, userId);
    const sessionDevice: SessionDevice | null =
      await this.authRepository.findByRefreshToken(
        signOutRequestDto.refreshToken,
      );

    if (!sessionDevice) {
      throw new ForbiddenException('Session device not found');
    }

    if (sessionDevice.userId !== userId) {
      throw new ForbiddenException(
        'Refresh token does not belong to authenticated user',
      );
    }

    if (sessionDevice.deviceId !== signOutRequestDto.deviceId) {
      throw new ForbiddenException(
        'Refresh token does not belong to authenticated user',
      );
    }

    if (sessionDevice.accessToken !== accessToken) {
      throw new ForbiddenException(
        'Refresh token does not belong to authenticated user',
      );
    }

    const deleteSessionDevicePayloadDto: DeleteSessionDevicePayloadDTO = {
      userId,
      deviceId: signOutRequestDto.deviceId,
      accessToken,
    };

    await this.authRepository.deleteSessionDevice(
      deleteSessionDevicePayloadDto,
    );
  }

  private decodeRefreshToken(token: string): jwt.JwtPayload {
    try {
      const secret: string = this.configService.get<string>(
        'httpConfig.token.secret',
      ) as string;
      const decodedToken: jwt.JwtPayload = jwt.verify(
        token,
        secret,
      ) as jwt.JwtPayload;

      if (!decodedToken?.refresh) {
        throw new ForbiddenException('Invalid refresh token');
      }

      return decodedToken;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new ForbiddenException('Invalid refresh token');
    }
  }

  private assertRefreshTokenBelongsToUser(
    tokenPayload: jwt.JwtPayload,
    userId: string,
  ): void {
    if (typeof tokenPayload.sub !== 'string') {
      throw new ForbiddenException('Invalid refresh token');
    }

    if (tokenPayload.sub !== userId) {
      throw new ForbiddenException(
        'Refresh token does not belong to authenticated user',
      );
    }
  }
}
