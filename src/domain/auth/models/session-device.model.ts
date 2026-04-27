import { SessionDeviceType } from '@domain/auth/enums/session-device-type.enum';

export class SessionDevice {
  constructor(
    public userId: string,
    public deviceId: string,
    public sessionDeviceType: SessionDeviceType,
    public name: string,
    public accessToken: string,
    public refreshToken: string,
  ) {}
}
