import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Game } from '../models/game.model';

function genId() {
  // lightweight GUID-like id
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly state$ = new BehaviorSubject<Game[]>([
    { id: genId(), name: 'Galaxy Raiders', description: 'Fast paced space shooter', maxScore: 999999, timeLimit: 15, isActive: true, rules: 'Avoid asteroids' },
    { id: genId(), name: 'Mystic Quest', description: 'Explore and conquer', maxScore: 50000, timeLimit: 60, isActive: true },
    { id: genId(), name: 'Speed Rush', description: 'Arcade racing', maxScore: 200000, timeLimit: 5, isActive: false },
  ]);

  list(): Observable<Game[]> { return this.state$.asObservable(); }
  get(id: string): Observable<Game | undefined> { return this.list().pipe(map(arr => arr.find(x => x.id === id))); }

  create(payload: Omit<Game, 'id'>): Observable<Game> {
    const item: Game = { ...payload, id: genId() };
    this.state$.next([item, ...this.state$.value]);
    return of(item).pipe(delay(200));
  }

  update(id: string, changes: Partial<Game>): Observable<Game | undefined> {
    const items = this.state$.value.map(g => (g.id === id ? { ...g, ...changes } : g));
    this.state$.next(items);
    return of(items.find(g => g.id === id)).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    this.state$.next(this.state$.value.filter(g => g.id !== id));
    return of(true).pipe(delay(150));
  }
}
