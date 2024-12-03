import { Component, model } from "@angular/core";
import { MessageTextAnnotated, MessageTextAnnotatedMention } from "../Models/Messages/MessageTextAnnotated";

@Component({
    selector: 'app-talking-text-input',
    templateUrl: '../Views/talking-text-input.html',
    styleUrls: ['../Styles/talking-text-input.scss'],
    standalone: false,
    host: {
        'contenteditable': 'plaintext-only',
        '(input)': 'backward()'
    }
})
export class TalkingTextInputComponent {
    textContent = model<(string | MessageTextAnnotated)[]>([]);

    asPureText(para: MessageTextAnnotated | string): string {
        return typeof para === 'string' ? para : para.content;
    }

    asMentionAnnotation(para: MessageTextAnnotated | string): MessageTextAnnotatedMention {
        return typeof para !== 'string' && para.annotated === 'mention'
            ? (para as MessageTextAnnotatedMention)
            : null;
    }

    backward() {
        throw new Error('not impl');
    }
}
