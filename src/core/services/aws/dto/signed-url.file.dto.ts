import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SignedUrlDTO {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'URL firmada del archivo',
    example:
      'https://barberias.s3.amazonaws.com/services-images/6/cb32aaa1-708c-4a0e-b356-d11a0e2089b5/MicrosoftTeams-image.png',
  })
  url: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Key del archivo',
    example: 'folder/filename.jpg',
  })
  key?: string;
}
