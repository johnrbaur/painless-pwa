import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ProfileService } from '../profile.service';

@Component({
  selector: 'fc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginMessage = '';

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor(private profileService: ProfileService, private router: Router) {}

  login() {
    this.loginMessage = 'Signing in, please wait...';
    this.profileService
      .login(this.loginForm.value)
      .then(() => {
        this.router.navigate(['/play']);
      })
      .catch(res => (this.loginMessage = 'unable to login: ' + res.message));
  }
}
