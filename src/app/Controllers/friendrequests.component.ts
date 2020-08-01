import { Component, OnDestroy, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/Api/FriendsApiService';
import { CacheService } from '../Services/CacheService';
import { Values } from '../values';
import { Router } from '@angular/router';
import { SwalToast } from '../Helpers/Toast';
import Swal from 'sweetalert2';

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
                if (r.code === 0) {
                    SwalToast.fire('Success', '', 'success');
                    this.cacheService.updateRequests();
                    this.cacheService.updateFriends();
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
                } else {
                    Swal.fire('Error', r.message, 'error');
                }
            });
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }
}
