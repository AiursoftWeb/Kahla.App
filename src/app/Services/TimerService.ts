import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ConversationApiService } from './ConversationApiService';

@Injectable({
    providedIn: 'root'
})
export class TimerService {
    public destructTime = 'off';

    constructor(
        private conversationApiService: ConversationApiService) {}

    public setTimer(conversationId: number): void {
        Swal.fire({
            title: 'Set self-destruct timer',
            input: 'select',
            inputOptions: {
                5: '5 seconds',
                30: '30 seconds',
                60: '1 minute',
                600: '10 minutes',
                3600: '1 hour',
                [3600 * 24]: '1 day',
                [3600 * 24 * 7]: '1 week',
                [Math.pow(2, 31) - 1]: 'off'
            },
            inputPlaceholder: 'Select one',
            showCancelButton: true
        }).then(selected => {
            if (selected.value) {
                this.conversationApiService.UpdateMessageLifeTime(conversationId, selected.value)
                    .subscribe(result => {
                        if (result.code !== 0) {
                            Swal.fire({
                                title: 'Error!',
                                type: 'error',
                                text: result.message
                            });
                        }
                    });
            }
        });
    }

    public updateDestructTime(time: number): void {
        this.destructTime = this.getDestructTime(time);
    }

    private getDestructTime(time: number): string {
        time = Number(time);
        if (time === 5) {
            return '5s';
        } else if (time === 30) {
            return '30s';
        } else if (time === 60) {
            return '1m';
        } else if (time === 600) {
            return '10m';
        } else if (time === 3600) {
            return '1h';
        } else if (time === 3600 * 24) {
            return '1d';
        } else if (time === 3600 * 24 * 7) {
            return '1w';
        } else {
            return 'off';
        }
    }
}
