import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GroupsApiService } from '../Services/Api/GroupsApiService';
import { CacheService } from '../Services/CacheService';
import { filter, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { GroupConversation } from '../Models/GroupConversation';
import { ConversationApiService } from '../Services/Api/ConversationApiService';
import { MessageService } from '../Services/MessageService';
import { SwalToast } from '../Helpers/Toast';
import { MeRepo } from '../Repos/MeRepo';

@Component({
    templateUrl: '../Views/group.html',
    styleUrls: ['../Styles/menu.scss',
                '../Styles/button.scss',
                '../Styles/toggleButton.scss',
                '../Styles/reddot.scss',
                '../Styles/badge.scss']
})

export class GroupComponent implements OnInit {
    public conversation: GroupConversation;
    public groupMembers: number;
    public loadingImgURL = Values.loadingImgURL;
    public muted: boolean;
    public muting = false;

    constructor(
        private route: ActivatedRoute,
        private groupsApiService: GroupsApiService,
        private conversationApiService: ConversationApiService,
        private router: Router,
        private cacheService: CacheService,
        public messageService: MessageService,
        private meRepo: MeRepo
    ) {
    }

    public async ngOnInit(): Promise<void> {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.conversationApiService.ConversationDetail(+params['id'])),
                filter(t => t.code === 0),
                map(t => t.value)
            )
            .subscribe(async conversation => {
                const me = await this.meRepo.getMe();
                this.messageService.conversation = conversation;
                this.conversation = <GroupConversation>conversation;
                this.groupMembers = conversation.users.length;
                this.muted = this.conversation.users.find(t => t.userId === me.response.id).muted;
            });
    }

    public async leaveGroup(groupName: string): Promise<void> {
        const me = await this.meRepo.getMe();
        if (this.conversation.ownerId === me.response.id) {
            Swal.fire('Error', 'You can\'t leave the group without transferring the ownership ' +
                'or dissolving the entire group.', 'error');
            return;
        }
        Swal.fire({
            title: 'Are you sure to leave this group?',
            icon: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.groupsApiService.LeaveGroup(groupName)
                    .subscribe(response => {
                        if (response.code === 0) {
                            SwalToast.fire('Success', '', 'success');
                            this.cacheService.updateConversation();
                            this.cacheService.updateFriends();
                            this.router.navigate(['/home']);
                        } else {
                            Swal.fire('Error', response.message, 'error');
                        }
                    });
            }
        });
    }

    public mute(): void {
        if (!this.muting) {
            this.muting = true;
            this.groupsApiService.MuteGroup(this.conversation.displayName, !this.muted).subscribe(
                result => {
                    this.muting = false;
                    if (result.code === 0) {
                        this.muted = !this.muted;
                    } else {
                        Swal.fire('Error', result.message, 'error');
                    }
                }
            );
        }
    }

    public shareGroup(): void {
        this.router.navigate(['/share-target', {message: `[group]${this.conversation.id}`}]);
    }

}
