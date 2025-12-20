import { ProductDto } from './product.model';
import { LikeCardsOrderStatus } from '../enums/likecards-order-status.enum';

export interface LikeCardsOrderDto {
  userId: string;
  id: string;
  orderPrice: number;
  productPrice: number;
  referenceId: string;
  quantity: number;
  requestedAt: string;
  player: { id?: string; username?: string };
  productId: string;
  product: ProductDto;
  status: LikeCardsOrderStatus;
  message: string;
  isVerified: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
}
