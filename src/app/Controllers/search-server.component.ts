import { Component, effect, signal } from '@angular/core';
import { Values } from '../values';
import { SearchApiService } from '../Services/Api/SearchApiService';
import { ServerContactsRepository } from '../Repositories/ServerContactsRepository';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ServerThreadsRepository } from '../Repositories/ServerThreadsRepository';

@Component({
    templateUrl: '../Views/search-server.html',
    styleUrls: ['../Styles/search-part.scss', '../Styles/button.scss', '../Styles/reddot.scss'],
    standalone: false,
})
export class SearchServerComponent {
    public loadingImgURL = Values.loadingImgURL;

    searchTerm = signal('');
    selectedTab = signal(0);

    public contactsRepo?: ServerContactsRepository = undefined;
    public threadsRepo?: ServerThreadsRepository = undefined;

    constructor(private searchApiService: SearchApiService) {
        effect(() => {
            if (this.searchTerm().length > 0) {
                void this.search(this.searchTerm());
            }
        });
    }

    public async search(term: string) {
        this.contactsRepo = new ServerContactsRepository(this.searchApiService, term);
        this.threadsRepo = new ServerThreadsRepository(this.searchApiService, term);
        try {
            await Promise.all([this.contactsRepo.updateAll(), this.threadsRepo.updateAll()]);
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
