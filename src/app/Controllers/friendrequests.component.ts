import { Component, OnInit, OnDestroy } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { Location } from '@angular/common';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/friendrequests.html',
    styleUrls: ['../Styles/friendrequests.css',
                '../Styles/button.css']
})
export class FriendRequestsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private friendsApiService: FriendsApiService,
        private location: Location,
        public cacheService: CacheService
    ) { }

    public ngOnInit(): void {
    }

    public accept(id: number): void {
        this.friendsApiService.CompleteRequest(id, true)
            .subscribe(r => {
                Swal('Success', r.message, 'success');
                this.ngOnInit();
            });
    }

    public decline(id: number): void {
        this.friendsApiService.CompleteRequest(id, false)
            .subscribe(r => {
                Swal('Success', r.message, 'success');
                this.ngOnInit();
            });
    }

    public goBack(): void {
        this.location.back();
    }

    public ngOnDestroy(): void {
        this.loadingImgURL = null;
    }
}
