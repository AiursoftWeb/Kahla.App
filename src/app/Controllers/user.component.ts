import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FriendsApiService } from '../Services/Api/FriendsApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { TimerService } from '../Services/TimerService';
import { Request } from '../Models/Request';
import { ProbeService } from '../Services/ProbeService';
import { Subscription } from 'rxjs';
import { EventService } from '../Services/EventService';
import { filter } from 'rxjs/operators';
import { EventType } from '../Models/Events/EventType';
import { FriendsChangedEvent } from '../Models/Events/FriendsChangedEvent';
import { FriendDeletedEvent } from '../Models/Events/FriendDeletedEvent';
import { SwalToast } from '../Helpers/Toast';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/button.scss',
        '../Styles/reddot.scss',
        '../Styles/badge.scss']
})

export class UserComponent implements OnInit, OnDestroy {
    public info: KahlaUser;
    public conversationId: number;
    public areFriends: boolean;
    public loadingImgURL = Values.loadingImgURL;
    public sentRequest: boolean;
    public pendingRequest: Request;
    public updateSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private friendsApiService: FriendsApiService,
        private router: Router,
        public cacheService: CacheService,
        public timerService: TimerService,
        private probeService: ProbeService,
        private eventService: EventService
    ) {
    }

    public ngOnInit(): void {
        this.route.params.subscribe(t => {
            this.updateFriendInfo(t.id);
        });
        this.updateSubscription = this.eventService.onMessage
            .pipe(filter(t => this.info &&
                ((t.type === EventType.FriendsChangedEvent && (<FriendsChangedEvent>t).request.targetId === this.info.id) ||
                    (t.type === EventType.FriendDeletedEvent && (<FriendDeletedEvent>t).trigger.id === this.info.id))))
            .subscribe(() => this.updateFriendInfo(this.info.id));
    }

    public updateFriendInfo(userId: string) {
        this.friendsApiService.UserDetail(userId).subscribe(response => {
            this.info = response.user;
            this.areFriends = response.areFriends;
            this.conversationId = response.conversationId;
            this.sentRequest = response.sentRequest;
            this.pendingRequest = response.pendingRequest;
            this.info.avatarURL = this.probeService.encodeProbeFileUrl(this.info.iconFilePath);
        });
    }

    public delete(id: string): void {
        Swal.fire({
            title: 'Are you sure to delete a friend?',
            icon: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.friendsApiService.DeleteFriend(id)
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

    public request(id: string): void {
        this.friendsApiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    SwalToast.fire('Success', '', 'success');
                    this.sentRequest = true;
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            });
    }

    public report(): void {
        Swal.fire({
            title: 'Report',
            input: 'textarea',
            inputPlaceholder: 'Type your reason here...',
            inputAttributes: {
                maxlength: '200'
            },
            confirmButtonColor: 'red',
            showCancelButton: true,
            confirmButtonText: 'Report',
            inputValidator: inputValue => {
                if (!inputValue || inputValue.length < 5) {
                    return 'The reason\'s length should between five and two hundreds.';
                }
            }
        }).then((result) => {
            if (!result.dismiss) {
                this.friendsApiService.Report(this.info.id, result.value).subscribe(response => {
                    if (response.code === 0) {
                        Swal.fire('Success', response.message, 'success');
                    } else {
                        Swal.fire('Error', response.message, 'error');
                    }
                }, () => {
                    Swal.fire('Error', 'Report error.', 'error');
                });
            }
        });
    }

    public accept(id: number): void {
        this.friendsApiService.CompleteRequest(id, true)
            .subscribe(r => {
                if (r.code === 0) {
                    SwalToast.fire('Success', '', 'success');
                    this.updateFriendInfo(this.info.id);
                    this.cacheService.updateRequests();
                    this.cacheService.updateFriends();
                    this.areFriends = true;
                    this.pendingRequest = null;
                    this.sentRequest = false;
                } else {
                    Swal.fire('Error', r.message, 'error');
                }

            });
    }

    public decline(id: number): void {
        this.friendsApiService.CompleteRequest(id, false)
            .subscribe(r => {
                if (r.code === 0) {
                    SwalToast.fire('Success', '', 'success');
                    this.cacheService.updateRequests();
                    this.sentRequest = false;
                    this.pendingRequest = null;
                } else {
                    Swal.fire('Error', r.message, 'error');
                }

            });
    }

    public shareUser() {
        this.router.navigate(['/share-target', {message: `[user]${this.info.id}`}]);
    }

    ngOnDestroy(): void {
        this.updateSubscription?.unsubscribe();
    }
}
