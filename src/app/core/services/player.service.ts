import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Player } from '../models/player.model';

function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly state$ = new BehaviorSubject<Player[]>([
    { id: genId(), username: 'alice', socialMediaId: 'alice123', countryCode: 'US', icon: 'avatar1.png', frame: 'gold', score: 1530, lastLoginAt: new Date(), isActive: true },
    { id: genId(), username: 'bob', socialMediaId: 'bob_the_gamer', countryCode: 'FR', icon: 'avatar2.png', frame: 'silver', score: 890, lastLoginAt: new Date(), isActive: true },
    { id: genId(), username: 'carol', socialMediaId: 'carol.gg', countryCode: 'EG', icon: 'avatar3.png', frame: 'bronze', score: 270, lastLoginAt: null, isActive: false },
  ]);

  list(): Observable<Player[]> { return this.state$.asObservable(); }
  get(id: string): Observable<Player | undefined> { return this.list().pipe(map(arr => arr.find(x => x.id === id))); }

  create(payload: Omit<Player, 'id'>): Observable<Player> {
    const item: Player = { ...payload, id: genId() };
    this.state$.next([item, ...this.state$.value]);
    return of(item).pipe(delay(200));
  }

  update(id: string, changes: Partial<Player>): Observable<Player | undefined> {
    const items = this.state$.value.map(p => (p.id === id ? { ...p, ...changes } : p));
    this.state$.next(items);
    return of(items.find(p => p.id === id)).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    this.state$.next(this.state$.value.filter(p => p.id !== id));
    return of(true).pipe(delay(150));
  }
}
