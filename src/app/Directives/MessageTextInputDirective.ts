import { Directive, ElementRef, model, OnInit } from '@angular/core';
import { MessageTextWithAnnotate } from '../Models/Messages/MessageSegments';
import { MessageTextAnnotatedMention } from '../Models/Messages/MessageTextAnnotated';
import { checkIfChildOf } from '../Utils/DomUtils';
import { KahlaUser } from '../Models/KahlaUser';
import { Subject } from 'rxjs';

@Directive({
    selector: '[appMessageTextInput]',
    host: {
        contenteditable: 'plaintext-only',
        '(input)': 'backward()',
        '(document:selectionchange)': 'selectionChanged()',
    },
    exportAs: 'appMessageTextInput',
})
export class MessageTextInputDirective implements OnInit {
    constructor(private elementRef: ElementRef<HTMLElement>) {}

    ngOnInit(): void {
        this.forwardInternal();
    }

    /**
     * The textContent will not be render to the DOM directly,
     * since it will interrupt user input and reset caret position.
     *
     * To make the changes take effect, call forward() method.
     */
    textContent = model<MessageTextWithAnnotate[]>([]);

    lastInputWordChanged = new Subject<{
        word?: string;
        caretEndPos: [number, number];
    }>();

    private caretInfo?: Range = undefined;

    public forward() {
        setTimeout(() => this.forwardInternal(), 0);
    }

    private forwardInternal() {
        // We cannot use angular component to render since angular relies on the assumption that the DOM is immutable outside angular.
        const container = this.elementRef.nativeElement;
        container.innerHTML = '';
        for (const item of this.textContent()) {
            if (typeof item !== 'string' && item.annotated === 'mention') {
                container.appendChild(
                    this.createMentionNode(
                        (item as MessageTextAnnotatedMention).targetId,
                        item.content
                    )
                );
            }
        }
    }

    backward() {
        let child = this.elementRef.nativeElement.firstChild;
        let results: MessageTextWithAnnotate[] = [];
        while (child) {
            this.backwardNodes(child, results);
            child = child.nextSibling;
        }
        results = results.filter(t => typeof t !== 'string' || t.trim());
        this.textContent.set(results);
        // Ensure a newline at the end, I don't know why but it's necessary to make inserting line break works correctly.
        if (
            this.elementRef.nativeElement.lastChild?.nodeType !== Node.TEXT_NODE ||
            this.elementRef.nativeElement.lastChild?.nodeValue !== '\n'
        ) {
            this.elementRef.nativeElement.appendChild(document.createTextNode('\n'));
        }
    }

    private backwardNodes(node: ChildNode, results: MessageTextWithAnnotate[]) {
        function appendText(text: string, results: MessageTextWithAnnotate[]) {
            if (!text) return;
            if (results.length && typeof results[results.length - 1] === 'string') {
                (results[results.length - 1] as string) += text;
            } else {
                results.push(text);
            }
        }

        if (node.nodeType === Node.TEXT_NODE) {
            appendText(node.nodeValue!, results);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            if (element.hasAttribute('data-mention')) {
                const mentionId = element.getAttribute('data-mention-id');
                results.push({
                    annotated: 'mention',
                    targetId: mentionId!,
                    content: element.innerText,
                } satisfies MessageTextAnnotatedMention);
            } else if (element.tagName === 'BR') {
                appendText('\n', results);
            } else {
                let child = element.firstChild;
                while (child) {
                    this.backwardNodes(child, results);
                    child = child.nextSibling;
                }

                if (element.computedStyleMap().get('display')?.toString() === 'block') {
                    appendText('\n', results);
                }
            }
        }
    }

    private getCurrentCaret(): Range | null {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return null;

        const range = selection.getRangeAt(0);
        // check if selection is in the current element
        if (
            range.startContainer &&
            checkIfChildOf(range.startContainer, this.elementRef.nativeElement)
        ) {
            return range;
        }

        return null;
    }

    insertTextToCaret(text: string) {
        this.insertNodeToCaret(document.createTextNode(text));
    }

    insertMentionToCaret({ id, nickName }: KahlaUser) {
        this.insertNodeToCaret(this.createMentionNode(id, `@${nickName}`));
    }

    insertNodeToCaret(node: Node) {
        const caret = this.getCurrentCaret() ?? this.caretInfo;
        if (!caret) {
            // just append to the end
            this.elementRef.nativeElement.appendChild(node);
            return;
        }

        caret.deleteContents();
        caret.insertNode(node);
        caret.collapse(false);

        this.backward();

        return caret;
    }

    private createMentionNode(id: string, content: string) {
        const mentionSpan = document.createElement('span');
        mentionSpan.contentEditable = 'false';
        mentionSpan.className = 'mention-tag';
        mentionSpan.setAttribute('data-mention', '');
        mentionSpan.setAttribute('data-mention-id', id);
        mentionSpan.textContent = content;
        return mentionSpan;
    }

    selectionChanged() {
        const caret = this.getCurrentCaret();
        // logger.debug('caret changed', caret);
        if (!caret) return;
        this.caretInfo = caret.cloneRange();

        // Check the nearest inputting word
        if (caret.endContainer.nodeType !== Node.TEXT_NODE) return;
        const lastWord = caret.endContainer.textContent
            ?.slice(0, caret.endOffset)
            .split(' ')
            .at(-1);
        const rect = caret.getBoundingClientRect();
        this.lastInputWordChanged.next({
            word: lastWord,
            caretEndPos: [rect.x, rect.y],
        });
    }
}
