import { SessionDevice } from '@domain/auth/models/session-device.model';
import { SessionDeviceEntity } from '@infrastructure/auth/entities/session-device.entity';

export class SessionDeviceMapper {
  static entityToModel(entity: SessionDeviceEntity): SessionDevice {
    return new SessionDevice(
      entity.userId,
      entity.deviceId,
      entity.sessionDeviceType,
      entity.name,
      entity.accessToken,
      entity.refreshToken,
    );
  }

  static modelToEntity(model: SessionDevice): SessionDeviceEntity {
    const sessionDeviceEntity: SessionDeviceEntity = {
      userId: model.userId,
      deviceId: model.deviceId,
      sessionDeviceType: model.sessionDeviceType,
      name: model.name,
      accessToken: model.accessToken,
      refreshToken: model.refreshToken,
    } as SessionDeviceEntity;

    return sessionDeviceEntity;
  }
}
