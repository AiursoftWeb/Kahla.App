import { Component, effect, signal } from '@angular/core';
import { BlocksApiService } from '../Services/Api/BlocksApiService';
import { MyBlocksRepository } from '../Repositories/MyBlocksRepository';

@Component({
    templateUrl: '../Views/blocks-list.html',
    standalone: false
})
export class BlocksListComponent {
    blockedRepo: MyBlocksRepository;

    keywords = signal('');

    constructor(private blocksApiService: BlocksApiService) {
        effect(() => {
            this.blockedRepo = new MyBlocksRepository(this.blocksApiService, this.keywords());
            this.blockedRepo.updateAll();
        });
    }
}
