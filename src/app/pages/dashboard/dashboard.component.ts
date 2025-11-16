import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="dashboard">
      <div class="cards">
        <mat-card class="stat">
          <mat-card-title>Total Users</mat-card-title>
          <mat-card-content><h2>1,248</h2></mat-card-content>
        </mat-card>
        <mat-card class="stat">
          <mat-card-title>Active Games</mat-card-title>
          <mat-card-content><h2>32</h2></mat-card-content>
        </mat-card>
        <mat-card class="stat">
          <mat-card-title>Revenue (Mtd)</mat-card-title>
          <mat-card-content><h2>$12,734</h2></mat-card-content>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-title>Recent Activity</mat-card-title>
        <mat-card-content>
          <app-data-table [columns]="columns" [data]="rows"></app-data-table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `.dashboard{ display:flex; flex-direction:column; gap:16px; }
     .cards{ display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:16px; }
     .stat{ position:relative; overflow:hidden; border:1px solid var(--app-border); background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01)); }
     .stat mat-card-title{ color:#cbd5e1; font-weight:600; }
     .stat h2{ margin:0; font-weight:800; letter-spacing:.4px; background: linear-gradient(90deg, #c084fc, #60a5fa); -webkit-background-clip: text; background-clip: text; color: transparent; }`
  ]
})
export class DashboardComponent {
  columns = [
    { columnDef: 'time', header: 'Time' },
    { columnDef: 'user', header: 'User' },
    { columnDef: 'action', header: 'Action' },
  ];

  rows = [
    { time: '18:22', user: 'alice', action: 'Started Game A' },
    { time: '18:24', user: 'bob', action: 'Purchased Coins' },
    { time: '18:31', user: 'carol', action: 'Finished Level 3' },
  ];
}
