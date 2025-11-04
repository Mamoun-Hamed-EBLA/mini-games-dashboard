import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private active = 0;
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  show() {
    this.active++;
    if (this.active === 1) this._loading$.next(true);
  }
  hide() {
    this.active = Math.max(0, this.active - 1);
    if (this.active === 0) this._loading$.next(false);
  }
  reset() {
    this.active = 0;
    this._loading$.next(false);
  }
}
