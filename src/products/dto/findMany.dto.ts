import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

class Pagination {
  @IsNumber()
  @IsOptional()
  page: number = 1;

  @IsNumber()
  @IsOptional()
  perPage: number = 10;
}

export class FindManyDto {
  @IsObject()
  @IsOptional()
  pagination: Pagination;

  @IsString()
  @IsOptional()
  shopId: string;

  @IsString()
  @IsOptional()
  categoryId: string;

  @IsString()
  @IsOptional()
  searchTerm: string;
}
