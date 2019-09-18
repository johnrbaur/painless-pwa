import { Component } from '@angular/core';

import { ProfileService } from './profile.service';
import { UpdateService } from './update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user = this.profileService.user;
  online = this.updates.online;

  constructor(
    private profileService: ProfileService,
    private updates: UpdateService
  ) { }
}
