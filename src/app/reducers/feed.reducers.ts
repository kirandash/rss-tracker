import { Action, createReducer, on } from '@ngrx/store';
import * as FeedActions from '../actions/feed.actions';
export const intialState = {
  feedUrls: [
    'https://www.smh.com.au/rss/feed.xml',
    'assets/mocks/mock.feed.json',
  ],
  newFeedUrl: '',
  rssFeeds: [],
  activeFeed: '',
  articles: {},
};
const reducer = createReducer(
  intialState,
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

      const newResult = activeArticles.item
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

      const oldResult = stateArticles.filter((o1) => {
        return activeArticles.item.some((o2) => {
          return o1.guid === o2.guid;
        });
      });

      console.log(oldResult);

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

      return {
        ...state,
        articles: { ...state.articles, [state.activeFeed]: updateArticles },
      };
    } else if (activeArticles) {
      return {
        ...state,
        articles: {
          ...state.articles,
          [state.activeFeed]: activeArticles.item,
        },
      };
    } else {
      return state;
    }
  }),
  on(FeedActions.updateActiveFeed, (state, { payload }) => {
    return { ...state, activeFeed: payload.activeFeed };
  }),
  on(FeedActions.feedsLoaded, (state, { payload }) => {
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
    const index = feedUrls.indexOf(payload.rssUrl);
    feedUrls.splice(index, 1);
    const rssFeeds = [...state.rssFeeds];
    const rssFeedIndex = rssFeeds.findIndex((rssFeed) => {
      return rssFeed.rssUrl === payload.rssUrl;
    });
    let activeFeed = state.activeFeed;
    const articles = { ...state.articles };
    if (rssFeedIndex !== -1) {
      rssFeeds.splice(index, 1);
    }
    if (state.activeFeed === payload.rssUrl) {
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

export const FeedReducer = (state: any, action: Action): any => {
  return reducer(state, action);
};