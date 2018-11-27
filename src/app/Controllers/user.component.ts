import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FriendsApiService } from '../Services/FriendsApiService';
import { KahlaUser } from '../Models/KahlaUser';
import { CacheService } from '../Services/CacheService';
import { Location } from '@angular/common';
import { switchMap,  } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Values } from '../values';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/user.html',
    styleUrls: ['../Styles/menu.css',
                '../Styles/button.css']
})

export class UserComponent implements OnInit {
    public info: KahlaUser;
    public conversationId: number;
    public areFriends: boolean;
    public loadingImgURL = Values.loadingImgURL;
    constructor(
        private route: ActivatedRoute,
        private friendsApiService: FriendsApiService,
        private router: Router,
        private cacheService: CacheService,
        private location: Location,
        private headerService: HeaderService
    ) {
        this.headerService.title = 'Profile';
        this.headerService.returnButton = true;
        this.headerService.button = false;
    }

    public ngOnInit(): void {
        this.route.params
            .pipe(switchMap((params: Params) => this.friendsApiService.UserDetail(params['id'])))
            .subscribe(response => {
                this.info = response.user;
                this.conversationId = response.conversationId;
                this.areFriends = response.areFriends;
                this.info.avatarURL = Values.fileAddress + this.info.headImgFileKey;
            });
    }

    public delete(id: string): void {
        Swal({
            title: 'Are you sure to delete a friend?',
            type: 'warning',
            showCancelButton: true
        }).then((willDelete) => {
            if (willDelete.value) {
                this.friendsApiService.DeleteFriend(id)
                    .subscribe(response => {
                        Swal('Success', response.message, 'success');
                        this.cacheService.autoUpdateConversation(null);
                        this.router.navigate(['/friends']);
                    });
            }
        });
    }

    public request(id: string): void {
        this.friendsApiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    Swal('Success', response.message, 'success');
                } else {
                    Swal('Error', response.message, 'error');
                }
                this.location.back();
            });
    }

    public talk(id: number): void {
        this.router.navigate(['/talking', id]);
    }
}
