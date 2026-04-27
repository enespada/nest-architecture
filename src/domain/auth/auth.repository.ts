import { DeleteSessionDevicePayloadDTO } from '@application/auth/dto/delete-session-device-payload.dto';
import { UpsertSessionDevicePayloadDTO } from '@application/auth/dto/upsert-session-device-payload.dto';
import { SessionDevice } from '@domain/auth/models/session-device.model';

export interface AuthRepository {
  upsertSessionDevice(
    upsertSessionDevicePayloadDto: UpsertSessionDevicePayloadDTO,
  ): Promise<SessionDevice>;
  findByRefreshToken(refreshToken: string): Promise<SessionDevice | null>;
  deleteSessionDevice(
    deleteSessionDevicePayloadDto: DeleteSessionDevicePayloadDTO,
  ): Promise<void>;
}
