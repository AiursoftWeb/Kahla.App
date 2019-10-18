import { Component, OnInit } from '@angular/core';
import { FriendsApiService } from '../Services/FriendsApiService';
import { DiscoverUser } from '../Models/DiscoverUser';
import { Values } from '../values';
import Swal from 'sweetalert2';
import { MessageService } from '../Services/MessageService';

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
        private messageService: MessageService,
    ) {
        }

    public ngOnInit(): void {
        this.loadMore();
    }

    public loadMore(): void {
        this.loading = true;
        this.friendsApiService.Discover(this.amount).subscribe(users => {
            users.items.forEach(item => {
                item.targetUser.avatarURL = this.messageService.encodeProbeFileUrl(item.targetUser.iconFilePath);
            });
            const top = window.scrollY;
            this.users = users.items;
            if (this.users.length < this.amount) {
                this.noMoreUsers = true;
            }
            this.loading = false;
            setTimeout(() => window.scrollTo(0, top), 0);
            this.amount += 15;
        }, () => {
            this.loading = false;
        });
    }

    public request(event: any, id: string): void {
        event.preventDefault();
        event.stopPropagation();
        this.friendsApiService.CreateRequest(id)
            .subscribe(response => {
                if (response.code === 0) {
                    Swal.fire('Success', response.message, 'success');
                    for (let index = 0; index < this.users.length; index++) {
                        if (this.users[index].targetUser.id === id) {
                            this.users[index].sentRequest = true;
                            break;
                        }
                    }
                } else {
                    Swal.fire('Error', response.message, 'error');
                }
            });
    }
}
