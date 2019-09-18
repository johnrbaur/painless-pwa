import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { ProfileService, User } from '../profile.service';
import { UpdateService } from '../update.service';

@Component({
  selector: 'fc-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
  profileForm: FormGroup;
  user: User | undefined;
  userSubscription: Subscription;
  isOnline = this.updateService.online;
  file: File | null = null;

  constructor(private profileService: ProfileService, private updateService: UpdateService) {
    this.profileForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl('')
    });

    this.userSubscription = this.profileService.user
      .pipe(
        filter(user => !!user),
        map(user => user as User),
        tap(user => (this.user = user))
      )
      .subscribe(user => {
        this.profileForm.setValue({
          firstName: user.firstName || null,
          lastName: user.lastName || null
        });
      });
  }

  selectFile(fileEvent: any) {
    this.file = fileEvent && fileEvent.target && fileEvent.target.files[0];
  }

  save() {
    this.profileService.updateProfile({ ...this.user, ...this.profileForm.value }, this.file);
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.profileService.logout();
  }
}
