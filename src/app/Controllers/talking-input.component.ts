import {
    Component,
    effect,
    ElementRef,
    input,
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
import { KahlaUser } from '../Models/KahlaUser';
import { Logger } from '../Services/Logger';
import {
    debounceTime,
    distinctUntilChanged,
    filter,
    lastValueFrom,
    map,
} from 'rxjs';
import { ThreadsApiService } from '../Services/Api/ThreadsApiService';
import { ThreadMemberInfo } from '../Models/Threads/ThreadMemberInfo';
import { ThreadInfoJoined } from '../Models/Threads/ThreadInfo';

@Component({
    selector: 'app-talking-input',
    templateUrl: '../Views/talking-input.html',
    styleUrls: ['../Styles/talking-input.scss', '../Styles/button.scss', '../Styles/popups.scss'],
    standalone: false,
})
export class TalkingInputComponent {
    textContent = signal<MessageTextWithAnnotate[]>([]);
    showPanel = model(false);
    sendMessage = output<{
        content: MessageContent;
    }>();

    private picker: EmojiButton;
    private chatBox = viewChild.required<ElementRef<HTMLElement>>('chatBox');
    private chatInput = viewChild.required<MessageTextInputDirective>('chatInput');

    atRecommends = signal<ThreadMemberInfo[] | null>(null);
    atRecommendsShowPos = signal<[number, number] | null>(null);
    readonly threadInfo = input<ThreadInfoJoined>();

    recorder = new VoiceRecorder(180);

    constructor(
        public cacheService: CacheService,
        private themeService: ThemeService,
        private threadApiService: ThreadsApiService,
        private logger: Logger
    ) {
        effect(cleanup => {
            if (this.threadInfo()?.allowMembersEnlistAllMembers || this.threadInfo()?.imAdmin) {
                const sub = this.chatInput()
                    .lastInputWordChanged.pipe(
                        filter(t => t?.word?.startsWith('@') ?? false),
                        map(t => t.word!),
                        distinctUntilChanged(),
                        debounceTime(500)
                    )
                    .subscribe(async t => {
                        const searchName = t.slice(1).toLowerCase();
                        logger.debug('Update member info by word: ', searchName);
                        this.atRecommends.set(
                            (
                                await lastValueFrom(
                                    this.threadApiService.Members(
                                        this.threadInfo()!.id,
                                        10,
                                        0,
                                        searchName || undefined
                                    )
                                )
                            ).members
                        );
                    });

                sub.add(
                    this.chatInput()
                        .lastInputWordChanged.pipe(distinctUntilChanged())
                        .subscribe(t => {
                            this.atRecommendsShowPos.set(
                                t.word?.startsWith('@') ? t.caretEndPos : null
                            );
                        })
                );
                cleanup(() => sub.unsubscribe());
            }
        });
    }

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
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.insertToSelection(emoji.emoji as string);
            });
        }
        this.picker.togglePicker(this.chatBox().nativeElement);
    }

    public insertToSelection(content: string) {
        this.chatInput().insertTextToCaret(content);
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
                this.cacheService.mine()?.privateSettings?.enableEnterToSendMessage
            ) {
                this.insertToSelection('\n');
            } else {
                // send
                this.send();
            }
        }
    }

    public send() {
        if (this.textContent()?.length) {
            this.logger.debug('Constructing text message...', this.textContent());
            this.sendMessage.emit({
                // TODO: consider use a factory to build this thing
                content: {
                    v: 1,
                    segments: [
                        {
                            type: 'text',
                            content: this.textContent(),
                        } satisfies MessageSegmentText,
                    ],
                },
            });
            this.textContent.set([]);
            this.chatInput().forward();
        }
    }

    fileDropped(items: [File, string][]) {
        void Swal.fire({
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
        void Swal.fire({
            title: 'Selected files',
            text: res.map(t => t.name).join('\n'),
        });
    }

    public mention(targetUser: KahlaUser) {
        this.chatInput().insertMentionToCaret(targetUser);

        // Focus the input after selecting a user
        this.chatInput().elementRef.nativeElement.focus();
    }

    public completeMentionMenu(targetUser: KahlaUser) {
        // remove the typing partial mention text
        this.chatInput().removeTextFromCursorTill('@');
        this.atRecommendsShowPos.set(null);
        this.mention(targetUser);
    }
}
