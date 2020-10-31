import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class BrowserContextService {

    constructor(private electronService: ElectronService) {

    }

    public readyForWebPush(): boolean {
        return !this.electronService.isElectronApp &&
            'Notification' in window &&
            'serviceWorker' in navigator &&
            Notification.permission === 'granted';
    }
}
