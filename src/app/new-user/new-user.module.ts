import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NewUserComponent } from './new-user.component';

const routes: Routes = [
  { path: '', component: NewUserComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [NewUserComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)]
})
export class NewUserModule {}
