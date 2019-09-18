import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'fc-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent {
  message = '';

  newUser = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private profileService: ProfileService, private router: Router) {}

  create() {
    this.message = 'Creating user, please wait...';
    const creationAttempt = this.profileService.createUser(this.newUser.value);

    creationAttempt.catch(
      res => (this.message = 'Unable to create user: ' + res.message)
    );

    creationAttempt.then(() => {
      this.message = 'User created, loging in...';
      this.profileService
        .login(this.newUser.value)
        .then(() => this.router.navigate(['/play']))
        .catch(() => (this.message = 'User created! Please login'));
    });
  }
}
