/**
 * this is reducer file is intended to listen to
 * the ngrx store actions which are dispatched from components and services
 * to communicate with store and state and returns
 * new state without mutating existing state
 */
import { Action, createReducer, on } from '@ngrx/store';
import { AppState } from 'src/app/models/app-state';
import * as FeedActions from '../actions/feed.actions';

export const intialState: AppState = {
  feedUrls: [
    'https://www.smh.com.au/rss/feed.xml',
    'assets/mocks/mock.feed.json'
  ],
  newFeedUrl: '',
  rssFeeds: [],
  activeFeed: '',
  articles: {},
  error: '',
};
const reducer = createReducer(
  intialState,
  on(FeedActions.updateError, (state, { payload }) => {
    return { ...state, error: payload.error };
  }),
  on(FeedActions.loadFeeds, (state) => state),
  on(FeedActions.resetArticles, (state) => state),
  on(FeedActions.getArticlesByFeed, (state) => {
    const activeArticles = state.rssFeeds.find((feed) => {
      return feed.rssUrl === state.activeFeed;
    });
    const stateArticles = state.articles[state.activeFeed] || [];
    if (stateArticles.length && activeArticles) {
      const deletedResult = stateArticles
        .filter((o1) => {
          return !activeArticles.item.some((o2) => {
            return o1.guid === o2.guid;
          });
        })
        .map((resObj) => {
          const temp = { ...resObj };
          temp.status = 'deleted';
          return temp;
        });

      const newResult = getNewArticles(activeArticles, stateArticles);

      const oldResult = stateArticles.filter((o1) => {
        return activeArticles.item.some((o2) => {
          return o1.guid === o2.guid;
        });
      });

      const updateArticles = [...newResult, ...deletedResult, ...oldResult];
      updateArticles.sort((a, b) => {
        if (a.pubDate > b.pubDate) {
          return -1;
        }

        if (b.pubDate > a.pubDate) {
          return 1;
        }

        return 0;
      });

      if (newResult.length > 0) {
        return {
          ...state,
          articles: { ...state.articles, [state.activeFeed]: updateArticles },
        };
      } else {
        return state;
      }
    } else if (activeArticles) {
      const articles = [...activeArticles.item];
      articles.sort((a, b) => {
        if (a.pubDate > b.pubDate) {
          return -1;
        }

        if (b.pubDate > a.pubDate) {
          return 1;
        }

        return 0;
      });
      return {
        ...state,
        articles: {
          ...state.articles,
          [state.activeFeed]: articles,
        },
      };
    } else {
      return state;
    }
  }),
  on(FeedActions.updateActiveFeed, (state, { payload }) => {
    return { ...state, activeFeed: payload.activeFeed, newFeedUrl: '' };
  }),
  on(FeedActions.feedsLoaded, (state, { payload }) => {
    const activeArticles = payload.find((feed) => {
      return feed.rssUrl === state.activeFeed;
    });
    const stateArticles = state.articles[state.activeFeed] || [];
    const newResults = getNewArticles(activeArticles, stateArticles, true);
    if (newResults.length === 0) {
      return state;
    }
    return { ...state, rssFeeds: payload };
  }),
  on(FeedActions.addNewFeedUrl, (state, { payload }) => {
    const feedUrls = [...state.feedUrls];
    if (feedUrls.indexOf(payload.url) === -1) {
      feedUrls.push(payload.url);
    }
    return { ...state, feedUrls, newFeedUrl: payload.url };
  }),
  on(FeedActions.deleteFeed, (state, { payload }) => {
    const feedUrls = [...state.feedUrls];
    let { rssUrl } = { ...payload };
    const originIndex = rssUrl.indexOf(location.origin);
    if (originIndex !== -1) {
      rssUrl = rssUrl.split(location.origin + '/')[1];
    }
    const index = feedUrls.indexOf(rssUrl);
    feedUrls.splice(index, 1);
    const rssFeeds = [...state.rssFeeds];
    const rssFeedIndex = rssFeeds.findIndex((rssFeed) => {
      return rssFeed.rssUrl === rssUrl;
    });
    let activeFeed = state.activeFeed;
    const articles = { ...state.articles };
    if (rssFeedIndex !== -1) {
      rssFeeds.splice(index, 1);
    }
    if (state.activeFeed === rssUrl) {
      activeFeed = (rssFeeds.length && rssFeeds[0].rssUrl) || '';
      delete articles[state.activeFeed];
    }

    return {
      ...state,
      rssFeeds,
      feedUrls,
      activeFeed,
      articles,
      newFeedUrl: '',
    };
  })
);

const getNewArticles = (activeArticles, stateArticles, fromLoadFeeds?) => {
  let newResult = [];
  if (activeArticles) {
    newResult = activeArticles.item
      .filter((o1) => {
        return !stateArticles.some((o2) => {
          return o1.guid === o2.guid;
        });
      })
      .map((resObj) => {
        const temp = { ...resObj };
        temp.status = 'new';
        return temp;
      });
  } else if (fromLoadFeeds) {
    newResult.push('some data');
  }

  return newResult;
};

export const FeedReducer = (state: AppState, action: Action): AppState => {
  return reducer(state, action);
};
