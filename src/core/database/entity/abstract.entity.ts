import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('increment')
  @ApiProperty()
  public id: number;

  @CreateDateColumn()
  @ApiProperty({ type: Date })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ type: Date })
  updatedAt: Date;
}
