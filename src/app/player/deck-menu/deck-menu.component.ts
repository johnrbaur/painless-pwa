import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { DeckManagerService, Deck } from '../../deck-manager.service';
import { NotificationsService } from '../../notifications.service';
import { UpdateService } from '../../update.service';

@Component({
  selector: 'fc-deck-menu',
  templateUrl: './deck-menu.component.html',
  styleUrls: ['./deck-menu.component.scss']
})
export class DeckMenuComponent {
  decks: Observable<Deck[]>;
  online = this.update.online;

  constructor(
    loader: DeckManagerService,
    private notifications: NotificationsService,
    private update: UpdateService,
  ) {
    this.decks = loader.loadAllDecks();
  }

  promptNotifications() {
    this.notifications.subscribeToAll();
  }
}
