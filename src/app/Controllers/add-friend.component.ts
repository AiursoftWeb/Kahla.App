import { Component, effect, OnInit, signal } from '@angular/core';
import { Values } from '../values';
import { SearchApiService } from '../Services/Api/SearchApiService';
import { ServerContactsRepository } from '../Repositories/ServerContactsRepository';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ServerThreadsRepository } from '../Repositories/ServerThreadsRepository';

@Component({
    templateUrl: '../Views/add-friend.html',
    styleUrls: ['../Styles/search-part.scss', '../Styles/button.scss', '../Styles/reddot.scss'],
})
export class AddFriendComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;

    searchTerm = signal('');
    selectedTab = signal(0);

    public contactsRepo?: ServerContactsRepository = null;
    public threadsRepo?: ServerThreadsRepository = null;

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
        this.threadsRepo = new ServerThreadsRepository(this.searchApiService, term);
        try {
            await this.contactsRepo.updateAll();
            await this.threadsRepo.updateAll();
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
