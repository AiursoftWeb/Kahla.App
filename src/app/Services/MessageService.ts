import { Injectable } from '@angular/core';
import { EventType } from '../Models/Events/EventType';
import { AiurEvent } from '../Models/Events/AiurEvent';
import Swal from 'sweetalert2';
import { Conversation } from '../Models/Conversation';
import { Message } from '../Models/Message';
import { ConversationApiService } from './Api/ConversationApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { CacheService } from './CacheService';
import { Router } from '@angular/router';
import { UserGroupRelation } from '../Models/UserGroupRelation';
import { SomeoneLeftEvent } from '../Models/Events/SomeoneLeftEvent';
import { NewMemberEvent } from '../Models/Events/NewMemberEvent';
import { GroupConversation } from '../Models/GroupConversation';
import { DissolveEvent } from '../Models/Events/DissolveEvent';
import { ThemeService } from './ThemeService';
import { MessageFileRef } from '../Models/MessageFileRef';
import { SwalToast } from '../Utils/Toast';
import { MyContactsRepository } from '../Repositories/MyContactsRepository';

@Injectable({
    providedIn: 'root',
})
export class MessageService {
    public conversation: Conversation;
    public belowWindowPercent = 0;
    public newMessages = false;
    public videoHeight = 0;
    private userColors = new Map<string, string>();
    public messageLoading = false;
    public shareRef: MessageFileRef;
    public talkingDestroyed = false;
    public showMessagesCount = 15;

    constructor(
        private conversationApiService: ConversationApiService,
        private myContactsRepository: MyContactsRepository,
        private cacheService: CacheService,
        private router: Router,
        private themeService: ThemeService,
    ) {}

    public async OnMessage(ev: AiurEvent) {
        if (!this.conversation) {
            return;
        }
        switch (ev.type) {
            case EventType.NewMessage: {
                break;
            }
            case EventType.NewMemberEvent: {
                const evt = ev as NewMemberEvent;
                if (this.conversation.id === evt.conversationId) {
                    this.conversationApiService
                        .ConversationDetail(evt.conversationId)
                        .subscribe(updated => {
                            this.conversation = updated.value;
                        });
                    SwalToast.fire({
                        title: `${evt.newMember.nickName} joined the group.`,
                        icon: 'info',
                        position: 'bottom',
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
                        this.conversation.users.splice(
                            this.conversation.users.findIndex(x => x.user.id === evt.leftUser.id)
                        );
                        SwalToast.fire({
                            title: `${evt.leftUser.nickName} left the group.`,
                            icon: 'info',
                            position: 'bottom',
                        });
                    }
                }
                break;
            }
            case EventType.DissolveEvent: {
                if (this.conversation.id === (ev as DissolveEvent).conversationId) {
                    Swal.fire(
                        'The group has been dissolved!',
                        `Group ${this.conversation.displayName} has been dissolved by the owner!`,
                        'warning'
                    );
                    this.router.navigate(['/home']);
                }
                break;
            }
        }
    }

    public reconnectPull() {
        this.cacheService.updateConversation();
        this.myContactsRepository.updateAll();
    }

    public updateBelowWindowPercent(): void {
        this.belowWindowPercent =
            (document.documentElement.scrollHeight -
                window.scrollY -
                document.documentElement.clientHeight) /
            document.documentElement.clientHeight;
    }

    public resetVariables(): void {
        this.conversation = null;
        this.belowWindowPercent = 0;
        this.newMessages = false;
        this.userColors.clear();
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
            this.userColors.set(
                message.senderId,
                this.getRandomColor(!this.themeService.IsDarkTheme())
            );
        }
        return this.userColors.get(message.senderId);
    }

    public searchUser(nickName: string, getMessage: boolean): KahlaUser[] {
        if (typeof this.conversation.users !== 'undefined') {
            if (nickName.length === 0 && !getMessage) {
                return this.conversation.users.map(x => x.user);
            } else {
                const matchedUsers = [];
                this.conversation.users.forEach((value: UserGroupRelation) => {
                    if (
                        !getMessage &&
                        value.user.nickName
                            .toLowerCase()
                            .replace(/ /g, '')
                            .includes(nickName.toLowerCase())
                    ) {
                        matchedUsers.push(value.user);
                    } else if (
                        getMessage &&
                        value.user.nickName.toLowerCase().replace(/ /g, '') ===
                            nickName.toLowerCase()
                    ) {
                        matchedUsers.push(value.user);
                    }
                });
                return matchedUsers;
            }
        }
        return [];
    }

    public getAtIDs(message: string): string[] {
        const atUsers = [];
        const newMessageArry = message.split(' ');
        message.split(' ').forEach((s, index) => {
            if (s.length > 0 && s[0] === '@') {
                const searchResults = this.searchUser(s.slice(1), true);
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

    public checkOwner(id?: string): boolean {
        if (this.conversation && this.cacheService.cachedData.me) {
            if (this.conversation.discriminator === 'GroupConversation') {
                return (
                    (this.conversation as GroupConversation).ownerId ===
                    (id ? id : this.cacheService.cachedData.me.id)
                );
            } else {
                return true;
            }
        }
        return false;
    }

    public updateAtLink() {
        setTimeout(() => {
            const links = document.getElementsByClassName('atLink');
            for (let i = 0; i < links.length; i++) {
                (links.item(i) as HTMLAnchorElement).onclick = (ev: MouseEvent) => {
                    ev.preventDefault();
                    // noinspection JSIgnoredPromiseFromCall
                    this.router.navigateByUrl(links.item(i).getAttribute('href'));
                };
            }
        }, 0);
    }

    public upperFloorImageSize(width: number) {
        return Math.pow(2, Math.ceil(Math.log2(width)));
    }

    public scrollBottom(smooth: boolean): void {
        if (!this.talkingDestroyed) {
            const h = document.documentElement.scrollHeight;
            if (smooth) {
                window.scroll({ top: h, behavior: 'smooth' });
            } else {
                window.scroll(0, h);
            }
        }
    }
}
