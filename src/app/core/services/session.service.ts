import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { GameSession, GameStatus } from '../models/session.model';

function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly state$ = new BehaviorSubject<GameSession[]>([
    { id: genId(), playerId: genId(), gameId: genId(), status: 'Active', startedAt: new Date().toISOString(), finalScore: 0 },
  ]);

  list(): Observable<GameSession[]> { return this.state$.asObservable(); }
  get(id: string): Observable<GameSession | undefined> { return this.list().pipe(map(arr => arr.find(x => x.id === id))); }

  create(payload: Omit<GameSession, 'id'>): Observable<GameSession> {
    const item: GameSession = { ...payload, id: genId() };
    this.state$.next([item, ...this.state$.value]);
    return of(item).pipe(delay(200));
  }

  update(id: string, changes: Partial<GameSession>): Observable<GameSession | undefined> {
    const items = this.state$.value.map(s => (s.id === id ? { ...s, ...changes } : s));
    this.state$.next(items);
    return of(items.find(s => s.id === id)).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    this.state$.next(this.state$.value.filter(s => s.id !== id));
    return of(true).pipe(delay(150));
  }
}
