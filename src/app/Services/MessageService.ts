import { Injectable } from '@angular/core';
import { EventType } from '../Models/EventType';
import { AiurEvent } from '../Models/AiurEvent';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    public eventType: EventType;

    public OnMessage(data: MessageEvent) {
        this.eventType = (JSON.parse(data.data) as AiurEvent).type;
    }
}
