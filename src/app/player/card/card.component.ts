import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SecurityContext
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Deck, Card, CardSide } from '../../deck-manager.service';
import { environment } from '../../../environments/environment';
import { processTemplate } from '../../stupid-template-processor';

@Component({
  selector: 'fc-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnChanges, OnInit {
  @Input() card?: Card;
  @Input() deck?: Deck;
  @Input() problemTemplate  = '';
  @Input() solutionTemplate = '';
  @Input() side: CardSide = 'problem';

  problemHtml: string | null = '';
  solutionHtml: string | null = '';

  constructor(private sanitizer: DomSanitizer) { }

  prepareCardTemplates() {
    let imagesUrl = '';

    if (this.deck) {
      imagesUrl = environment.serverUrl + '/' + this.deck.id + '/images';
    }

    this.problemHtml = this.sanitizer.sanitize(
      SecurityContext.HTML,
      processTemplate(
        this.problemTemplate,
        {
          ...(this.card && this.card.problem),
          imagesUrl
        }
      )
    );

    this.solutionHtml = this.sanitizer.sanitize(
      SecurityContext.HTML,
      processTemplate(
        this.solutionTemplate,
        {
          ...(this.card && this.card.solution),
          imagesUrl
        }
      )
    );
  }

  ngOnInit() {
    this.prepareCardTemplates();
  }

  ngOnChanges() {
    this.prepareCardTemplates();
  }
}
