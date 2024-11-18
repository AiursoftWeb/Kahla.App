import { Component, computed, effect, input } from '@angular/core';
import { Message } from '../Models/Message';
import { MessageContent } from '../Models/Messages/MessageContent';
import {
    MessageSegmentBase,
    MessageSegmentFile,
    MessageSegmentImage,
    MessageSegmentText,
    MessageSegmentVideo,
    MessageSegmentVoice,
} from '../Models/Messages/MessageSegments';
import { ParsedMessage } from '../Models/Messages/ParsedMessage';
import { UserInfoCacheDictionary } from '../CachedDictionary/UserInfoCacheDictionary';
import { KahlaUser } from '../Models/KahlaUser';

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
    message = input.required<ParsedMessage>();
    isByMe = input<boolean>(false);
    groupWithPrevious = input<boolean>(false);
    isSending = input<boolean>(false);
    isFailed = input<boolean>(false);
    showNickNames = input<boolean>(false);

    userInfo?: KahlaUser;

    constructor(userInfoCacheDictionary: UserInfoCacheDictionary) {
        effect(async () => {
            console.log("Get user info");
            this.userInfo = await userInfoCacheDictionary.get(this.message().senderId);
        })
    }

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
