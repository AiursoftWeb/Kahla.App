import { Component, computed, input } from '@angular/core';
import { Message } from '../Models/Message';
import { MessageContent } from '../Models/Messages/MessageContent';
import { MessageSegmentBase, MessageSegmentFile, MessageSegmentImage, MessageSegmentText, MessageSegmentVideo, MessageSegmentVoice } from '../Models/Messages/MessageSegments';

@Component({
    selector: 'app-message',
    templateUrl: '../Views/message.html',
    styleUrls: ['../Styles/message.scss'],
    host: {
        '[class.grouped]': 'groupWithPrevious()',
        '[class.left]': '!isByMe()',
        '[class.right]': 'isByMe()',
    },
})
export class MessageComponent {
    message = input.required<Message>();
    isByMe = input<boolean>(false);
    groupWithPrevious = input<boolean>(false);
    isSending = input<boolean>(false);
    isFailed = input<boolean>(false);
    showNickNames = input<boolean>(false);

    parsedContent = computed<MessageContent>(() => {
        try {
            const json = JSON.parse(this.message().content) as MessageContent;
            if (json.v !== 1) {
                throw new Error('Unsupported version');
            }
            return json;
        } catch {
            // fallback to plaintext
            return {
                preview: this.message().content,
                segments: [
                    {
                        type: 'text',
                        content: this.message().content,
                        ats: [],
                    } satisfies MessageSegmentText,
                ],
                v: 1,
            };
        }
    });

    public asTextSeg(seg: MessageSegmentBase): MessageSegmentText {
        if (seg.type !== 'text') {
            throw new Error('Expected text segment');
        }
        return seg as MessageSegmentText;
    }

    public asImageSeg(seg: MessageSegmentBase): MessageSegmentImage {
        if (seg.type !== 'image') {
            throw new Error('Expected image segment');
        }
        return seg as MessageSegmentImage;
    }

    public asVideoSeg(seg: MessageSegmentBase): MessageSegmentVideo {
        if (seg.type !== 'video') {
            throw new Error('Expected video segment');
        }
        return seg as MessageSegmentVideo;
    }

    public asVoiceSeg(seg: MessageSegmentBase): MessageSegmentVoice {
        if (seg.type !== 'voice') {
            throw new Error('Expected voice segment');
        }
        return seg as MessageSegmentVoice;
    }

    public asFileSeg(seg: MessageSegmentBase): MessageSegmentFile {
        if (seg.type !== 'file') {
            throw new Error('Expected file segment');
        }
        return seg as MessageSegmentFile;
    }
    
}
