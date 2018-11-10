import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GroupsApiService } from '../Services/GroupsApiService';
import { AppComponent } from './app.component';
import { CacheService } from '../Services/CacheService';
import { switchMap, map } from 'rxjs/operators';
import { Conversation } from '../Models/Conversation';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { GroupConversation } from '../Models/GroupConversation';
import { ConversationApiService } from '../Services/ConversationApiService';

@Component({
    templateUrl: '../Views/group.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/friends.css',
                '../Styles/button.css']
})

export class GroupComponent implements OnInit {
    public conversation: Conversation;
    public groupMumbers: number;
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private route: ActivatedRoute,
        private groupsApiService: GroupsApiService,
        private conversationApiService: ConversationApiService,
        private router: Router,
        private cache: CacheService
    ) { }

    public ngOnInit(): void {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.conversationApiService.ConversationDetail(+params['id'])),
                map(t => t.value)
            )
            .subscribe(conversation => {
                this.conversation = conversation;
                this.groupMumbers = conversation.users.length;
                this.conversation.avatarURL = Values.fileAddress + (<GroupConversation>this.conversation).groupImageKey;
                this.conversation.users.forEach(user => {
                    user.user.avatarURL = Values.fileAddress + user.user.headImgFileKey;
                });
            });
    }

    public leaveGroup(groupName: string): void {
        Swal({
            title: 'Are you sure to leave this group?',
            type: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.groupsApiService.LeaveGroup(groupName)
                    .subscribe(response => {
                        if (response.code === 0) {
                            Swal('Success', response.message, 'success');
                            this.cache.AutoUpdateUnread(AppComponent.CurrentNav);
                            this.router.navigate(['/friends']);
                        } else {
                            Swal('Error', response.message, 'error');
                        }
                    });
            }
        });
    }

    public talk(id: number): void {
        this.router.navigate(['/talking', id]);
    }

    public user(id: string): void {
        this.router.navigate(['kahla/user', id]);
    }
}
