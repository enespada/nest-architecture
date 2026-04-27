import { SessionDeviceType } from '@domain/auth/enums/session-device-type.enum';

export class UpsertSessionDevicePayloadDTO {
  userId: string;

  deviceId: string;

  sessionDeviceType: SessionDeviceType;

  name: string;

  accessToken: string;

  refreshToken: string;
}
