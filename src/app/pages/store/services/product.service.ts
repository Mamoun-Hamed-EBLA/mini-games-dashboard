
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CriteriaNormalizerService } from '../../../core/services/criteria-normalizer.service';
import { BaseCrudService } from '../../../core/services/base-crud.service';
import { CreateProductDto, ProductDto, UpdateProductDto } from '../models/product.model';
import { ProductCriteria } from '../models/product-criteria.model';
import { LikeCardsProductDto, LikeCardsProductsFilter } from '../models/likecards.model';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseCrudService<ProductDto, ProductCriteria> {
  constructor(http: HttpClient, criteriaService: CriteriaNormalizerService) {
    super(http, 'Products', criteriaService);
  }

  createProduct(dto: CreateProductDto): Observable<ProductDto> {
    return this.http.post<any>(this.endpoint, dto).pipe(
      map(response => (response?.data ?? response) as ProductDto)
    );
  }

  updateProduct(productId: string, dto: UpdateProductDto): Observable<ProductDto> {
    return this.http.put<any>(`${this.endpoint}/${productId}`, dto).pipe(
      map(response => (response?.data ?? response) as ProductDto)
    );
  }

  deleteProduct(productId: string): Observable<boolean> {
    return this.delete(productId);
  }

  getLikeCardsProducts(filter: LikeCardsProductsFilter): Observable<LikeCardsProductDto[]> {
    const params = new HttpParams()
      .set('country', String(filter.country))
      .set('language', String(filter.language));

    return this.http.get<any>(`${this.endpoint}/likecards`, { params }).pipe(
      map(response => (response?.data ?? response) as LikeCardsProductDto[])
    );
  }
}
