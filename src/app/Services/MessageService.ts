import { Injectable } from '@angular/core';
import { MessageContent } from '../Models/Messages/MessageContent';
import { truncateUTF8Bytes } from '../Utils/StringUtils';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    public upperFloorImageSize(width: number) {
        return Math.pow(2, Math.ceil(Math.log2(width)));
    }

    public buildPreview(content: MessageContent) {
        const previewCandidates = content.segments
            .map(t => {
                switch (t.type) {
                    case 'text':
                        return t.content;
                    default:
                        return `[${t.type}]`;
                }
            })
            .join(' ');

        return truncateUTF8Bytes(previewCandidates, 47, true);
    }
}
