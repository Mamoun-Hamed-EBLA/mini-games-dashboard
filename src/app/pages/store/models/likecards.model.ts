import { ClientLanguage } from '../enums/client-language.enum';
import { Country } from '../enums/country.enum';

export interface LikeCardsProductsFilter {
  country: Country;
  language: ClientLanguage;
}

export interface LikeCardsProductDto {
  categoryId: string;
  productId: string;
  productName: string;
  productImage: string;
  productCurrency: string;
  available: boolean;
  productPrice: number;
}
