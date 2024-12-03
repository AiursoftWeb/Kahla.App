import { Component, computed, ElementRef, input, viewChild } from '@angular/core';
import { MessageSegmentText } from '../../Models/Messages/MessageSegments';
import { checkSingleEmoji } from '../../Utils/StringUtils';
import {
    MessageTextAnnotated,
    MessageTextAnnotatedMention,
} from '../../Models/Messages/MessageTextAnnotated';

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-text.html',
    styleUrls: ['../../Styles/MessageSegments/mseg-text.scss'],
    standalone: false,
})
export class MessageSegmentTextComponent {
    content = input.required<MessageSegmentText>();

    textSegments = computed<(string | MessageTextAnnotated)[]>(() => {
        if (typeof this.content().content === 'string') {
            return [this.content().content as string];
        } else {
            return this.content().content as (string | MessageTextAnnotated)[];
        }
    });

    singleEmoji = computed(
        () =>
            this.textSegments().length === 1 &&
            checkSingleEmoji(this.asPureText(this.textSegments()[0]))
    );

    textContainer = viewChild<ElementRef<HTMLElement>>('textContainer');

    asPureText(para: MessageTextAnnotated | string): string {
        return typeof para === 'string' ? para : para.content;
    }

    asMentionAnnotation(para: MessageTextAnnotated | string): MessageTextAnnotatedMention {
        return typeof para !== 'string' && para.annotated === 'mention'
            ? (para as MessageTextAnnotatedMention)
            : null;
    }
}
