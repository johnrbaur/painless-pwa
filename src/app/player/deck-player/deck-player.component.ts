import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, filter, switchMap, shareReplay } from 'rxjs/operators';

import { DeckManagerService, Deck } from '../../deck-manager.service';

@Component({
  selector: 'fc-deck-player',
  templateUrl: './deck-player.component.html',
  styleUrls: ['./deck-player.component.scss']
})
export class DeckPlayerComponent {
  deck: Observable<Deck | undefined>;

  constructor(route: ActivatedRoute, loader: DeckManagerService) {
    this.deck = route.paramMap.pipe(
      map(paramMap => paramMap.get('deck') as string),
      filter(deckName => !!deckName),
      switchMap(deckName => loader.loadDeck(deckName)),
      shareReplay()
    );
  }
}
