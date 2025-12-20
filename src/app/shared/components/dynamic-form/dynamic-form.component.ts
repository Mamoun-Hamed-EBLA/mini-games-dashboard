
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subscription } from 'rxjs';

export interface FormFieldOption {
  label: string;
  value: any;
}

export type FieldType = 'text' | 'number' | 'password' | 'email' | 'select' | 'checkbox' | 'textarea' | 'radio' | 'toggle' | 'date';

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: FormFieldOption[]; // for select fields
  enumType?: any; // for select fields: pass a TS enum, show names as labels and numeric values
  required?: boolean;
  defaultValue?: any;
  visible?: boolean | ((formValue: Record<string, any>) => boolean);
  disabled?: boolean | ((formValue: Record<string, any>) => boolean);
  validators?: Array<
    'required' | 'email' |
    { name: 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern'; value: number | string }
  >;
  hint?: string;
  multiple?: boolean; // for select
  colSpan?: number; // grid column span
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
],
  template: `
    <form class="dynamic-form" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="grid" [style.grid-template-columns]="'repeat(' + cols + ', minmax(0,1fr))'">
        @for (fieldConfig of normalizedConfig; track fieldConfig.name) {
          @if (computeVisible(fieldConfig)) {
            <div class="grid-item" [style.grid-column]="'span ' + (fieldConfig.colSpan || 1)">
              @switch (fieldConfig.type) {
    
                @case ('text') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <input matInput [formControlName]="fieldConfig.name" />
                    @if (fieldConfig.hint) {
                      <mat-hint>{{ fieldConfig.hint }}</mat-hint>
                    }
                  </mat-form-field>
                }
    
                @case ('number') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <input matInput type="number" [formControlName]="fieldConfig.name" />
                    @if (fieldConfig.hint) {
                      <mat-hint>{{ fieldConfig.hint }}</mat-hint>
                    }
                  </mat-form-field>
                }
    
                @case ('password') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <input matInput type="password" [formControlName]="fieldConfig.name" />
                  </mat-form-field>
                }
    
                @case ('email') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <input matInput type="email" [formControlName]="fieldConfig.name" />
                  </mat-form-field>
                }
    
                @case ('select') {
                  <div class="full-width ng-select-wrapper">
                    <label class="ng-select-label">{{ fieldConfig.label }}</label>
                    <ng-select
                      [items]="fieldConfig.options || []"
                      bindLabel="label"
                      bindValue="value"
                      [multiple]="fieldConfig.multiple"
                      [placeholder]="fieldConfig.placeholder || 'Select'"
                      [formControlName]="fieldConfig.name">
                    </ng-select>
                  </div>
                }
    
                @case ('checkbox') {
                  <mat-checkbox [formControlName]="fieldConfig.name">{{ fieldConfig.label }}</mat-checkbox>
                }
    
                @case ('radio') {
                  <mat-radio-group [formControlName]="fieldConfig.name" class="radio-group">
                    @for (option of fieldConfig.options || []; track option) {
                      <mat-radio-button [value]="option.value">{{ option.label }}</mat-radio-button>
                    }
                  </mat-radio-group>
                }
    
                @case ('toggle') {
                  <mat-slide-toggle [formControlName]="fieldConfig.name">{{ fieldConfig.label }}</mat-slide-toggle>
                }
    
                @case ('date') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <input matInput [matDatepicker]="picker" [formControlName]="fieldConfig.name" />
                    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                }
    
                @case ('textarea') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>{{ fieldConfig.label }}</mat-label>
                    <textarea matInput rows="4" [formControlName]="fieldConfig.name"></textarea>
                  </mat-form-field>
                }
    
              }
            </div>
          }
        }
      </div>
    </form>
    `,
  styles: [
    `.dynamic-form{ display:flex; flex-direction:column; gap:16px; }`,
    `.grid{ display:grid; gap:16px; }`,
    `.full-width{ width:100%; }`,
    `.actions{ display:flex; justify-content:flex-end; }`,
    `.radio-group{ display:flex; gap:16px; flex-wrap: wrap; }`,
   
  ]
})
export class DynamicFormComponent implements OnChanges, OnDestroy {
  @Input() config: FormFieldConfig[] = [];
  @Input() submitLabel = 'Save';
  @Input() value: Record<string, any> | null = null;
  @Input() cols = 1;
  @Output() submitted = new EventEmitter<Record<string, any>>();

  form = new FormGroup<Record<string, FormControl>>({});
  private formValueChangesSub?: Subscription;
  normalizedConfig: FormFieldConfig[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.normalizedConfig = (this.config || []).map(fieldConfig => this.normalizeField(fieldConfig));
      this.form = new FormGroup(
        this.normalizedConfig.reduce((acc, field) => {
          const validators = this.buildValidators(field);
          const initial = this.value?.[field.name] ?? (field.defaultValue ?? this.defaultValue(field));
          acc[field.name] = new FormControl(initial, validators);
          return acc;
        }, {} as Record<string, FormControl>)
      );
      this.formValueChangesSub?.unsubscribe();
      this.applyDisabledRules();
      this.formValueChangesSub = this.form.valueChanges.subscribe(() => {
        this.applyDisabledRules();
      });
    }
    if (changes['value'] && this.value) {
      this.form.patchValue(this.value);
      this.applyDisabledRules();
    }
  }

  ngOnDestroy(): void {
    this.formValueChangesSub?.unsubscribe();
  }

  defaultValue(field: FormFieldConfig) {
    if (field.type === 'checkbox') return false;
    return '';
  }

  buildValidators(field: FormFieldConfig) {
    const validators = [] as any[];
    if (field.required || field.validators?.includes('required')) validators.push(Validators.required);
    if (field.type === 'email' || field.validators?.includes('email')) validators.push(Validators.email);
    (field.validators || [])
      .filter((v): v is { name: any; value: any } => typeof v === 'object')
      .forEach(v => {
        switch (v.name) {
          case 'min': validators.push(Validators.min(Number(v.value))); break;
          case 'max': validators.push(Validators.max(Number(v.value))); break;
          case 'minLength': validators.push(Validators.minLength(Number(v.value))); break;
          case 'maxLength': validators.push(Validators.maxLength(Number(v.value))); break;
          case 'pattern': validators.push(Validators.pattern(String(v.value))); break;
        }
      });
    return validators;
  }

  computeVisible(field: FormFieldConfig): boolean {
    const rule = field.visible;
    if (typeof rule === 'function') {
      return !!rule(this.form.getRawValue());
    }
    return rule === undefined ? true : !!rule;
  }

  computeDisabled(field: FormFieldConfig): boolean {
    const rule = field.disabled;
    if (typeof rule === 'function') {
      return !!rule(this.form.getRawValue());
    }
    return !!rule;
  }

  private applyDisabledRules(): void {
    (this.normalizedConfig || []).forEach(fieldConfig => {
      const control = this.form.get(fieldConfig.name);
      if (!control) {
        return;
      }

      const shouldDisable = this.computeDisabled(fieldConfig);
      if (shouldDisable && control.enabled) {
        control.disable({ emitEvent: false });
      } else if (!shouldDisable && control.disabled) {
        control.enable({ emitEvent: false });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  private normalizeField(field: FormFieldConfig): FormFieldConfig {
    if ((field.type === 'select' || field.type === 'radio') && !field.options && field.enumType) {
      const e = field.enumType;
      const names = Object.keys(e).filter(k => isNaN(Number(k)));
      const options = names.map(name => ({ label: name.replace(/_/g, ' '), value: Number(e[name]) }));
      return { ...field, options };
    }
    return field;
  }
}
