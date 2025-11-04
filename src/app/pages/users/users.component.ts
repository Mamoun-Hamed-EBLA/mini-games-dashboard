import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="users-page">
      <mat-toolbar color="primary">Users</mat-toolbar>
      <mat-card>
        <mat-card-content>
          <app-data-table [columns]="columns" [data]="rows"></app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [``]
})
export class UsersComponent {
  columns = [
    { columnDef: 'id', header: 'ID' },
    { columnDef: 'name', header: 'Name' },
    { columnDef: 'email', header: 'Email' },
  ];

  rows = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Carol', email: 'carol@example.com' },
  ];
}
