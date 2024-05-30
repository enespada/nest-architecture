import { ApiProperty } from "@nestjs/swagger";
import { PageOptionsDto } from "./pagination-options.dto";

export interface PageMetaDtoParameters {
  pageOptionsDto: PageOptionsDto;
  totalItems: number;
}

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly totalItems: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor({ pageOptionsDto, totalItems }: PageMetaDtoParameters) {
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.totalItems = totalItems;
    this.pageCount = Math.ceil(this.totalItems / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}