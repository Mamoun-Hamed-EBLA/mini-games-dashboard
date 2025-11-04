import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface ColumnDef<T = any> {
  columnDef: string;
  header: string;
  cell?: (row: T) => string | number | boolean | null | undefined;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule],
  template: `
    <div class="table-wrapper">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z1 full-width">
        <ng-container *ngFor="let col of columns" [matColumnDef]="col.columnDef">
          <th mat-header-cell *matHeaderCellDef>{{ col.header }}</th>
          <td mat-cell *matCellDef="let row" (click)="onRowClick(row)">
            {{ col.cell ? col.cell(row) : row[col.columnDef] }}
          </td>
        </ng-container>

        <ng-container *ngIf="actions" matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
          <td mat-cell *matCellDef="let row" class="actions-col">
            <button mat-icon-button color="primary" (click)="onEdit(row); $event.stopPropagation()">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDelete(row); $event.stopPropagation()">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
      <mat-paginator [pageSize]="10" [pageSizeOptions]="[5,10,25]"></mat-paginator>
    </div>
  `,
  styles: [
    `.full-width{ width:100%; }`,
    `.actions-col{ width: 96px; text-align: right; }`,
  ]
})
export class DataTableComponent<T = any> implements OnChanges, AfterViewInit {
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions = false;
  @Output() rowClick = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() remove = new EventEmitter<T>();

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<T>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.displayedColumns = (this.columns || []).map(c => c.columnDef);
      if (this.actions) {
        this.displayedColumns = [...this.displayedColumns, 'actions'];
      }
    }
    if (changes['data']) {
      this.dataSource.data = (this.data || []).slice();
    }
    if (changes['actions'] && !changes['columns']) {
      // If actions toggled but columns not changed, adjust displayed columns
      const base = (this.columns || []).map(c => c.columnDef);
      this.displayedColumns = this.actions ? [...base, 'actions'] : base;
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onRowClick(row: T) {
    this.rowClick.emit(row);
  }

  onEdit(row: T) { this.edit.emit(row); }
  onDelete(row: T) { this.remove.emit(row); }
}
