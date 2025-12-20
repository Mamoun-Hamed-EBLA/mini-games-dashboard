import { Component } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DynamicFormComponent, FormFieldConfig } from '../../shared/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SharedModule, DynamicFormComponent],
  template: `
    <div class="settings-page">
      <mat-toolbar color="primary">Settings</mat-toolbar>
      <mat-card>
        <mat-card-title>Application Settings</mat-card-title>
        <mat-card-content>
          <app-dynamic-form [config]="formConfig" submitLabel="Save Settings" (submitted)="save($event)"></app-dynamic-form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [``]
})
export class SettingsComponent {
  formConfig: FormFieldConfig[] = [
    { name: 'appName', label: 'App Name', type: 'text', required: true, defaultValue: 'Mini Games Admin' },
    { name: 'itemsPerPage', label: 'Items Per Page', type: 'number', required: true, hint: 'Between 5 and 100', validators: [ { name: 'min', value: 5 }, { name: 'max', value: 100 } ] },
    { name: 'enableEmail', label: 'Enable Email Notifications', type: 'checkbox', defaultValue: true },
    { name: 'supportEmail', label: 'Support Email', type: 'email', validators: ['email', 'required'], visible: (v) => !!v['enableEmail'] },
    { name: 'theme', label: 'Theme', type: 'radio', defaultValue: 'dark', options: [ { name: 'Dark', id: 'dark' }, { name: 'Light', id: 'light' } ] },
    { name: 'maintenanceDate', label: 'Maintenance Date', type: 'date' },
    { name: 'enableLeaderboards', label: 'Enable Leaderboards', type: 'toggle', defaultValue: true },
    { name: 'leaderboardVisibility', label: 'Leaderboard Visibility', type: 'select', defaultValue: 'global', options: [ { name: 'Global', id: 'global' }, { name: 'Friends Only', id: 'friends' }, { name: 'Hidden', id: 'none' } ], disabled: (v) => !v['enableLeaderboards'] },
    { name: 'visiblePanels', label: 'Visible Panels', type: 'select', multiple: true, defaultValue: ['dashboard', 'games', 'sessions'], options: [
      { name: 'Dashboard', id: 'dashboard' },
      { name: 'Games', id: 'games' },
      { name: 'Sessions', id: 'sessions' },
      { name: 'Users', id: 'users' },
      { name: 'Settings', id: 'settings' },
    ]},
  ];

  save(value: Record<string, any>) {
    console.log('Settings saved:', value);
  }
}
