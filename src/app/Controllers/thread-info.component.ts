import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lastValueFrom, map } from 'rxjs';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { showCommonErrorDialog } from '../Utils/CommonErrorDialog';
import { ThreadInfo } from '../Models/ThreadInfo';

@Component({
    templateUrl: '../Views/thread-info.html',
    styleUrls: ['../Styles/thread-info.scss', '../Styles/menu.scss'],
    standalone: false,
})
export class ThreadInfoComponent {
    thread?: ThreadInfo = null;

    constructor(
        route: ActivatedRoute,
        private threadsApiService: ThreadsApiService
    ) {
        route.params.pipe(map(t => t['id'] as string)).subscribe(async id => {
            try {
                const resp = await lastValueFrom(this.threadsApiService.DetailsJoined(id));
                this.thread = resp.thread;
            } catch (err) {
                showCommonErrorDialog(err);
            }
        });
    }

    public async setMute(value: boolean) {
        try {
            await lastValueFrom(this.threadsApiService.SetMute(this.thread.id, value));
            this.thread.muted = value;
        } catch (err) {
            showCommonErrorDialog(err);
        }
    }
}
