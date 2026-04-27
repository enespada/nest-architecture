import { AuthRepository } from '@domain/auth/auth.repository';
import { DeleteSessionDevicePayloadDTO } from '@application/auth/dto/delete-session-device-payload.dto';
import { UpsertSessionDevicePayloadDTO } from '@application/auth/dto/upsert-session-device-payload.dto';
import { SessionDevice } from '@domain/auth/models/session-device.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionDeviceEntity } from '@infrastructure/auth/entities/session-device.entity';
import { SessionDeviceMapper } from '@infrastructure/auth/mappers/session-device.mapper';

@Injectable()
export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    @InjectRepository(SessionDeviceEntity)
    private readonly sessionDeviceEntityRepository: Repository<SessionDeviceEntity>,
  ) {}

  async upsertSessionDevice(
    upsertSessionDevicePayloadDto: UpsertSessionDevicePayloadDTO,
  ): Promise<SessionDevice> {
    const existingEntity: SessionDeviceEntity | null =
      await this.sessionDeviceEntityRepository.findOne({
        where: {
          userId: upsertSessionDevicePayloadDto.userId,
          deviceId: upsertSessionDevicePayloadDto.deviceId,
        },
      });

    if (existingEntity) {
      const updatedEntity: SessionDeviceEntity =
        this.sessionDeviceEntityRepository.create({
          ...existingEntity,
          sessionDeviceType: upsertSessionDevicePayloadDto.sessionDeviceType,
          name: upsertSessionDevicePayloadDto.name,
          accessToken: upsertSessionDevicePayloadDto.accessToken,
          refreshToken: upsertSessionDevicePayloadDto.refreshToken,
        });

      const savedEntity: SessionDeviceEntity =
        await this.sessionDeviceEntityRepository.save(updatedEntity);

      return SessionDeviceMapper.entityToModel(savedEntity);
    }

    const sessionDevice: SessionDevice = new SessionDevice(
      upsertSessionDevicePayloadDto.userId,
      upsertSessionDevicePayloadDto.deviceId,
      upsertSessionDevicePayloadDto.sessionDeviceType,
      upsertSessionDevicePayloadDto.name,
      upsertSessionDevicePayloadDto.accessToken,
      upsertSessionDevicePayloadDto.refreshToken,
    );
    const sessionDeviceEntity: SessionDeviceEntity =
      this.sessionDeviceEntityRepository.create(
        SessionDeviceMapper.modelToEntity(sessionDevice),
      );

    const savedEntity: SessionDeviceEntity =
      await this.sessionDeviceEntityRepository.save(sessionDeviceEntity);

    return SessionDeviceMapper.entityToModel(savedEntity);
  }

  async findByRefreshToken(
    refreshToken: string,
  ): Promise<SessionDevice | null> {
    const sessionDeviceEntity: SessionDeviceEntity | null =
      await this.sessionDeviceEntityRepository.findOne({
        where: { refreshToken },
      });

    if (!sessionDeviceEntity) {
      return null;
    }

    return SessionDeviceMapper.entityToModel(sessionDeviceEntity);
  }

  async deleteSessionDevice(
    deleteSessionDevicePayloadDto: DeleteSessionDevicePayloadDTO,
  ): Promise<void> {
    await this.sessionDeviceEntityRepository.delete({
      userId: deleteSessionDevicePayloadDto.userId,
      deviceId: deleteSessionDevicePayloadDto.deviceId,
      accessToken: deleteSessionDevicePayloadDto.accessToken,
    });
  }
}
