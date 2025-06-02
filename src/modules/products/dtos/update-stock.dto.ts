import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateStockRequest } from 'src/protos/product.pb';

export class UpdateStockDto implements UpdateStockRequest {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateStockItemDto)
  items: UpdateStockItemDto[];
}

class UpdateStockItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
