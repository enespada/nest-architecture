import { RedsysCreateRequestParams } from '@core/services/redsys/dto/redsys.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreatePaymentRedsysDto {
  @ApiProperty()
  @IsNotEmpty()
  data: RedsysCreateRequestParams;

  @ApiProperty()
  @IsOptional()
  urlOk: string;

  @ApiProperty()
  @IsOptional()
  urlKo: string;

  @ApiProperty({
    description: 'Amount to be paid. Must be in cents',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
