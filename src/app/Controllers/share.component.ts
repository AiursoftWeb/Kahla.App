import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { KahlaUser } from '../Models/KahlaUser';
import { GroupsResult } from '../Models/GroupsResults';
import { ConversationApiService } from '../Services/ConversationApiService';
import { AES } from 'crypto-js';
import { FriendsApiService } from '../Services/FriendsApiService';
import { ShareService } from '../Services/ShareService';
import { SearchResult } from '../Models/SearchResult';

@Component({
    templateUrl: '../Views/share.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/add-friend.scss',
        '../Styles/friends.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss']

})
export class ShareComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;
    public showUsers = true;
    public message: string;
    public inApp = false;
    public results: SearchResult;

    constructor(
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService,
        private conversationApiService: ConversationApiService,
        private friendsApiService: FriendsApiService,
        private shareService: ShareService) {
    }

    public ngOnInit(): void {
        if (this.shareService.share) {
            this.shareService.share = false;
            this.message = this.shareService.content;
            this.inApp = true;
        } else {
            const parsedUrl = new URL(location.href);
            const text = parsedUrl.searchParams.get('text');
            const url = parsedUrl.searchParams.get('url');
            this.message = `${text ? text : ''} ${url ? url : ''}`;
        }
        this.search('');
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }

    public share(user: KahlaUser | GroupsResult, group: boolean): void {
        let conversationID = group ? (<GroupsResult>user).id : 0;
        if (!group) {
            this.friendsApiService.UserDetail((<KahlaUser>user).id)
                .subscribe(result => {
                    if (result.code === 0) {
                        conversationID = result.conversationId;
                    } else {
                        return;
                    }
                });
        }
        const name = group ? (<GroupsResult>user).name : (<KahlaUser>user).nickName;
        let dialog: Promise<SweetAlertResult>;
        const isResource = this.message.startsWith('[img]') || this.message.startsWith('[video]') || this.message.startsWith('[file]');
        if (isResource) {
            const msgType = this.message.startsWith('[img]') ? 'image' : (this.message.startsWith('[video]') ? 'video' : 'file');
            dialog = Swal.fire({
                title: `Share ${msgType}?`,
                text: `Are you sure to send this ${msgType} to ${name}?`,
                showCancelButton: true,
            });
        } else {
            dialog = Swal.fire({
                title: 'Share message to',
                text: `Are you sure to send this message to ${name}?`,
                input: 'textarea',
                inputValue: this.message,
                showCancelButton: true,
            });
        }
        dialog.then(input => {
            const msg = isResource ? this.message : input.value;
            if (!input.dismiss && msg) {
                if (this.messageService.conversation &&
                    this.messageService.conversation.id === conversationID) {
                    this.sendMessage(msg);
                } else {
                    this.conversationApiService.ConversationDetail(conversationID)
                        .subscribe(result => {
                            this.messageService.conversation = result.value;
                            this.sendMessage(msg);
                        });
                }
            }
        });
    }

    private sendMessage(content: string): void {
        const encryptedMessage = AES.encrypt(content, this.messageService.conversation.aesKey).toString();
        const messageIDArry = this.messageService.getAtIDs(content);
        this.conversationApiService.SendMessage(this.messageService.conversation.id,
            encryptedMessage, messageIDArry.slice(1))
            .subscribe(result => {
                if (result.code === 0) {
                    this.router.navigate(['/home'], {replaceUrl: true});
                    Swal.fire(
                        'Send success',
                        'Your message was sent successfully.',
                        'success');
                } else {
                    Swal.fire(
                        'Send failed',
                        'Something went wrong!',
                        'error');
                }
            });
    }

    public search(term: string, keydown: boolean = false): void {
        if (this.cacheService.cachedData.friends) {
            this.results = Object.assign({}, this.cacheService.cachedData.friends);
            if (term) {
                this.results.users = this.results.users.filter(user => {
                    const regex = RegExp(term, 'i');
                    return regex.test(user.nickName) || (user.email && regex.test(user.email));
                });
                this.results.groups = this.results.groups.filter(group => {
                    const regex = RegExp(term, 'i');
                    return regex.test(group.name);
                });
            }
            if (keydown) {
                if (this.showUsers && this.results.users.length === 0 && this.results.groups.length !== 0) {
                    this.showUsers = false;
                } else if (!this.showUsers && this.results.groups.length === 0 && this.results.users.length !== 0) {
                    this.showUsers = true;
                }
            }
        }
    }

    public goSingleSearch(): void {
        setTimeout(() => {
            if (this.showUsers) {
                if (this.results.users.length === 1) {
                    this.share(this.results.users[0], false);
                }
            } else {
                if (this.results.groups.length === 1) {
                    this.share(this.results.groups[0], true);
                }
            }
        }, 0);

    }
}
