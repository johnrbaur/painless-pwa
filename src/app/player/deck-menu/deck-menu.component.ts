import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { DeckManagerService, Deck } from '../../deck-manager.service';

@Component({
  selector: 'fc-deck-menu',
  templateUrl: './deck-menu.component.html',
  styleUrls: ['./deck-menu.component.scss']
})
export class DeckMenuComponent {
  decks: Observable<Deck[]>;

  constructor(loader: DeckManagerService) {
    this.decks = loader.loadAllDecks();
  }
}
