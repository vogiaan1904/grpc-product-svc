import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ReleaseInventoryRequest } from 'src/protos/product.pb';

export class ReleaseStockDto implements ReleaseInventoryRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
