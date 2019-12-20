import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GroupsApiService } from '../Services/GroupsApiService';
import { CacheService } from '../Services/CacheService';
import { filter, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { GroupConversation } from '../Models/GroupConversation';
import { ConversationApiService } from '../Services/ConversationApiService';
import { MessageService } from '../Services/MessageService';
import { ProbeService } from '../Services/ProbeService';

@Component({
    templateUrl: '../Views/group.html',
    styleUrls: ['../Styles/menu.scss',
                '../Styles/button.scss',
                '../Styles/toggleButton.scss',
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
        private probeService: ProbeService,
    ) {
    }

    public ngOnInit(): void {
        this.route.params
            .pipe(
                switchMap((params: Params) => this.conversationApiService.ConversationDetail(+params['id'])),
                filter(t => t.code === 0),
                map(t => t.value)
            )
            .subscribe(conversation => {
                this.messageService.conversation = conversation;
                this.conversation = <GroupConversation>conversation;
                this.groupMembers = conversation.users.length;
                this.conversation.avatarURL = this.probeService.encodeProbeFileUrl((<GroupConversation>this.conversation).groupImagePath);
                this.conversation.users.forEach(user => {
                    user.user.avatarURL = this.probeService.encodeProbeFileUrl(user.user.iconFilePath);
                    try {
                        if (user.userId === this.cacheService.cachedData.me.id) {
                            this.muted = user.muted;
                        }
                    } catch (error) {
                        setTimeout(() => {
                            if (user.userId === this.cacheService.cachedData.me.id) {
                                this.muted = user.muted;
                            }
                        }, 1000);
                    }
                });
            });
    }

    public leaveGroup(groupName: string): void {
        let alertTitle: string;
        if (this.groupMembers === 1) {
            alertTitle = 'This group will be deleted, are you sure?';
        } else {
            alertTitle = 'Are you sure to leave this group?';
        }
        Swal.fire({
            title: alertTitle,
            icon: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.groupsApiService.LeaveGroup(groupName)
                    .subscribe(response => {
                        if (response.code === 0) {
                            Swal.fire('Success', response.message, 'success');
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
