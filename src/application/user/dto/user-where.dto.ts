import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserWhereDTO {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  lastName?: string;

  /**
   * Campo virtual: se traduce a OR(firstName LIKE, lastName LIKE).
   * Enviado por el cliente Flutter como campo de búsqueda de nombre completo.
   */
  @ApiProperty({
    required: false,
    description: 'Virtual field: resolves to OR(firstName LIKE, lastName LIKE)',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  /**
   * Campo virtual ignorado por el backend.
   * El cliente Flutter lo envía junto a fullName con el mismo valor; no genera ninguna condición SQL.
   */
  @ApiProperty({
    required: false,
    description: 'Virtual field from Flutter client: ignored by the backend',
  })
  @IsString()
  @IsOptional()
  userName?: string;
}
