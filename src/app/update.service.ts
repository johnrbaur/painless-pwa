import { Injectable, ApplicationRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { merge, fromEvent, of, Observable, interval, concat } from 'rxjs';
import { mapTo, first, takeUntil, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  available = this.swUpdate.available;
  online = merge(
    fromEvent(window, 'online').pipe(mapTo(true)),
    fromEvent(window, 'offline').pipe(mapTo(false)),
    of(navigator.onLine)
  );

  constructor(private swUpdate: SwUpdate, private appRef: ApplicationRef) {}

  subscribeToUpdates(unsubscribe: Observable<any>) {
    if (this.swUpdate.isEnabled) {
      const isStable = this.appRef.isStable.pipe(
        first(stable => stable === true)
      );
      const updateInterval = interval(30 * 1000); // check every 30 seconds
      const updateOnceAppIsStable = concat(isStable, updateInterval);
      updateOnceAppIsStable
        .pipe(
          takeUntil(unsubscribe),
          tap(() => console.log('checking for updates'))
        )
        .subscribe(() => this.swUpdate.checkForUpdate());
    }
  }

  activateUpdate() {
    this.swUpdate.activateUpdate().then(() => document.location.reload());
  }
}
