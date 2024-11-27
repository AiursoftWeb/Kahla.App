import { Component, input, resource } from '@angular/core';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { lastValueFrom } from 'rxjs';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ContactsApiService } from '../Services/Api/ContactsApiService';

@Component({
    selector: 'app-thread-info-public',
    templateUrl: '../Views/thread-info-public.html',
    styleUrls: ['../Styles/thread-info-public.scss'],
    standalone: false,
})
export class ThreadInfoPublicComponent {
    id = input.required<number>();

    threadInfo = resource({
        request: () => this.id(),
        loader: async ({ request }) => {
            try {
                return (await lastValueFrom(this.threadsApiService.DetailsAnonymous(request)))
                    .thread;
            } catch (err) {
                showCommonErrorDialog(err);
            }
        },
    });

    ownerInfo = resource({
        request: () => this.threadInfo.value()?.ownerId,
        loader: async ({ request }) => {
            if (!request) return null;
            try {
                return await lastValueFrom(this.contactsApiService.Details(request, 1));
            } catch (err) {
                showCommonErrorDialog(err);
            }
        },
    });

    constructor(
        private threadsApiService: ThreadsApiService,
        private contactsApiService: ContactsApiService
    ) {}
}
