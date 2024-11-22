import { Component, input, resource } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';

@Component({
    templateUrl: '../Views/thread-info.html',
    styleUrls: ['../Styles/thread-info.scss', '../Styles/menu.scss'],
    standalone: false,
})
export class ThreadInfoComponent {
    id = input.required<number>();

    thread = resource({
        request: () => this.id(),
        loader: async ({ request }) => {
            try {
                const resp = await lastValueFrom(this.threadsApiService.DetailsJoined(request));
                return resp.thread;
            } catch (err) {
                showCommonErrorDialog(err);
            }
        },
    });

    constructor(
        private threadsApiService: ThreadsApiService
    ) {
    }

    public async setMute(value: boolean) {
        try {
            await lastValueFrom(this.threadsApiService.SetMute(this.thread.value().id, value));
            this.thread.set({ ...this.thread.value(), muted: value });
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
