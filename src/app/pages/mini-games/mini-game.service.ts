import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MiniGame } from './mini-game.model';
import { BaseCrudService } from '../../core/services/base-crud.service';

@Injectable({ providedIn: 'root' })
export class MiniGameService extends BaseCrudService<MiniGame, void, MiniGame[]> {
  constructor(http: HttpClient) {
    super(http, 'MiniGames');
  }

  override list(): Observable<MiniGame[]> {
    return this.reload$.pipe(
      switchMap(() => this.http.get<any>(this.endpoint)),
      map(resp => (resp?.data ?? resp) as MiniGame[])
    );
  }

  lookup(): Observable<{ label: string; value: string }[]> {
    return this.http.get<any>(this.endpoint+'/lookup').pipe(
      map(resp => (resp?.data ?? resp) )
    );
  }
}
