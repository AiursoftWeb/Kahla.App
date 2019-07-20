import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { KahlaUser } from '../Models/KahlaUser';
import { GroupsResult } from '../Models/GroupsResults';
import { ConversationApiService } from '../Services/ConversationApiService';
import { AES } from 'crypto-js';
import { FriendsApiService } from '../Services/FriendsApiService';

@Component({
    templateUrl: '../Views/share.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/add-friend.scss',
        '../Styles/friends.scss']

})
export class ShareComponent implements OnInit {
    public loadingImgURL = Values.loadingImgURL;
    public showUsers = true;

    constructor(
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService,
        private conversationApiService: ConversationApiService,
        private friendsApiService: FriendsApiService) {
    }
    public ngOnInit(): void {

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
        const parsedUrl = new URL(location.href);
        const text = parsedUrl.searchParams.get('text');
        const url = parsedUrl.searchParams.get('url');
        const message = `${text ? text : ''} ${url ? url : ''}`;
        Swal.fire({
            title: 'Share message to',
            text: `Are you sure to send this message to ${name}?`,
            input: 'textarea',
            inputValue: message,
            showCancelButton: true,
        }).then(input => {
            if (input.value) {
                if (this.messageService.conversation &&
                    this.messageService.conversation.id === conversationID) {
                    this.sendMessage(input.value);
                } else {
                    this.conversationApiService.ConversationDetail(conversationID)
                        .subscribe(result => {
                            this.messageService.conversation = result.value;
                            this.sendMessage(input.value);
                        });
                }
            }
        });
    }

    private sendMessage(content: string): void {
        const encryptedMessage = AES.encrypt(content, this.messageService.
            conversation.aesKey).toString();
        const messageIDArry = this.messageService.getAtIDs(content);
        content = messageIDArry[0];
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
}
