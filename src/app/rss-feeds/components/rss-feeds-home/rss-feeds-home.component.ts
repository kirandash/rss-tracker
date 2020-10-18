import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { AppState, Feed } from 'src/app/models/app-state';
import {
  delay,
  distinctUntilChanged,
  mergeMap,
  repeat,
  tap,
} from 'rxjs/operators';
import * as FeedAction from '../../../actions/feed.actions';

@Component({
  selector: 'app-rss-feeds-home',
  templateUrl: './rss-feeds-home.component.html',
  styleUrls: ['./rss-feeds-home.component.scss'],
})
export class RssFeedsHomeComponent implements OnInit {
  feeds$: Observable<AppState>;
  channels: Array<Feed> = [];
  activeFeed: string;
  error: string;
  constructor(private store: Store<{ feeds: AppState }>) {
    this.feeds$ = store.pipe(select('feeds'));
  }

  ngOnInit(): void {
    this.subscribeToStore();
    this.pollTheLoadFeeds();
  }

  /**
   * subscribe to store to listen for new  rss feeds added and
   * for existing rssFeeds update and active feed update
   */
  subscribeToStore(): void {
    this.feeds$.pipe(distinctUntilChanged()).subscribe((res) => {
      if (res.feedUrls.length !== this.channels.length) {
        this.channels = res.rssFeeds;
      }

      this.activeFeed = res.activeFeed;
      this.error = res.error;
      if (this.error) {
        setTimeout(() => {
          this.store.dispatch(
            FeedAction.updateError({ payload: { error: '' } })
          );
        }, 2000);
      }
    });
  }

  /**
   * dispatches loadFeeds action based on interval passed to delay method
   * to get the article updates of rss feeds
   */
  pollTheLoadFeeds(): void {
    const poll = of({}).pipe(
      mergeMap((_) => of(this.store.dispatch(FeedAction.loadFeeds()))),
      delay(3000),
      repeat()
    );

    poll.subscribe();
  }
}
