import { ProductDto } from './product.model';

export interface ProductSerialDto {
  id: string;
  productId: string;
  product: ProductDto;
  ownerId: string;
  owner: { id?: string; username?: string };
  code: string;
  serialNumber: string;
  isUsed: boolean;
  validTo: string;
}
