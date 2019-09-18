import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  token: string;
  user: User;
}

interface UserForm {
  username: string;
  password: string;
}

export interface User {
  firstName: string;
  lastName: string;
  avatar: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  user = new BehaviorSubject<User | undefined>(undefined);

  constructor(private http: HttpClient, private router: Router) {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.user.next(user);
    }
  }

  updateProfile(basicInfo: Partial<User>, file: File | null) {
    let formData: FormData | any;

    let url: string;
    if (file && file !== null) {
      formData = new FormData();
      formData.append('firstName', basicInfo.firstName);
      formData.append('lastName', basicInfo.lastName);
      formData.append('username', basicInfo.username);
      formData.append('file', file);
      url = '/update-profile-with-avatar';
    } else {
      formData = basicInfo;
      url = '/update-profile';
    }
    return this.http
      .post<User>(environment.serverUrl + url, formData)
      .toPromise()
      .then(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.user.next(user);
      })
      .catch(err => {
        if (err.status === 401) {
          this.logout();
        }
      });
  }

  login(form: UserForm) {
    return this.http
      .post<LoginResponse>(environment.serverUrl + '/login', form)
      .toPromise()
      .then(loginResponse => {
        localStorage.setItem('token', loginResponse.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
        this.user.next(loginResponse.user);
      });
  }

  createUser(form: UserForm) {
    return (
      this.http
        .post(environment.serverUrl + '/create-user', form)
        .toPromise()
        // tslint:disable-next-line: variable-name
        .then(_createUserResponse => this.login(form))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.user.next(undefined);
    this.router.navigate(['/login']);
  }
}
