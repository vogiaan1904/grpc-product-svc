import { IsNotEmpty, IsString } from 'class-validator';
import { DeleteProductRequest } from 'src/protos/product.pb';

export class DeleteProductDto implements DeleteProductRequest {
  @IsString()
  @IsNotEmpty()
  id: string;
}
