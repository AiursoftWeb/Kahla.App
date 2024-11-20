import { Component, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/Api/FriendsApiService';
import { DiscoverUser } from '../Models/DiscoverUser';
import { Values } from '../values';
import { ProbeService } from '../Services/ProbeService';

@Component({
    templateUrl: '../Views/discover.html',
    styleUrls: ['../Styles/search-part.scss', '../Styles/button.scss', '../Styles/discovers.scss'],
    standalone: false,
})
export class DiscoverComponent implements OnInit {
    private amount = 15;
    public users: DiscoverUser[];
    public loading = false;
    public noMoreUsers = false;
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private friendsApiService: FriendsApiService,
        private probeService: ProbeService
    ) {}

    public ngOnInit(): void {
        this.loadMore();
    }

    public loadMore(): void {
        this.loading = true;
        this.friendsApiService.Discover(this.amount).subscribe(
            users => {
                users.items.forEach(item => {
                    item.targetUser.avatarURL = this.probeService.encodeProbeFileUrl(
                        item.targetUser.iconFilePath
                    );
                });
                const top = window.scrollY;
                this.users = users.items;
                if (this.users.length < this.amount) {
                    this.noMoreUsers = true;
                }
                this.loading = false;
                setTimeout(() => window.scrollTo(0, top), 0);
                this.amount += 15;
            },
            () => {
                this.loading = false;
            }
        );
    }
}
