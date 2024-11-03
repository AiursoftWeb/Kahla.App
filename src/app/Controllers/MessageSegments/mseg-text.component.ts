import { Component, computed, input } from '@angular/core';
import { MessageSegmentText } from '../../Models/Messages/MessageSegments';
import Autolinker, { MentionMatch } from 'autolinker';

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-text.html',
    styleUrls: ['../../Styles/MessageSegments/mseg-text.scss'],
})
export class MessageSegmentTextComponent {
    content = input.required<MessageSegmentText>();

    contentEncoded = computed(() => {
        return Autolinker.link(this.content().content, {
            sanitizeHtml: true,
            stripPrefix: false,
            mention: 'twitter', // This is just for catching in replace fn, we don't actually support twitter mentions
            className: 'chat-inline-link',
            replaceFn: match => {
                if (match.getType() === 'mention') {
                    const usr = this.content().ats.find(t => t.pos === match.getOffset());
                    if (!usr) return false;
                    return `<a class="chat-inline-link atLink" href="/user/${encodeURIComponent(usr.userId)}">${(match as MentionMatch).getMention()}</a>`;
                }
                return true;
            },
        });
    });
}
