import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class BrowserContextService {

    constructor(private electronService: ElectronService) {

    }

    public permittedForWebPush(): boolean {
        return Notification.permission === 'granted' && this.supportWebPush();
    }

    public supportWebPush(): boolean {
        return !this.electronService.isElectronApp && this.supportNotification();
    }

    public supportNotification(): boolean {
        return 'Notification' in window && 'serviceWorker' in navigator;
    }
}
