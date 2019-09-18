import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { ProfileService, User } from '../profile.service';

@Component({
  selector: 'fc-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
  profileForm: FormGroup;
  user: User | undefined;
  userSubscription: Subscription;

  constructor(
    private profileService: ProfileService,
  ) {
    this.profileForm = new FormGroup({
      firstName: new FormControl(''),
      lastName: new FormControl('')
    });

    this.userSubscription = this.profileService.user
      .pipe(
        filter(user => !!user),
        map(user => user as User),
        tap(user => this.user = user),
      )
      .subscribe(user => {
        this.profileForm.setValue({
          firstName: user.firstName || null,
          lastName: user.lastName || null
        });
      });

  }

  save() {
    this.profileService.updateProfile(
      { ...this.user, ...this.profileForm.value },
    );
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this.profileService.logout();
  }
}
