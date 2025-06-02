import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReleaseInventoryRequest } from 'src/protos/product.pb';

export class ReleaseStockDto implements ReleaseInventoryRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReleaseStockItemDto)
  items: ReleaseStockItemDto[];
}

class ReleaseStockItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
