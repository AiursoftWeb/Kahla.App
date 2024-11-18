import { Component, input } from "@angular/core";
import { Message } from "../Models/Message";
import { CacheService } from "../Services/CacheService";
import { ParsedMessage } from "../Models/Messages/ParsedMessage";

@Component({
    selector: 'app-message-list',
    templateUrl: '../Views/message-list.html',
    styleUrls: ['../Styles/message-list.scss']
})
export class MessageListComponent {
    messages = input.required<ParsedMessage[]>();

    constructor(public cacheService: CacheService) {}
}
