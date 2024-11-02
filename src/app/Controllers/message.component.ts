import { Component, input } from '@angular/core';
import { Message } from '../Models/Message';

@Component({
    selector: 'app-message',
    templateUrl: '../Views/message.html',
})
export class MessageComponent {
    message = input.required<Message>();
    isByMe = input<boolean>(false);
    groupWithPrevious = input<boolean>(false);
    isSending = input<boolean>(false);
    isFailed = input<boolean>(false);
}
