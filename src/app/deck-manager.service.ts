import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, NEVER } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';

import { omit } from 'lodash-es';

import { environment } from '../environments/environment';
import { ProfileService } from './profile.service';

const baseApiUrl = environment.serverUrl + '/api';
const assetsUrl = environment.serverUrl;

export interface Card {
  solution: {
    [prop: string]: any;
  };
  problem: {
    [prop: string]: any;
  };
}

export type CardSide = 'problem' | 'solution';

// Raw data returned from an API call, with the templates available as
// URLs, but without the contents of the referenced files.
interface DeckData {
  id: string;
  name: string;
  problemTemplateUrl: string;
  solutionTemplateUrl: string;
  stylesheetUrl: string;
  cards: Card[];
}

// Fully-populated deck object, with the templates available as strings.
export interface Deck {
  id: string;
  name: string;
  problemTemplate?: string;
  solutionTemplate?: string;
  stylesheetUrl?: string;
  cards: Card[];
  cached?: boolean;
}

const templateUrlPropNames = ['problemTemplateUrl', 'solutionTemplateUrl'] as const;

const isNonEmptyString = (s: any) => s && typeof s === 'string';

function preloadImage(imageUrl: string): void {
  console.log('Preloading image:', imageUrl);
  const img = new Image();
  img.src = imageUrl;
}

function preloadAnyImages(deck: Deck): void {
  const imagesUrl = environment.serverUrl + '/' + deck.id + '/images';

  deck.cards.forEach((card: Card) => {
    const imageRelativeUrls: string[] = [card.problem.image, card.solution.image];

    imageRelativeUrls.forEach(ru => {
      if (ru) {
        preloadImage(imagesUrl + '/' + ru);
      }
    });
  });
}

@Injectable({
  providedIn: 'root'
})
export class DeckManagerService {
  constructor(private http: HttpClient, private profileService: ProfileService) {}

  // Load text without trying to process it as JSON.
  loadTextFile(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }

  loadDeckExtras(dd: DeckData) {
    // Only attempt to load from URLs that have non-empty string values.
    const loaders: Observable<string>[] = templateUrlPropNames
      .filter(prop => isNonEmptyString(dd[prop]))
      .map((prop: typeof templateUrlPropNames[number]) =>
        this.loadTextFile(assetsUrl + '/' + dd[prop])
      );

    // Convert the array of results to a dictionary, for easier
    // handling downstream.
    //
    // XXX: Switch to dictionary forkJoin() once we're on RxJS 6.5+,
    // since it'll do most of this for us.

    return forkJoin(loaders).pipe(
      map(extrasArray => ({
        problemTemplate: extrasArray[0],
        solutionTemplate: extrasArray[1]
      }))
    );
  }

  // Load the raw deck data, then load the referenced templates.
  loadDeck(deckName: string): Observable<Deck> {
    // Accumulate the values from multple HTTP requests
    // into a single object.
    let results: DeckData;

    return this.http.get<DeckData>(baseApiUrl + '/decks/' + deckName).pipe(
      // Hold on the to the raw deck data in the results
      // object, so we can add more stuff to it as we go.
      tap(dd => (results = { ...dd })),

      // Load the templates for this deck.
      switchMap(dd => this.loadDeckExtras(dd)),

      // Now that the templates are populated
      // inside results, build the deck object itself, leaving
      // out the template URL properties.
      map(
        ({ problemTemplate, solutionTemplate }) =>
          ({
            ...omit(results, templateUrlPropNames),
            problemTemplate,
            solutionTemplate
          } as Deck)
      ),
      // Preload any images inside the deck
      tap(deck => preloadAnyImages(deck)),

      catchError(err => {
        if (err.status === 401) {
          this.profileService.logout();
        }
        return NEVER;
      })
    );
  }

  loadAllDecks(): Observable<Deck[]> {
    return forkJoin([
      this.http.get<Deck[]>(baseApiUrl + '/decks'),
      cachedRequests(),
    ]).pipe(
      map(([decks, requests]) => decks.map(deck => {
        if (requests.find(req => req.url.includes(`decks/${deck.id}`))) {
          deck.cached = true;
        }
        console.log(deck);
        return deck;
      }))
    );
  }
}

async function cachedRequests(): Promise<Request[]> {
  // Get a list of all of the caches for this origin
  const cacheNames = await caches.keys();
  const result = [];

  for (const name of cacheNames) {
    // Open the cache
    const cache = await caches.open(name);

    // Get a list of entries. Each item is a Request object
    for (const request of await cache.keys()) {
      result.push(request);
    }
  }

  return result;
}
