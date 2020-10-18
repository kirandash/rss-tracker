import { Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs/operators';
import { AppState, Article } from 'src/app/models/app-state';
import * as FeedAction from '../../../actions/feed.actions';

@Component({
  selector: 'app-main-content',
  templateUrl: './main-content.component.html',
  styleUrls: ['./main-content.component.scss'],
})
export class MainContentComponent implements OnInit {
  articles: Array<Article> = [];
  constructor(private store: Store<{ feeds: AppState }>) {}

  ngOnInit(): void {
    /**
     * this code sinppet subscribes to store changes
     * after successful subscription it will read articles form state and copy it to
     * property
     */
    this.store
      .pipe(select('feeds'), distinctUntilChanged())
      .subscribe((res) => {
        this.articles = res.articles[res.activeFeed];
      });
  }
}
