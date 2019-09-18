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
}

const templateUrlPropNames = [
  'problemTemplateUrl',
  'solutionTemplateUrl'
] as const;

const isNonEmptyString = (s: any) => s && typeof s === 'string';

@Injectable({
  providedIn: 'root'
})
export class DeckManagerService {
  constructor(
    private http: HttpClient,
    private profileService: ProfileService
  ) {}

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
      catchError(err => {
        if (err.status === 401) {
          this.profileService.logout();
        }
        return NEVER;
      })
    );
  }

  loadAllDecks(): Observable<Deck[]> {
    return this.http.get<Deck[]>(baseApiUrl + '/decks');
  }
}
