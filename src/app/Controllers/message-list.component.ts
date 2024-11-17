import { Component, input } from "@angular/core";
import { Message } from "../Models/Message";
import { CacheService } from "../Services/CacheService";

@Component({
    selector: 'app-message-list',
    templateUrl: '../Views/message-list.html',
    styleUrls: ['../Styles/message-list.scss']
})
export class MessageListComponent {
    messages = input.required<Message[]>();

    constructor(public cacheService: CacheService) {}
}
