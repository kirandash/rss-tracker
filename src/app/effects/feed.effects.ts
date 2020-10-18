import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import * as xmlParser from 'fast-xml-parser';
import { EMPTY, of } from 'rxjs';
import * as FeedActions from '../actions/feed.actions';
import { RssFeedsService } from 'src/app/rss-feeds/services/rss-feeds.service';
import { Action, select, Store } from '@ngrx/store';
import { AppState, Article, Feed } from 'src/app/models/app-state';
/**
 * this is effect file is intended to listen to
 * ngrx store actions which are dispatched from components and services
 * and calls if any side effects(like asynchronous api calls) for the action and
 * returns specified action to dispatch
 */
@Injectable({
  providedIn: 'root',
})
export class FeedEffects {
  loadFeeds$ = createEffect(() =>
    this.actions$.pipe(
      ofType('[RSS Feed Page] Load Feeds'),
      mergeMap(() =>
        this.rssFeedService.getRSSFeeds().pipe(
          switchMap((feeds) => {
            let activeFeed = '';
            let newFeedUrl = '';
            const jsonFeeds = feeds.map((feed, i) => {
              let feedObject = feed;
              if (xmlParser.validate(feedObject) === true) {
                feedObject = xmlParser.parse(feedObject).rss.channel;
              } else {
                feedObject = JSON.parse(feedObject);
              }
              const subscription = this.store
                .pipe(select('feeds'))
                .subscribe((res: AppState) => {
                  newFeedUrl = res.newFeedUrl;
                  feedObject.rssUrl = res.feedUrls[i];
                  activeFeed = res.activeFeed;
                });
              subscription.unsubscribe();
              if (feedObject.rssUrl.indexOf('assets') !== -1) {
                feedObject.item.unshift(this.createRandomObj());
              }

              return feedObject;
            });
            const actonsArray: Array<Action> = [
              FeedActions.feedsLoaded({ payload: jsonFeeds }),
            ];

            const feedUrl = !activeFeed ? jsonFeeds[0].rssUrl : newFeedUrl;

            if (feedUrl) {
              actonsArray.push(
                FeedActions.updateActiveFeed({
                  payload: { activeFeed: feedUrl },
                })
              );
            }

            actonsArray.push(FeedActions.getArticlesByFeed());

            return [...actonsArray];
          }),
          catchError((err) => {
            console.log(err);
            return of(
              FeedActions.updateError({
                payload: { error: 'Oops! Could not load RSS Feed. Please try again.' },
              }),
              FeedActions.deleteFeed({
                payload: { rssUrl: err.url },
              })
            );
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private rssFeedService: RssFeedsService,
    private store: Store<{ feeds: AppState }>
  ) {}

  /**
   * returns random object
   * this method is intended to generate random object
   */
  createRandomObj(): object {
    const generatedObj = {
      'dc:creator': '',
      description: this.randomString(this.randomInt(4) + 4),
      guid: this.randomInt(1000),
      link:
        'https://www.smh.com.au/world/north-america/twitter-restricts-trumps-campaign-account-from-tweeting-20201016-p565md.html?ref=rss&amp;utm_medium=rss&amp;utm_source=rss_feed',
      pubDate: new Date(),
      title:
        this.randomString(this.randomInt(10) + 10) +
        ' ' +
        this.randomString(this.randomInt(10) + 10),
    };
    return generatedObj;
  }

  /**
   * return floor value of generated random number
   * @param rightBound number to mutliply with random number
   */
  randomInt(rightBound): number {
    return Math.floor(Math.random() * rightBound);
  }

  /**
   * returns generated string
   * @param size lenght of the string to be generated
   */
  randomString(size): string {
    const alphaChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let generatedString = '';
    for (let i = 0; i < size; i++) {
      generatedString += alphaChars[this.randomInt(alphaChars.length)];
    }

    return generatedString;
  }
}
