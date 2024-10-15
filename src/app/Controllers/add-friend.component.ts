import { Component, effect, OnInit, signal } from '@angular/core';
import { Values } from '../values';
import { SearchApiService } from '../Services/Api/SearchApiService';
import { ServerContactsRepository } from '../Repositories/ServerContactsRepository';
import { showCommonErrorDialog } from '../Helpers/CommonErrorDialog';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/add-friend.scss', '../Styles/button.scss', '../Styles/reddot.scss'],
})
export class AddFriendComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;

    searchTerm = signal('');

    public contactsRepo?: ServerContactsRepository = null;

    constructor(private searchApiService: SearchApiService) {
        effect(() => {
            if (this.searchTerm().length > 0) {
                this.search(this.searchTerm());
            }
        });
    }

    public ngOnInit(): void {
        const searchBar = document.querySelector('#searchBar') as HTMLTextAreaElement;
        searchBar.focus();
    }

    public async search(term: string) {
        this.contactsRepo = new ServerContactsRepository(this.searchApiService, term);
        try {
            await this.contactsRepo.updateAll();
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
