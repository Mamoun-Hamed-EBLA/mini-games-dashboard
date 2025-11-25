import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FilterConfig, FilterFieldConfig } from '../../../core/models/filter-config.model';
import { BaseCriteria } from '../../../core/models/base-criteria.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-table-filters',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
  ],
  template: `
    <div class="filters-container">
      <form [formGroup]="filterForm">
        <!-- Main Filter Row -->
        <div class="filters-main-row">
          <!-- Search Box -->
          @if (config.showSearch) {
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>{{ config.searchPlaceholder || 'Search' }}</mat-label>
              <input matInput formControlName="searchTerm" />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
          }

          <!-- Sort Controls -->
          @if (config.showSort && config.sortOptions && config.sortOptions.length > 0) {
            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort By</mat-label>
              <mat-select formControlName="sortBy">
                <mat-option [value]="null">None</mat-option>
                @for (option of config.sortOptions; track option.value) {
                  <mat-option [value]="option.value">{{ option.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="direction-field">
              <mat-label>Direction</mat-label>
              <mat-select formControlName="sortDirection">
                <mat-option value="asc">Ascending</mat-option>
                <mat-option value="desc">Descending</mat-option>
              </mat-select>
            </mat-form-field>
          }
        </div>

        <!-- Advanced Filters Expansion Panel - Separate Row -->
        @if (hasAdvancedFilters()) {
          <mat-expansion-panel class="advanced-filters-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-icon>filter_list</mat-icon>
                <span>Advanced Filters</span>
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="advanced-filters-grid">
              <!-- Date Range Filters -->
              @if (config.showDateFilters) {
                <mat-form-field appearance="outline">
                  <mat-label>Created From</mat-label>
                  <input matInput [matDatepicker]="createdFromPicker" formControlName="createdFrom" />
                  <mat-datepicker-toggle matSuffix [for]="createdFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #createdFromPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Created To</mat-label>
                  <input matInput [matDatepicker]="createdToPicker" formControlName="createdTo" />
                  <mat-datepicker-toggle matSuffix [for]="createdToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #createdToPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Updated From</mat-label>
                  <input matInput [matDatepicker]="updatedFromPicker" formControlName="updatedFrom" />
                  <mat-datepicker-toggle matSuffix [for]="updatedFromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #updatedFromPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Updated To</mat-label>
                  <input matInput [matDatepicker]="updatedToPicker" formControlName="updatedTo" />
                  <mat-datepicker-toggle matSuffix [for]="updatedToPicker"></mat-datepicker-toggle>
                  <mat-datepicker #updatedToPicker></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Created By</mat-label>
                  <input matInput formControlName="createdBy" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Updated By</mat-label>
                  <input matInput formControlName="updatedBy" />
                </mat-form-field>
              }

              <!-- Custom Fields -->
              @if (config.customFields && config.customFields.length > 0) {
                @for (field of config.customFields; track field.name) {
                  @switch (field.type) {
                    @case ('text') {
                      <mat-form-field appearance="outline">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput [formControlName]="field.name" [placeholder]="field.placeholder || ''" />
                      </mat-form-field>
                    }
                    @case ('number') {
                      <mat-form-field appearance="outline">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput type="number" [formControlName]="field.name" 
                               [placeholder]="field.placeholder || ''"
                              />
                      </mat-form-field>
                    }
                    @case ('select') {
                      <mat-form-field appearance="outline">
                        <mat-label>{{ field.label }}</mat-label>
                        <mat-select [formControlName]="field.name">
                          <mat-option [value]="null">All</mat-option>
                          @for (option of field.options || []; track option.value) {
                            <mat-option [value]="option.value">{{ option.label }}</mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                    }
                    @case ('boolean') {
                      <mat-form-field appearance="outline">
                        <mat-label>{{ field.label }}</mat-label>
                        <mat-select [formControlName]="field.name">
                          <mat-option [value]="null">All</mat-option>
                          <mat-option [value]="true">Yes</mat-option>
                          <mat-option [value]="false">No</mat-option>
                        </mat-select>
                      </mat-form-field>
                    }
                    @case ('date') {
                      <mat-form-field appearance="outline">
                        <mat-label>{{ field.label }}</mat-label>
                        <input matInput [matDatepicker]="customDatePicker" [formControlName]="field.name" />
                        <mat-datepicker-toggle matSuffix [for]="customDatePicker"></mat-datepicker-toggle>
                        <mat-datepicker #customDatePicker></mat-datepicker>
                      </mat-form-field>
                    }
                  }
                }
              }
            </div>

            <div class="filter-actions">
              <button mat-button type="button" (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
              <button mat-flat-button color="primary" type="button" (click)="applyFilters()">
                <mat-icon>check</mat-icon>
                Apply Filters
              </button>
            </div>
          </mat-expansion-panel>
        }
      </form>
    </div>
  `,
  styles: [`
    .filters-container {
      margin-bottom: 1rem;
    }
    .filters-main-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: nowrap;
      margin-bottom: 0.75rem;
    }
    .search-field {
      flex: 1;
      min-width: 200px;
      max-width: 350px;
    }
    .search-field .mat-mdc-form-field-infix {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }
    .sort-field {
      width: 160px;
      flex-shrink: 0;
    }
    .direction-field {
      width: 130px;
      flex-shrink: 0;
    }
    .sort-field .mat-mdc-form-field-infix,
    .direction-field .mat-mdc-form-field-infix {
      padding-top: 12px !important;
      padding-bottom: 12px !important;
    }
    .advanced-filters-panel {
      width: 100%;
      box-shadow: none !important;
      border: 1px solid var(--app-border, rgba(100,116,139,0.15));
      background-color: #fff !important;
    }
    .advanced-filters-panel .mat-expansion-panel-header {
      background-color: #fafbfc !important;
    }
    .advanced-filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--app-border, rgba(100,116,139,0.15));
    }
    .filter-actions button {
      background-color: #fff !important;
    }
    .filter-actions .mat-flat-button {
      background-color: var(--app-primary) !important;
      color: #fff !important;
    }
    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 14px;
      font-weight: 500;
      color: var(--app-text-medium, #334155);
    }
    mat-panel-title mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
  `]
})
export class TableFiltersComponent implements OnInit {
  @Input() config: FilterConfig = {};
  @Input() initialCriteria: BaseCriteria = {};
  @Output() filtersChanged = new EventEmitter<BaseCriteria>();

  filterForm!: FormGroup;
  isExpanded = signal(false);

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
    this.setupFormListeners();
  }

  private buildForm(): void {
    const formConfig: any = {
      searchTerm: [this.initialCriteria.searchTerm || ''],
      sortBy: [this.initialCriteria.sortBy || null],
      sortDirection: [this.initialCriteria.sortDirection || 'asc'],
    };

    // Add date filter controls
    if (this.config.showDateFilters) {
      formConfig.createdFrom = [this.initialCriteria.createdFrom || null];
      formConfig.createdTo = [this.initialCriteria.createdTo || null];
      formConfig.updatedFrom = [this.initialCriteria.updatedFrom || null];
      formConfig.updatedTo = [this.initialCriteria.updatedTo || null];
      formConfig.createdBy = [this.initialCriteria.createdBy || ''];
      formConfig.updatedBy = [this.initialCriteria.updatedBy || ''];
    }

    // Add custom field controls
    if (this.config.customFields) {
      this.config.customFields.forEach(field => {
        const initialValue = (this.initialCriteria as any)[field.name] ?? field.defaultValue ?? null;
        formConfig[field.name] = [initialValue];
      });
    }

    this.filterForm = this.formBuilder.group(formConfig);
  }

  private setupFormListeners(): void {
    // Debounce search term changes
    this.filterForm.get('searchTerm')?.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.emitFilters();
      });

    // Immediate emit for sort changes
    this.filterForm.get('sortBy')?.valueChanges.subscribe(() => this.emitFilters());
    this.filterForm.get('sortDirection')?.valueChanges.subscribe(() => this.emitFilters());
  }

  hasAdvancedFilters(): boolean {
    return !!(this.config.showDateFilters || (this.config.customFields && this.config.customFields.length > 0));
  }

  applyFilters(): void {
    this.emitFilters();
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      sortBy: null,
      sortDirection: 'asc',
    });
    this.emitFilters();
  }

  private emitFilters(): void {
    const criteria = this.filterForm.value;
    this.filtersChanged.emit(criteria);
  }
}
