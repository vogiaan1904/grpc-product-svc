import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  isString,
  IsString,
  Min,
  min,
} from 'class-validator';
import { CreateProductRequest } from 'src/protos/product.pb';

export class CreateProductDto implements CreateProductRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[] = [];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[] = [];
}
