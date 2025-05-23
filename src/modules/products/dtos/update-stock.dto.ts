import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { UpdateStockRequest } from 'src/protos/product.pb';

export class UpdateStockDto implements UpdateStockRequest {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}
