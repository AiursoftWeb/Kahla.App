import { Component, computed, input } from '@angular/core';
import { MessageSegmentText } from '../../Models/Messages/MessageSegments';
import Autolinker from 'autolinker';

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-text.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentTextComponent {
    context = input.required<MessageSegmentText>();
    contextEncoded = computed(() => {
        return Autolinker.link(this.context().content, {
            sanitizeHtml: true,
            stripPrefix: false,
            className: 'chat-inline-link',
        });
        // TODO: ADD SUPPORT FOR ATS
    });
}
