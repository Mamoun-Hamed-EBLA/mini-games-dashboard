import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShortcutService {
  private apiKeyRouteRequested = false;

  markApiKeyRouteRequested() {
    this.apiKeyRouteRequested = true;
  }

  consumeApiKeyRouteRequested(): boolean {
    const val = this.apiKeyRouteRequested;
    this.apiKeyRouteRequested = false;
    return val;
  }
}
