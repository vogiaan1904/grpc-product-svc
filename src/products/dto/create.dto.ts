import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  isString,
  IsString,
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
  price: number;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[] = [];

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  imageUrls: string[] = [];
}
