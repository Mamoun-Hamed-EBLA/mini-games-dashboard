import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

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
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  template: `
    <form class="dynamic-form" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="grid" [style.grid-template-columns]="'repeat(' + cols + ', minmax(0,1fr))'">
      <ng-container *ngFor="let field of config">
        <ng-container *ngIf="computeVisible(field)" [ngSwitch]="field.type">
          <div class="grid-item" [style.grid-column]="'span ' + (field.colSpan || 1)">
          <mat-form-field *ngSwitchCase="'text'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [formControlName]="field.name" [disabled]="computeDisabled(field)" />
            <mat-hint *ngIf="field.hint">{{ field.hint }}</mat-hint>
          </mat-form-field>

          <mat-form-field *ngSwitchCase="'number'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="number" [formControlName]="field.name" [disabled]="computeDisabled(field)" />
            <mat-hint *ngIf="field.hint">{{ field.hint }}</mat-hint>
          </mat-form-field>

          <mat-form-field *ngSwitchCase="'password'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="password" [formControlName]="field.name" [disabled]="computeDisabled(field)" />
          </mat-form-field>

          <mat-form-field *ngSwitchCase="'email'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput type="email" [formControlName]="field.name" [disabled]="computeDisabled(field)" />
          </mat-form-field>

          <mat-form-field *ngSwitchCase="'select'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <mat-select [formControlName]="field.name" [multiple]="field.multiple" [disabled]="computeDisabled(field)">
              <mat-option *ngFor="let opt of field.options || []" [value]="opt.value">{{ opt.label }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-checkbox *ngSwitchCase="'checkbox'" [formControlName]="field.name" [disabled]="computeDisabled(field)">{{ field.label }}</mat-checkbox>

          <mat-radio-group *ngSwitchCase="'radio'" [formControlName]="field.name" class="radio-group">
            <mat-radio-button *ngFor="let opt of field.options || []" [value]="opt.value">{{ opt.label }}</mat-radio-button>
          </mat-radio-group>

          <mat-slide-toggle *ngSwitchCase="'toggle'" [formControlName]="field.name">{{ field.label }}</mat-slide-toggle>

          <mat-form-field *ngSwitchCase="'date'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [matDatepicker]="picker" [formControlName]="field.name" [disabled]="computeDisabled(field)" />
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field *ngSwitchCase="'textarea'" appearance="outline" class="full-width">
            <mat-label>{{ field.label }}</mat-label>
            <textarea matInput rows="4" [formControlName]="field.name" [disabled]="computeDisabled(field)"></textarea>
          </mat-form-field>
          </div>
        </ng-container>
      </ng-container>
      </div>

      <div class="actions">
        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">{{ submitLabel }}</button>
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
export class DynamicFormComponent implements OnChanges {
  @Input() config: FormFieldConfig[] = [];
  @Input() submitLabel = 'Save';
  @Input() value: Record<string, any> | null = null;
  @Input() cols = 1;
  @Output() submitted = new EventEmitter<Record<string, any>>();

  form = new FormGroup<Record<string, FormControl>>({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      this.form = new FormGroup(
        this.config.reduce((acc, field) => {
          const validators = this.buildValidators(field);
          const initial = this.value?.[field.name] ?? (field.defaultValue ?? this.defaultValue(field));
          acc[field.name] = new FormControl(initial, validators);
          if (this.computeDisabled(field)) {
            acc[field.name].disable({ emitEvent: false });
          }
          return acc;
        }, {} as Record<string, FormControl>)
      );
    }
    if (changes['value'] && this.value) {
      this.form.patchValue(this.value);
    }
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

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }
}
