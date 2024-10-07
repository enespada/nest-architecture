import { PartialType } from '@nestjs/swagger';
import { UpdateUserDTO } from './update-user.dto';

export class UpdateUserPayloadDTO extends PartialType(UpdateUserDTO) {}
