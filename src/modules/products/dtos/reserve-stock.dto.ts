import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ReserveInventoryRequest } from 'src/protos/product.pb';

export class ReserveStockDto implements ReserveInventoryRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
