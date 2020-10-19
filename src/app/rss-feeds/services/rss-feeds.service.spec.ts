import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { MockStore } from '@ngrx/store/testing';

import { observable, Observable, of } from 'rxjs';
import {
  MockStoreModule,
  intialState,
} from 'src/app/test/mock/mock-store/mock-store.module';

import { RssFeedsService } from './rss-feeds.service';

describe('RssFeedsService', () => {
  let service: RssFeedsService;
  let store: MockStore;
  const URL_FEED = 'google.com';
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
  httpClientSpy.get.and.returnValue(of({ data: { feedUrl: URL_FEED } }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockStoreModule],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        // { provide: Store },
        // { provide: StateObservable },
        // { provide: ActionsSubject },
      ],
    });
    service = TestBed.inject(RssFeedsService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('set state to feedurls', () => {
    store.setState({ feedUrls: [URL_FEED] });

    let feedUrl = '';
    store.select('feedUrls').subscribe((res) => {
      feedUrl = res[0];
    });

    expect(feedUrl).toEqual(URL_FEED);
  });

  it('should call load feeds', () => {
    service.getRSSFeeds().subscribe((res) => {
      if(res && res.data)
      expect(res.data.feedUrl).toEqual(URL_FEED);
    });
  });
});
