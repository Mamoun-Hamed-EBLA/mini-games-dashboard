import { Injectable } from '@angular/core';
import { BaseCriteria, NormalizedCriteria } from '../models/base-criteria.model';

@Injectable({
  providedIn: 'root'
})
export class CriteriaNormalizerService {

  /**
   * Normalizes criteria by converting dates to ISO strings and removing empty values
   */
  normalize<T extends BaseCriteria>(criteria: T): NormalizedCriteria {
    const normalized: NormalizedCriteria = {};

    Object.keys(criteria).forEach(key => {
      const value = (criteria as any)[key];

      // Skip undefined, null, or empty string values
      if (value === undefined || value === null || value === '') {
        return;
      }

      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        normalized[key] = value.toISOString();
      }
      // Handle date-time strings that need conversion
      else if (this.isDateField(key) && typeof value === 'string') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            normalized[key] = date.toISOString();
          } else {
            normalized[key] = value;
          }
        } catch {
          normalized[key] = value;
        }
      }
      // Handle boolean isDescending conversion
      else if (key === 'sortDirection' && typeof value === 'string') {
        const direction = value as 'asc' | 'desc';
        normalized[key] = direction;
        normalized['isDescending'] = direction === 'desc';
      }
      // Copy all other non-empty values
      else {
        normalized[key] = value;
      }
    });

    return normalized;
  }

  /**
   * Checks if a field name represents a date field
   */
  private isDateField(fieldName: string): boolean {
    const dateFieldPatterns = [
      'date',
      'from',
      'to',
      'created',
      'updated',
      'time',
      'at'
    ];
    const lowerFieldName = fieldName.toLowerCase();
    return dateFieldPatterns.some(pattern => lowerFieldName.includes(pattern));
  }

  /**
   * Creates a clean criteria object with only defined values
   */
  cleanCriteria<T extends BaseCriteria>(criteria: T): Partial<T> {
    const cleaned: any = {};
    Object.keys(criteria).forEach(key => {
      const value = (criteria as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }
}
