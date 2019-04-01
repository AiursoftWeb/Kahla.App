import { Component, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { HeaderService } from '../Services/HeaderService';
import { DiscoverUser } from '../Models/DiscoverUser';
import { Values } from '../values';

@Component({
    templateUrl: '../Views/discover.html',
    styleUrls: ['../Styles/add-friend.scss',
                '../Styles/button.scss']
})
export class DiscoverComponent implements OnInit {
    private amount = 15;
    public users: DiscoverUser[];
    public loading = false;
    public noMoreUsers = false;
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private friendsApiService: FriendsApiService,
        private headerService: HeaderService) {
            this.headerService.title = 'Discover Friend';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
            this.headerService.timer = false;
        }

    public ngOnInit(): void {
        this.loadMore();
    }

    public loadMore(): void {
        this.loading = true;
        this.friendsApiService.Discover(this.amount).subscribe(users => {
            users.items.forEach(item => {
                item.targetUser.avatarURL = Values.fileAddress + item.targetUser.headImgFileKey;
            });
            this.users = users.items;
            if (this.users.length < this.amount) {
                this.noMoreUsers = true;
            }
            this.loading = false;
            this.amount += 15;
        }, () => {
            this.loading = false;
        });
    }
}
