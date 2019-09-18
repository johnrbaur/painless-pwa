import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  Renderer2,
  ViewChild
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { environment } from '../../../environments/environment';

import { Deck, CardSide } from '../../deck-manager.service';

const deckStylesheetLinkId = 'flashcard-deck-stylesheet';

@Component({
  selector: 'fc-deck',
  templateUrl: './deck.component.html',
  styleUrls: ['./deck.component.scss']
})
export class DeckComponent implements OnChanges, AfterViewInit {
  @Input() deck?: Deck;

  currentCardSide!: CardSide;
  currentCardIndex!: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private element: ElementRef
  ) {
    this.startDeck();
  }

  @ViewChild('cardElRef', { read: ElementRef, static: false })
  cardElRef?: ElementRef;

  setCardScale() {
    if (!(this.cardElRef && this.element)) {
      return;
    }

    const deckNativeElement = this.element.nativeElement;
    const cardNativeElement = this.cardElRef.nativeElement;

    const scale = Math.min(
      (deckNativeElement.offsetWidth ) / cardNativeElement.offsetWidth,
      (deckNativeElement.offsetHeight) / cardNativeElement.offsetHeight
    );

    this.renderer.setStyle(
      cardNativeElement,
      'transform',
      `translate(-50%, -50%) scale(${scale})`
    );
  }

  @HostListener('window:resize', [])
  onResize() {
    this.setCardScale();
  }

  ngAfterViewInit() {
    this.setCardScale();
  }

  startDeck() {
    this.currentCardSide = 'problem';
    this.currentCardIndex = 0;

    this.unloadCss();
    if (this.deck && this.deck.stylesheetUrl) {
      this.loadCss(environment.serverUrl + '/' + this.deck.stylesheetUrl);
    }
  }

  advance() {
    if (!(this.deck && this.deck.cards)) {
      return;
    }

    // If the problem is visible, change to the solution.
    if (this.currentCardSide === 'problem') {
      this.currentCardSide = 'solution';
      return;
    }

    // If the solution is already visible, move to the next card
    // and show the problem. Move back to the first card if we've
    // reached the end of the deck.
    this.currentCardSide = 'problem';
    this.currentCardIndex++;
    if (this.currentCardIndex > (this.deck.cards.length - 1)) {
      this.currentCardIndex = 0;
    }
  }

  // XXX: DRY up and extract CSS loading/unloading code

  unloadCss() {
    const existingDeckStylesheetLink = this.document.getElementById(
      deckStylesheetLinkId
    ) as HTMLLinkElement;

    if (existingDeckStylesheetLink) {
      existingDeckStylesheetLink.remove();
    }
  }

  loadCss(url: string) {
    const head = this.document.getElementsByTagName('head')[0];

    const existingDeckStylesheetLink = this.document.getElementById(
      deckStylesheetLinkId
    ) as HTMLLinkElement;

    if (existingDeckStylesheetLink) {
      existingDeckStylesheetLink.href = url;
    } else {
      const deckStylesheetLink = this.document.createElement('link');
      deckStylesheetLink.id = deckStylesheetLinkId;
      deckStylesheetLink.rel = 'stylesheet';
      deckStylesheetLink.type = 'text/css';
      deckStylesheetLink.href = url;

      head.appendChild(deckStylesheetLink);
    }
  }

  ngOnChanges() {
    // The deck is the only input property, so any change detected
    // here means that the deck has changed.
    this.startDeck();
  }
}
