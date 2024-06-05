import {
  PrimaryGeneratedColumn,
  BeforeInsert,
  Column,
  BeforeUpdate,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  public id: string;

  @Column({ type: 'bigint' })
  @Transform(({ value }) => Number(value))
  @ApiProperty()
  createdAt: number;

  @Column({ type: 'bigint' })
  @Transform(({ value }) => Number(value))
  @ApiProperty()
  updatedAt: number;

  @BeforeInsert()
  uploadCreatedAt() {
    const date: number = Math.floor(Date.now() / 1000);
    this.createdAt = date;
    this.updatedAt = date;
  }

  @BeforeUpdate()
  uploadUpdatedAt() {
    this.updatedAt = Math.floor(Date.now() / 1000);
  }
}
