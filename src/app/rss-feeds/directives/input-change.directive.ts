import { Directive, ElementRef, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import * as FeedAction from '../../actions/feed.actions';

@Directive({
  selector: '[appInputChange]',
})
export class InputChangeDirective {
  constructor(private store: Store) {}
  @HostListener('keyup', ['$event'])
  _handleValueChange(event): void {
    if (event.which === 13 && event.target.value) {
      this.onChange(event.target.value);
      event.target.value = '';
    }
  }

  onChange(val): void {
    this.store.dispatch(FeedAction.addNewFeedUrl({ payload: { url: val } }));
    // this.store.dispatch(
    //   FeedAction.updateActiveFeed({ payload: { activeFeed: val } })
    // );
    this.store.dispatch(FeedAction.loadFeeds());
  }
}
