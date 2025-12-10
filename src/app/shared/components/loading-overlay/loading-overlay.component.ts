import { Component, OnDestroy, OnInit, signal } from '@angular/core';

import { debounceTime, Subject, Subscription, takeUntil } from 'rxjs';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [],
  template: `
  @if(loading()){
    <div class="overlay">
      <div class="spinner"></div>
    </div>
  }
  `,
  styles: [
    `.overlay{position:fixed;inset:0;background-color:rgba(0,0,0,.18);display:flex;align-items:center;justify-content:center;z-index:9999;}
     .spinner{width:56px;height:56px;border-radius:50%;border:5px solid #e0e0e0;border-top-color:var(--mat-sys-primary);animation:spin 1s linear infinite}
     @keyframes spin{to{transform:rotate(360deg)}}`
  ]
})
export class LoadingOverlayComponent implements OnInit, OnDestroy {
  loading = signal(false);
  destroy$ = new Subject<void>();
  constructor(private loader: LoaderService) { }
  ngOnInit() {
    this.loader.loading$
    .pipe(
      debounceTime(100),
      takeUntil(this.destroy$))
    .subscribe(v => this.loading.set(v));
  }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
