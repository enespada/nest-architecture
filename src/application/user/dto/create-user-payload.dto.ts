export class CreateUserPayloadDTO {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phonePreffix?: string;
  phone?: string;
  language: string;
  birthDate: string;
  password: string;
}
