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

export interface PaginationInfo {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatIconModule, MatButtonModule],
  template: `
    <div class="table-wrapper">
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z1 full-width">
        @for (column of columns; track column.columnDef) {
          <ng-container [matColumnDef]="column.columnDef">
            <th mat-header-cell *matHeaderCellDef>{{ column.header }}</th>
            <td mat-cell *matCellDef="let row" (click)="onRowClick(row)">
              {{ column.cell ? column.cell(row) : row[column.columnDef] }}
            </td>
          </ng-container>
        }

        @if (actions) {
          <ng-container matColumnDef="actions">
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
        }

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
      
      @if (paginationInfo) {
        <div class="pagination-info">
          <span class="info-text">
            Showing {{ ((paginationInfo.pageNumber - 1) * paginationInfo.pageSize) + 1 }} 
            to {{ Math.min(paginationInfo.pageNumber * paginationInfo.pageSize, paginationInfo.totalCount) }} 
            of {{ paginationInfo.totalCount }} items
          </span>
          <span class="page-text">Page {{ paginationInfo.pageNumber }} of {{ paginationInfo.totalPages }}</span>
        </div>
      } @else {
        <mat-paginator [pageSize]="10" [pageSizeOptions]="[5,10,25]"></mat-paginator>
      }
    </div>
  `,
  styles: [
    `.full-width{ width:100%; }`,
    `.actions-col{ width: 96px; text-align: right; }`,
    `.table-wrapper table{ border-radius:8px; overflow:hidden; border:1px solid var(--app-border,rgba(100,116,139,0.15)); }`,
    `.table-wrapper .mat-mdc-header-row{ background: linear-gradient(180deg, #f3e5d3, #faf8f5); border-bottom:2px solid #d4a574; }`,
    `.table-wrapper .mat-mdc-header-cell{ color:#334155; font-weight:600; font-size:13px; letter-spacing:0.3px; padding:16px 12px; }`,
    `.table-wrapper .mat-mdc-row{ transition: background .15s ease; border-bottom:1px solid var(--app-border,rgba(100,116,139,0.1)); }`,
    `.table-wrapper .mat-mdc-row:hover{ background: rgba(212,165,116,0.04); }`,
    `.table-wrapper .mat-mdc-cell{ color:#1e293b; padding:14px 12px; font-size:14px; }`,
    `.table-wrapper .mat-mdc-paginator{ color:#334155; border-top:1px solid var(--app-border,rgba(100,116,139,0.15)); }`,
    `.table-wrapper .mat-mdc-paginator .mat-mdc-icon-button{ color:#64748b; }`,
    `.pagination-info{ display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-top:1px solid var(--app-border,rgba(100,116,139,0.15)); background:linear-gradient(135deg, #fafbfc, #ffffff); font-size:13px; color:#334155; }`,
    `.info-text{ font-weight:600; color:#1e293b; }`,
    `.page-text{ color:#64748b; font-weight:500; }`,
  ]
})
export class DataTableComponent<T = any> implements OnChanges, AfterViewInit {
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];
  @Input() actions = false;
  @Input() paginationInfo: PaginationInfo | null = null;
  @Output() rowClick = new EventEmitter<T>();
  @Output() edit = new EventEmitter<T>();
  @Output() remove = new EventEmitter<T>();

  Math = Math;

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
