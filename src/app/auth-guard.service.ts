// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ProfileService } from './profile.service';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, public profileService: ProfileService) {}
  canActivate() {
    return this.profileService.user.pipe(
      take(1),
      map(user => (user ? true : this.router.parseUrl('/login')))
    );
  }
}
