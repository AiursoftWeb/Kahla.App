import { Component, effect, EventEmitter, Input, model, Output, signal } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';

@Component({
    selector: 'app-search-area',
    templateUrl: '../Views/search-area.html',
    styleUrls: ['../Styles/search-area.scss', '../Styles/button.scss'],
})
export class SearchAreaComponent {
    searchText = model('');

    @Input() placeHolder = 'Search...';

    @Output() positiveClicked = new EventEmitter<void>();

    debounceTime = model(500);

    searchTextInput = signal('');

    private searchSubject = new Subject<string>();

    constructor() {
        effect(
            () => {
                if (this.searchTextInput().length == 0) {
                    this.searchText.set('');
                }
                this.searchSubject.next(this.searchTextInput());
            },
            {
                allowSignalWrites: true,
            }
        );

        effect(cleanup => {
            const sub = this.searchSubject
                .pipe(debounceTime(this.debounceTime()))
                .subscribe(term => {
                    this.searchText.set(term);
                });
            cleanup(() => {
                sub.unsubscribe();
            });
        });
    }

    onpositiveClicked() {
        this.searchText.set(this.searchTextInput());
        this.positiveClicked.emit();
    }
}
