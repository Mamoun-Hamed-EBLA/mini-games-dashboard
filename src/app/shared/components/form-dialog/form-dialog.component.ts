import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';
import { DynamicFormComponent, FormFieldConfig } from '../dynamic-form/dynamic-form.component';

export interface FormDialogData {
  title: string;
  submitLabel?: string;
  config: FormFieldConfig[];
  value?: Record<string, any> | null;
  cols?: number;
}

@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [SharedModule, MatDialogModule, DynamicFormComponent],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <app-dynamic-form [config]="data.config"
                        [value]="data.value || null"
                        [submitLabel]="data.submitLabel || 'Save'"
                        [cols]="data.cols || 1"
                        (submitted)="submit($event)"></app-dynamic-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [
    `:host { display:block; }
     mat-dialog-content { padding-top: 0; max-height: 70vh; overflow: auto; }
     mat-dialog-actions { padding: 8px 0 0; }
    `
  ]
})
export class FormDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FormDialogData,
    private ref: MatDialogRef<FormDialogComponent>
  ) {}

  submit(result: any) {
    this.ref.close(result);
  }
}
