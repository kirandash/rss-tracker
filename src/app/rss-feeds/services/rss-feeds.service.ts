import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { forkJoin, Observable } from 'rxjs';
import { AppState } from 'src/app/models/app-state';

@Injectable({
  providedIn: 'root',
})
export class RssFeedsService {
  urls$: Observable<AppState>;
  urlList: Array<string>;
  constructor(
    private httpClient: HttpClient,
    private store: Store<{ feeds: AppState }>
  ) {
    this.urls$ = store.pipe(select('feeds'));
    this.urls$.subscribe((res) => {
      this.urlList = res ? res.feedUrls : [];
    });
  }

  getRSSFeeds(): Observable<any> {
    const requestOptions: object = {
      observe: 'body',
      responseType: 'text',
    };
    const urlsToCall = this.urlList.map((url) => {
      return this.httpClient.get(url, requestOptions);
    });

    return forkJoin(urlsToCall);
  }
}
