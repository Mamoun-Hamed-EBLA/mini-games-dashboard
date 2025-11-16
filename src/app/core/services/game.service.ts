import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Game } from '../models/game.model';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly reload$ = new BehaviorSubject<void>(undefined);
  constructor(private http: HttpClient) {}

  refresh() { this.reload$.next(); }

  list(): Observable<Game[]> {
    return this.reload$.pipe(
      switchMap(() => this.http.get<any>('Games')),
      map(resp => (resp?.data ?? resp) as Game[])
    );
  }

  get(id: string): Observable<Game> {
    return this.http.get<any>(`Games/${id}`).pipe(map(r => (r?.data ?? r) as Game));
  }

  create(payload: Omit<Game, 'id'>): Observable<Game> {
    return this.http.post<any>('Games', payload).pipe(
      map(r => (r?.data ?? r) as Game),
      tap(() => this.refresh())
    );
  }

  update(id: string, changes: Partial<Game>): Observable<Game> {
    return this.http.put<any>(`Games/${id}`, changes).pipe(
      map(r => (r?.data ?? r) as Game),
      tap(() => this.refresh())
    );
  }

  delete(id: string): Observable<boolean> {
    return this.http.delete<any>(`Games/${id}`).pipe(
      map(() => true),
      tap(() => this.refresh())
    );
  }
}
