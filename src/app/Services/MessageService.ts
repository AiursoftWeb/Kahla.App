import { ApplicationRef, Injectable } from '@angular/core';
import { EventType } from '../Models/Events/EventType';
import { AiurEvent } from '../Models/Events/AiurEvent';
import Swal from 'sweetalert2';
import { NewMessageEvent } from '../Models/Events/NewMessageEvent';
import { Conversation } from '../Models/Conversation';
import { Message } from '../Models/Message';
import { ConversationApiService } from './Api/ConversationApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { AES, enc } from 'crypto-js';
import { CacheService } from './CacheService';
import * as he from 'he';
import Autolinker from 'autolinker';
import { Values } from '../values';
import { TimerUpdatedEvent } from '../Models/Events/TimerUpdatedEvent';
import { TimerService } from './TimerService';
import { FriendDeletedEvent } from '../Models/Events/FriendDeletedEvent';
import { Router } from '@angular/router';
import { UserGroupRelation } from '../Models/UserGroupRelation';
import { SomeoneLeftEvent } from '../Models/Events/SomeoneLeftEvent';
import { NewMemberEvent } from '../Models/Events/NewMemberEvent';
import { GroupConversation } from '../Models/GroupConversation';
import { DissolveEvent } from '../Models/Events/DissolveEvent';
import { HomeService } from './HomeService';
import { GroupsApiService } from './Api/GroupsApiService';
import { FriendsApiService } from './Api/FriendsApiService';
import { ProbeService } from './ProbeService';
import { ThemeService } from './ThemeService';
import { FilesApiService } from './Api/FilesApiService';
import { FileType } from '../Models/FileType';
import { MessageFileRef } from '../Models/MessageFileRef';
import { AccessToken } from '../Models/AccessToken';
import { SwalToast } from '../Helpers/Toast';

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    public conversation: Conversation;
    public localMessages: Message[] = [];
    public rawMessages: Message[] = [];
    public noMoreMessages = false;
    public belowWindowPercent = 0;
    public newMessages = false;
    public maxImageWidth = 0;
    public videoHeight = 0;
    private userColors = new Map<string, string>();
    public groupConversation = false;
    public messageLoading = false;
    public fileAccessToken: string;
    public accessTokenUpdateSchedule: any;
    public shareRef: MessageFileRef;
    public talkingDestroyed = false;
    public showMessagesCount = 15;

    constructor(
        private conversationApiService: ConversationApiService,
        private filesApiService: FilesApiService,
        private cacheService: CacheService,
        private timerService: TimerService,
        private router: Router,
        private homeService: HomeService,
        private groupsApiService: GroupsApiService,
        private friendsApiService: FriendsApiService,
        private probeService: ProbeService,
        private themeService: ThemeService,
        private applicationRef: ApplicationRef,
    ) {
    }

    public async OnMessage(ev: AiurEvent) {
        if (!this.conversation) {
            return;
        }
        switch (ev.type) {
            case EventType.NewMessage: {
                const evt = ev as NewMessageEvent;
                if (this.conversation.id === evt.message.conversationId
                    && this.rawMessages.findIndex(t => t.id === evt.message.id) === -1) {
                    if (evt.previousMessageId === this.rawMessages[this.rawMessages.length - 1].id ||
                        evt.previousMessageId === '00000000-0000-0000-0000-000000000000') {
                        if (evt.message.senderId === this.cacheService.cachedData.me.id) {
                            // the temp message should still exist
                            const index = this.localMessages.findIndex(t => t.id === evt.message.id && t.local);
                            if (index !== -1) {
                                this.localMessages.splice(index);
                            }
                        }
                        this.insertMessage(evt.message);
                        this.conversationApiService.GetMessage(this.conversation.id, null, 0);
                    } else { // lost some message.
                        await this.getMessages(0, this.conversation.id, null, 15);
                    }
                    if (this.belowWindowPercent <= 0.2) {
                        setTimeout(() => this.scrollBottom(true), 0);
                    }
                }
                break;
            }
            case EventType.FriendDeletedEvent: {
                if ((<FriendDeletedEvent>ev).conversationId === this.conversation.id) {
                    this.router.navigate(['/home']);
                }
                break;
            }
            case EventType.TimerUpdatedEvent: {
                const evt = ev as TimerUpdatedEvent;
                if (this.conversation.id === evt.conversationId) {
                    this.conversation.maxLiveSeconds = evt.newTimer;
                    this.timerService.updateDestructTime(evt.newTimer);
                    Swal.fire('Self-destruct timer updated!', 'Your current message life time is: ' +
                        this.timerService.destructTime, 'info');
                    this.cleanMessageByTimer();
                }
                break;
            }
            case EventType.NewMemberEvent: {
                const evt = ev as NewMemberEvent;
                if (this.conversation.id === evt.conversationId) {
                    const updated = await this.conversationApiService.ConversationDetail(evt.conversationId);
                    this.conversation = updated.value;
                    SwalToast.fire({
                        title: `${evt.newMember.nickName} joined the group.`,
                        icon: 'info',
                        position: 'bottom'
                    });
                }
                break;
            }
            case EventType.SomeoneLeftEvent: {
                const evt = ev as SomeoneLeftEvent;
                if (this.conversation.id === evt.conversationId) {
                    if (evt.leftUser.id === this.cacheService.cachedData.me.id) {
                        this.router.navigate(['/home']);
                    } else {
                        this.conversation.users.splice(this.conversation.users.findIndex(x => x.user.id === evt.leftUser.id));
                        SwalToast.fire({
                            title: `${evt.leftUser.nickName} left the group.`,
                            icon: 'info',
                            position: 'bottom'
                        });
                    }
                }
                break;
            }
            case EventType.DissolveEvent: {
                if (this.conversation.id === (<DissolveEvent>ev).conversationId) {
                    Swal.fire('The group has been dissolved!',
                        `Group ${this.conversation.displayName} has been dissolved by the owner!`,
                        'warning');
                    this.router.navigate(['/home']);
                }
                break;
            }
        }
    }

    public reconnectPull() {
        this.cacheService.updateConversation();
        this.cacheService.updateFriends();
        if (this.conversation) {
            this.getMessages(0, this.conversation.id, null, 15);
        }
    }

    public async getMessages(unread: number, id: number, skipFrom: string, take: number) {
        this.messageLoading = true;
        this.localMessages = this.localMessages.filter(t => !t.local);
        const messages = (await this.conversationApiService.GetMessage(id, skipFrom, take)).map(t => t.items);
        if (!this.conversation || this.conversation.id !== id) {
            return;
        }
        const modifiedMsg = messages.map(t => this.modifyMessage(Object.assign({}, t)));
        if (messages.length < take) {
            this.noMoreMessages = true;
        }
        if (this.localMessages.length > 0 && messages.length > 0) {
            this.newMessages = this.cacheService.cachedData.me &&
                messages[messages.length - 1].senderId !== this.cacheService.cachedData.me.id &&
                take === 1 && this.belowWindowPercent > 0;
        }
        // Load new
        if (!skipFrom) {
            if (this.localMessages.length > 0 && messages.length > 0) {
                const index = this.rawMessages.findIndex(t => t.id === messages[0].id);
                if (index === -1) {
                    this.localMessages = modifiedMsg;
                    this.rawMessages = messages;
                } else {
                    const deleteCount = this.rawMessages.length - index;
                    this.localMessages.splice(index, deleteCount, ...modifiedMsg);
                    this.rawMessages.splice(index, deleteCount, ...messages);
                }
            } else {
                this.localMessages = modifiedMsg;
                this.rawMessages = messages;
            }
        } else { // load more
            this.localMessages.unshift(...modifiedMsg);
            this.rawMessages.unshift(...messages);
        }
        if (unread >= 1) {
            if (unread > 1) {
                // add a last read bar
                this.localMessages[this.localMessages.length - unread].lastRead = true;
                this.localMessages[this.localMessages.length - unread].groupWithPrevious = false;
            }
            setTimeout(() => {
                const lis = document.querySelector('#messageList').querySelectorAll('li');
                window.scrollTo({
                    top: lis[lis.length - unread].offsetTop,
                    left: 0,
                    behavior: 'smooth'
                });
            }, 0);
        }
        this.updateAtLink();
        this.saveMessage();
        // clear red dot if necessary
        const listItem = this.cacheService.cachedData.conversations.find(t => t.conversationId === this.conversation.id);
        if (listItem) {
            listItem.unReadAmount = 0;
        }
        this.cacheService.updateTotalUnread();
        this.showFailedMessages();
        this.reorderLocalMessages();
        this.messageLoading = false;
    }

    public updateBelowWindowPercent(): void {
        this.belowWindowPercent = (document.documentElement.scrollHeight - window.scrollY
            - document.documentElement.clientHeight) / document.documentElement.clientHeight;
    }

    public updateMaxImageWidth(): void {
        this.maxImageWidth = Math.floor((this.homeService.contentWrapper.clientWidth - 40) * 0.7 - 20 - 2);
        this.videoHeight = Math.max(Math.floor(Math.min(this.maxImageWidth * 9 / 21, 400)), 170);
    }

    public resetVariables(): void {
        this.conversation = null;
        this.localMessages = [];
        this.rawMessages = [];
        this.noMoreMessages = false;
        this.belowWindowPercent = 0;
        this.newMessages = false;
        this.maxImageWidth = 0;
        this.userColors.clear();
        this.groupConversation = false;
        this.fileAccessToken = null;
        if (this.accessTokenUpdateSchedule) {
            clearInterval(this.accessTokenUpdateSchedule);
            this.accessTokenUpdateSchedule = null;
        }
    }

    public getRandomColor(darkColor: boolean): string {
        let r = Math.floor(Math.random() * 128);
        let g = Math.floor(Math.random() * 128);
        let b = Math.floor(Math.random() * 128);
        if (!darkColor) {
            r = Math.max(r + 127, 200);
            g = Math.max(g + 127, 200);
            b = Math.max(b + 127, 200);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }

    public getGroupColor(message: Message): string {
        if (!this.userColors.has(message.senderId)) {
            this.userColors.set(message.senderId, this.getRandomColor(!this.themeService.IsDarkTheme()));
        }
        return this.userColors.get(message.senderId);
    }

    public searchUser(nickName: string, getMessage: boolean): Array<KahlaUser> {
        if (typeof this.conversation.users !== 'undefined') {
            if (nickName.length === 0 && !getMessage) {
                return this.conversation.users.map(x => x.user);
            } else {
                const matchedUsers = [];
                this.conversation.users.forEach((value: UserGroupRelation) => {
                    if (!getMessage && value.user.nickName.toLowerCase().replace(/ /g, '').includes(nickName.toLowerCase())) {
                        matchedUsers.push(value.user);
                    } else if (getMessage && value.user.nickName.toLowerCase().replace(/ /g, '') === nickName.toLowerCase()) {
                        matchedUsers.push(value.user);
                    }
                });
                return matchedUsers;
            }
        }
        return [];
    }

    public getAtIDs(message: string): Array<string> {
        const atUsers = [];
        const newMessageArry = message.split(' ');
        message.split(' ').forEach((s, index) => {
            if (s.length > 0 && s[0] === '@') {
                const searchResults = this.searchUser(he.decode(s.slice(1)), true);
                if (searchResults.length > 0) {
                    atUsers.push(searchResults[0].id);
                    newMessageArry[index] = `<a class="chat-inline-link atLink"
                        href="/user/${searchResults[0].id}">${newMessageArry[index]}</a>`;
                }
            }
        });
        atUsers.unshift(newMessageArry.join(' '));
        return atUsers;
    }

    public checkEmoji(text: string): boolean {
        if (text.length > 2) {
            return false;
        }
        const regex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
        return regex.test(text);
    }

    public checkOwner(id?: string): boolean {
        if (this.conversation && this.cacheService.cachedData.me) {
            if (this.conversation.discriminator === 'GroupConversation') {
                return (<GroupConversation>this.conversation).ownerId === (id ? id : this.cacheService.cachedData.me.id);
            } else {
                return true;
            }
        }
        return false;
    }

    public async modifyMessage(message: Message, decrypt: boolean = true): Promise<Message> {
        if (decrypt) {
            try {
                message.content = AES.decrypt(message.content, this.conversation.aesKey).toString(enc.Utf8);
            } catch (error) {
                message.content = '';
            }
        }
        message.contentRaw = message.content;
        message.sendTimeDate = new Date(message.sendTime);
        message.timeStamp = message.sendTimeDate.getTime();
        const isFile = message.content.match(/^\[(video|img|file|audio)](.+)$/);
        if (isFile) {
            if (isFile[1] === 'img') {
                const imgSplit = isFile[2].split('|');
                if (imgSplit.length < 3) {
                    message.content = 'Invalid';
                    return message;
                }
                const imageWidth = Number(imgSplit[1]),
                    imageHeight = Number(imgSplit[2]);
                const ratio = imageHeight / imageWidth;
                const realMaxWidth = Math.max(Math.min(this.maxImageWidth, Math.floor(500 / ratio)),
                    Math.min(this.maxImageWidth, 100)); // for too long image, just cut half of it
                message.fileRef = {
                    imgWidth: imageWidth,
                    imgHeight: imageHeight,
                    imgDisplayWidth: imageWidth,
                    imgDisplayHeight: imageHeight,
                    fileType: FileType.Image,
                    filePath: imgSplit[0]
                } as MessageFileRef;
                if (realMaxWidth < imageWidth) {
                    message.fileRef.imgDisplayWidth = realMaxWidth;
                    message.fileRef.imgDisplayHeight = Math.floor(realMaxWidth * ratio);
                }
            } else if (isFile[1] === 'file') {
                const fileSplit = isFile[2].split('|');
                if (fileSplit.length < 3) {
                    message.content = 'Invalid';
                    return message;
                }
                message.fileRef = {
                    filePath: fileSplit[0],
                    fileName: fileSplit[1],
                    fileSize: fileSplit[2],
                    fileType: FileType.File
                } as MessageFileRef;
            } else {
                if (!isFile[2]) {
                    message.content = 'Invalid';
                    return message;
                }
                message.fileRef = {
                    filePath: isFile[2],
                    fileType: isFile[1] === 'video' ? FileType.Video : FileType.Audio
                } as MessageFileRef;
            }
        } else if (message.content.startsWith('[group]')) {
            const groupId = Number(message.content.substring(7));
            message.content = `[share]-|Loading...| |${Values.loadingImgURL}`;
            const p = await this.groupsApiService.GroupSummary(groupId);
            if (p.value) {
                message.content = `[share]${p.value.id}|${p.value.name.replace(/\|/g, '')}|` +
                    `${p.value.hasPassword ? 'Private' : 'Public'}|${this.probeService.encodeProbeFileUrl(p.value.imagePath)}`;
                message.relatedData = p.value;
            } else {
                message.content = 'Invalid Group';
            }

        } else if (message.content.startsWith('[user]')) {
            const userId = message.content.substring(6);
            message.content = `[share]-|Loading...| |${Values.loadingImgURL}`;
            const p = await this.friendsApiService.UserDetail(userId);
            if (p.user) {
                message.content = `[share]${p.user.id}|${p.user.nickName.replace(/\|/g, '')}|` +
                    `${p.user.bio ? p.user.bio.replace(/\|/g, ' ') : ' '}|${this.probeService.encodeProbeFileUrl(p.user.iconFilePath)}`;
                message.relatedData = p.user;
            } else {
                message.content = 'Invalid User';
            }
        } else {
            message.isEmoji = this.checkEmoji(message.content);
            message.content = he.encode(message.content);
            message.content = Autolinker.link(message.content, {
                stripPrefix: false,
                className: 'chat-inline-link'
            });
            message.content = this.getAtIDs(message.content)[0];
        }
        return message;
    }

    public reorderLocalMessages() {
        this.localMessages.sort((a, b) => a.timeStamp - b.timeStamp);
    }

    public updateAtLink() {
        setTimeout(() => {
            const links = document.getElementsByClassName('atLink');
            for (let i = 0; i < links.length; i++) {
                (<HTMLAnchorElement>links.item(i)).onclick = (ev: MouseEvent) => {
                    ev.preventDefault();
                    // noinspection JSIgnoredPromiseFromCall
                    this.router.navigateByUrl(links.item(i).getAttribute('href'));
                };
            }
        }, 0);
    }

    public saveMessage(): void {
        localStorage.setItem(`cache-log-${this.conversation.id}`, JSON.stringify(this.rawMessages));
    }

    public async initMessage(conversationId: number) {
        const json = localStorage.getItem(`cache-log-${conversationId}`);
        if (json) {
            this.rawMessages = JSON.parse(json);
        }
        this.localMessages = await Promise.all(this.rawMessages.map(t => this.modifyMessage(Object.assign({}, t))));
        this.showFailedMessages();
        this.reorderLocalMessages();
        this.updateAtLink();
        // init accessToken
        const localToken: AccessToken = this.cacheService.cachedData.probeTokens[conversationId];
        if (localToken) {
            localToken.expiresDate = new Date(localToken.expires);
            if (localToken.expiresDate.getTime() < Date.now() + 5000) {
                this.updateAccessToken();
            } else {
                this.fileAccessToken = localToken.raw;
                this.accessTokenUpdateSchedule =
                    setTimeout(() => this.updateAccessToken(), localToken.expiresDate.getTime() - Date.now() - 5000);
            }
        } else {
            this.updateAccessToken();
        }

        setTimeout(() => this.scrollBottom(false), 0);
    }

    public cleanMessageByTimer(): void {
        if (!this.conversation) {
            return;
        }
        const firstIndex = this.rawMessages.findIndex(t => {
            const timeStamp = new Date(t.sendTime).getTime();
            return timeStamp + this.conversation.maxLiveSeconds * 1000 >= Date.now();
        });
        if (firstIndex === 0) {
            return;
        } else if (firstIndex === -1) {
            this.rawMessages = [];
            this.localMessages = [];
        } else {
            if (this.localMessages.length === this.rawMessages.length) {
                this.localMessages = this.localMessages.splice(0, firstIndex);
            }
            this.rawMessages = this.rawMessages.splice(0, firstIndex);
        }
        this.saveMessage();
    }

    public showFailedMessages(): void {
        const unsentMessages = new Map(JSON.parse(localStorage.getItem('unsentMessages')));
        this.localMessages = this.localMessages.filter(m => !m.resend);
        if (unsentMessages.has(this.conversation.id)) {
            (<Array<Message>>(unsentMessages.get(this.conversation.id))).forEach((message) => {
                message.resend = true;
                message.sendTimeDate = new Date(message.sendTime);
                this.localMessages.push(message);
            }, this);
        }
    }

    public upperFloorImageSize(width: number) {
        return Math.pow(2, Math.ceil(Math.log2(width)));
    }

    public async updateAccessToken() {
        const id = this.conversation.id;
        const t = await this.filesApiService.InitFileAccess(id);
        if (this.conversation.id !== id) {
            return;
        }
        this.fileAccessToken = t.value;
        const token = this.probeService.resolveAccessToken(t.value);
        this.cacheService.cachedData.probeTokens[id] = token;
        this.cacheService.saveCache();
        // schedule the next update
        this.accessTokenUpdateSchedule =
            setTimeout(() => this.updateAccessToken(), token.expiresDate.getTime() - Date.now() - 5000);
        this.applicationRef.tick();
    }

    public async insertMessage(p: Message) {
        if (this.rawMessages.find(t => t.id === p.id)) {
            return;
        }
        this.rawMessages.push(p);
        this.localMessages.push(await this.modifyMessage(Object.assign({}, p)));
        this.reorderLocalMessages();
        this.updateAtLink();
        this.saveMessage();
        if (!p.local) {
            this.showMessagesCount++;
        }
    }

    public scrollBottom(smooth: boolean): void {
        if (!this.talkingDestroyed) {
            const h = document.documentElement.scrollHeight;
            if (smooth) {
                window.scroll({top: h, behavior: 'smooth'});
            } else {
                window.scroll(0, h);
            }
        }
    }
}
