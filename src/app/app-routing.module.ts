import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuardService],
    redirectTo: 'play',
    pathMatch: 'full'
  },
  {
    path: 'play',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./player/player.module').then(m => m.PlayerModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'new-user',
    loadChildren: () =>
      import('./new-user/new-user.module').then(m => m.NewUserModule)
  },
  {
    path: 'profile',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./profile/profile.module').then(m => m.ProfileModule)
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
