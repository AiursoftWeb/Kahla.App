import { Component, OnDestroy, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/Api/FriendsApiService';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { Router } from '@angular/router';

@Component({
    templateUrl: '../Views/friendrequests.html',
    styleUrls: ['../Styles/friendrequests.scss',
                '../Styles/button.scss']
})
export class FriendRequestsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private friendsApiService: FriendsApiService,
        public cacheService: CacheService,
        public router: Router
    ) {
    }

    public ngOnInit(): void {
        if (!this.cacheService.cachedData.requests) {
            this.cacheService.updateRequests();
        }
    }

    public accept(id: number): void {
        this.friendsApiService.CompleteRequest(id, true)
            .subscribe(r => {
                Swal.fire('Success', r.message, 'success');
                this.cacheService.updateRequests();
                this.cacheService.updateFriends();
            });
    }

    public decline(id: number): void {
        this.friendsApiService.CompleteRequest(id, false)
            .subscribe(r => {
                Swal.fire('Success', r.message, 'success');
                this.cacheService.updateRequests();
            });
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }
}
