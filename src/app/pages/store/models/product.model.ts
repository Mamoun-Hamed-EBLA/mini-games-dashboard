import { Country } from '../enums/country.enum';

export interface ProductDto {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  country: string;
  isEnabled: boolean;
}

export interface CreateProductDto {
  title: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  country: Country;
  isActive?: boolean;
}

export interface UpdateProductDto {
  title: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
}
