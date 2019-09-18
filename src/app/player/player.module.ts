import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { DeckPlayerComponent } from './deck-player/deck-player.component';
import { DeckMenuComponent } from './deck-menu/deck-menu.component';
import { DeckComponent } from './deck/deck.component';
import { CardComponent } from './card/card.component';

const routes: Routes = [
  { path: '', component: DeckMenuComponent, pathMatch: 'full' },
  { path: ':deck', component: DeckPlayerComponent },
];

@NgModule({
  declarations: [
    DeckPlayerComponent,
    DeckMenuComponent,
    DeckComponent,
    CardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class PlayerModule { }
