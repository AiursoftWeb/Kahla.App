import {
    Component,
    ElementRef,
    model,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { CacheService } from '../Services/CacheService';
import { MessageContent } from '../Models/Messages/MessageContent';
import type { EmojiButton } from '@joeattardi/emoji-button';
import { ThemeService } from '../Services/ThemeService';
import { VoiceRecorder } from '../Utils/VoiceRecord';
import { MessageSegmentText, MessageTextWithAnnotate } from '../Models/Messages/MessageSegments';
import Swal from 'sweetalert2';
import { imageFileTypes, selectFiles } from '../Utils/SystemDialog';
import { MessageTextInputDirective } from '../Directives/MessageTextInputDirective';

@Component({
    selector: 'app-talking-input',
    templateUrl: '../Views/talking-input.html',
    styleUrls: ['../Styles/talking-input.scss', '../Styles/button.scss'],
    standalone: false,
})
export class TalkingInputComponent {
    textContent = signal<MessageTextWithAnnotate[]>([]);
    showPanel = model(false);
    sendMessage = output<{
        content: MessageContent;
    }>();

    private picker: EmojiButton;
    private chatBox = viewChild<ElementRef<HTMLElement>>('chatBox');
    private chatInput = viewChild<MessageTextInputDirective>('chatInput');

    recorder = new VoiceRecorder(180);

    constructor(
        public cacheService: CacheService,
        private themeService: ThemeService
    ) {}

    public async emoji() {
        if (!this.picker) {
            const EmojiButton = (await import('@joeattardi/emoji-button')).EmojiButton;
            this.picker = new EmojiButton({
                position: 'top-start',
                zIndex: 20,
                theme: this.themeService.IsDarkTheme() ? 'dark' : 'light',
                autoFocusSearch: false,
                showSearch: false,
            });
            this.picker.on('emoji', emoji => {
                this.insertToSelection(emoji.emoji);
            });
        }
        this.picker.togglePicker(this.chatBox().nativeElement);
    }

    public insertToSelection(content: string) {
        this.chatInput().insertToCaret(content);
    }

    public async record() {
        await this.recorder.init();
        if (this.recorder.recording) {
            this.recorder.stopRecording();
        } else {
            this.recorder.startRecording();
        }
    }

    public togglePanel(): void {
        this.showPanel.set(!this.showPanel());
        setTimeout(() => {
            if (this.showPanel()) {
                window.scroll(0, window.scrollY + 105);
            } else {
                window.scroll(0, window.scrollY - 105);
            }
        }, 0);
    }

    public startInput(): void {
        if (this.showPanel()) {
            this.togglePanel();
        }
    }

    inputKeydown(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (
                (e.altKey || e.ctrlKey || e.shiftKey) ===
                this.cacheService.mine().privateSettings.enableEnterToSendMessage
            ) {
                this.insertToSelection('\n');
            } else {
                // send
                this.send();
            }
        }
    }

    public send() {
        if (this.textContent()) {
            this.sendMessage.emit({
                // TODO: consider use a factory to build this thing
                content: {
                    v: 1,
                    segments: [
                        {
                            type: 'text',
                            content: this.textContent(),
                            ats: [],
                        } satisfies MessageSegmentText,
                    ],
                },
            });
            this.textContent.set([]);
            this.chatInput().forward();
        }
    }

    fileDropped(items: [File, string][]) {
        Swal.fire({
            title: 'Dropped files',
            text: items.map(([, name]) => name).join('\n'),
        });
    }

    async selectFile(type: 'img' | 'video' | 'file') {
        let accept: string[] | '*/*' = '*/*';
        switch (type) {
            case 'img':
                accept = imageFileTypes;
                break;
            case 'video':
                accept = ['video/mp4', 'video/webm'];
                break;
        }

        const res = await selectFiles(true, accept);
        if (!res) return;
        console.log(res);
        Swal.fire({
            title: 'Selected files',
            text: res.map(t => t.name).join('\n'),
        });
    }

    // inputKeyup(e: KeyboardEvent) {
    //     if (e.key === 'Enter') {
    //         e.preventDefault();
    //         if (this.showUserList) {
    //             // accept default suggestion
    //             this.complete(this.matchedUsers[0].nickName);
    //         } else if (this.oldContent === this.content) {
    //             this.send();
    //             this.showUserList = false;
    //         }
    //     } else if (this.content && e.key !== 'Backspace') {
    //         this.showUserList = false;
    //         const input = document.getElementById('chatInput') as HTMLTextAreaElement;
    //         const typingWords = this.content.slice(0, input.selectionStart).split(/\s|\n/);
    //         const typingWord = typingWords[typingWords.length - 1];
    //         if (typingWord.charAt(0) === '@') {
    //             const searchName = typingWord.slice(1).toLowerCase();
    //             const searchResults = this.messageService.searchUser(searchName, false);
    //             if (searchResults.length > 0) {
    //                 this.matchedUsers = searchResults;
    //                 this.showUserList = true;
    //             }
    //         }
    //     } else {
    //         this.showUserList = false;
    //     }
    // }

    // public complete(nickname: string): void {
    //     const input = document.getElementById('chatInput') as HTMLTextAreaElement;
    //     const typingWords = this.content.slice(0, input.selectionStart).split(/\s|\n/);
    //     const typingWord = typingWords[typingWords.length - 1];
    //     const before = this.content.slice(
    //         0,
    //         input.selectionStart - typingWord.length + typingWord.indexOf('@')
    //     );
    //     this.content = `${before}@${nickname.replace(
    //         / /g,
    //         ''
    //     )} ${this.content.slice(input.selectionStart)}`;
    //     this.showUserList = false;
    //     const pointerPos = before.length + nickname.replace(/ /g, '').length + 2;
    //     setTimeout(() => {
    //         input.setSelectionRange(pointerPos, pointerPos);
    //         input.focus();
    //     }, 0);
    // }
}
