import { Injectable } from '@angular/core';
import { EventService } from './EventService';
import { KahlaEvent } from '../Models/Events/KahlaEvent';
import { KahlaEventType } from '../Models/Events/EventType';
import { NewMessageEvent } from '../Models/Events/NewMessageEvent';

@Injectable({ providedIn: 'root' })
export class GlobalNotifyService {
    constructor(private eventService: EventService) {}

    private OnMessage(ev: KahlaEvent) {
        switch (ev.type) {
            case KahlaEventType.NewMessage: {
                break;
            }
            default:
                break;
        }
    }

    public init() {
        this.eventService.onMessage.subscribe(t => this.OnMessage(t));
    }

    private showNotification(event: NewMessageEvent): void {
        console.log(event);
        // if (!event.muted &&
        //     event.message.sender.id !== this.cacheService.cachedData.me.id &&
        //     this._electronService.isElectronApp &&
        //     localStorage.getItem('setting-electronNotify') !== 'false') {
        //     event.message.content = AES.decrypt(event.message.content, event.aesKey).toString(enc.Utf8);
        //     event.message.content = this.cacheService.modifyMessage(event.message.content);
        //     const notify = new Notification(event.message.sender.nickName, {
        //         body: event.message.content,
        //         icon: this.probeService.encodeProbeFileUrl(event.message.sender.iconFilePath)
        //     });
        //     notify.onclick = function (clickEvent) {
        //         clickEvent.preventDefault();
        //         window.focus();
        //     };
        // }
        // TODO: electron
    }
}
