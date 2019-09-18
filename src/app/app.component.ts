import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ProfileService } from './profile.service';
import { UpdateService } from './update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  user = this.profileService.user;
  online = this.updates.online;
  updateAvailable = false;
  destroy = new Subject();


  constructor(
    private profileService: ProfileService,
    private updates: UpdateService
  ) {
    updates.subscribeToUpdates(this.destroy);
    updates.available
      .pipe(
        takeUntil(this.destroy),
        tap(update => console.log('update available', update))
      )
      .subscribe(() => (this.updateAvailable = true));
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }

  activateUpdate() {
    this.updates.activateUpdate();
  }

  clearUpdateMessage() {
    this.updateAvailable = false;
  }


}
