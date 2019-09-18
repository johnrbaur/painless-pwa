import { Component } from '@angular/core';

import { ProfileService } from './profile.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  user = this.profileService.user;

  constructor(private profileService: ProfileService) { }
}
