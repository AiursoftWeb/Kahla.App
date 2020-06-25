import { AfterViewInit, Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/Api/GroupsApiService';
import { SearchResult } from '../Models/SearchResult';
import { KahlaUser } from '../Models/KahlaUser';
import { FriendsApiService } from '../Services/Api/FriendsApiService';
import { GroupsResult } from '../Models/GroupsResults';

@Component({
    selector: 'app-friends',
    templateUrl: '../Views/friends.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/reddot.scss',
        '../Styles/add-friend.scss',
        '../Styles/friends.scss',
        '../Styles/button.scss',
        '../Styles/badge.scss']

})
export class FriendsComponent implements OnInit, DoCheck, AfterViewInit {
    public loadingImgURL = Values.loadingImgURL;
    public showUsers = true;
    public results: SearchResult;
    public searchTxt = '';
    private detailLoading = false;

    constructor(
        private groupsApiService: GroupsApiService,
        private friendsApiService: FriendsApiService,
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService) {
    }

    public ngOnInit(): void {
        if (this.cacheService.cachedData.me && !this.cacheService.cachedData.friends) {
            this.cacheService.updateFriends();
            this.cacheService.updateRequests();
        }
    }

    ngAfterViewInit(): void {
        const inputElement = <HTMLElement>document.querySelector('#searchBar');
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            inputElement.focus();
        }
    }

    public createGroup(): void {
        if (!this.cacheService.cachedData.me.emailConfirmed) {
            Swal.fire('Your email is not verified!', 'You can\'t create group until your email is verified.', 'error');
            return;
        }

        Swal.fire({
            title: 'Enter your group name:',
            input: 'text',
            inputAttributes: {
                maxlength: '25',
            },
            inputValidator: (value) => {
                if (!value || value.length < 3 || value.length > 25) {
                    return 'Group name length must between three and twenty five.';
                }
            },
            html: '<input type="checkbox" id="checkPrivate"><label for="checkPrivate">Private group<label>',
            showCancelButton: true,
        }).then(input => {
            if (input.value) {
                if (!(<HTMLInputElement>document.querySelector('#checkPrivate')).checked) {
                    Swal.fire({
                        title: 'Are you sure to create this group?',
                        icon: 'question',
                        showCancelButton: true
                    }).then((result) => {
                        if (result.value) {
                            this.createPrivateGroup(input.value, '');
                        }
                    });
                } else {
                    Swal.fire({
                        title: 'Enter your group password:',
                        input: 'text',
                        inputAttributes: {
                            maxlength: '100'
                        },
                        inputValidator: (value) => {
                            if (!value) {
                                return 'Please input a password.';
                            }
                        },
                        showCancelButton: true
                    }).then((result) => {
                        if (result.value) {
                            this.createPrivateGroup(input.value, result.value);
                        }
                    });
                }
            }
        });
    }

    private createPrivateGroup(groupName: string, password: string): void {
        this.groupsApiService.CreateGroup(groupName, password).subscribe((response) => {
            if (response.code === 0) {
                this.cacheService.updateConversation();
                this.cacheService.updateFriends();
                this.messageService.resetVariables();
                this.router.navigate(['/talking', response.value]);
            } else {
                Swal.fire('Can\'t create group', response.message, 'error');
            }
        });
    }

    public showUsersResults(selectUsers: boolean): void {
        this.showUsers = selectUsers;
    }

    public search(term: string, keydown: boolean = false): void {
        if (this.cacheService.cachedData.friends) {
            this.results = Object.assign({}, this.cacheService.cachedData.friends);
            if (term) {
                this.results.users = this.results.users.filter(user => {
                    const regex = RegExp(term, 'i');
                    return regex.test(user.nickName) || (user.email && regex.test(user.email));
                });
                this.results.groups = this.results.groups.filter(group => {
                    const regex = RegExp(term, 'i');
                    return regex.test(group.name);
                });
            }
            if (keydown) {
                if (this.showUsers && this.results.users.length === 0 && this.results.groups.length !== 0) {
                    this.showUsers = false;
                } else if (!this.showUsers && this.results.groups.length === 0 && this.results.users.length !== 0) {
                    this.showUsers = true;
                }
            }
        }
    }

    ngDoCheck(): void {
        this.search(this.searchTxt);
    }

    public goSingleSearch(ctrl: boolean): void {
        if (this.showUsers) {
            if (this.results.users.length === 1) {
                this.userClick(this.results.users[0], ctrl);
            }
        } else {
            if (this.results.groups.length === 1) {
                this.groupClick(this.results.groups[0], ctrl);
            }
        }
    }

    public userClick(user: KahlaUser, ctrl: boolean) {
        if (ctrl) {
            this.router.navigate(['/user', user.id]);
        } else {
            if (this.detailLoading) {
                return;
            }
            this.detailLoading = true;
            this.friendsApiService.UserDetail(user.id).subscribe(p => {
                this.router.navigate(['/talking', p.conversationId]);
                this.detailLoading = false;
            });
        }
    }

    public groupClick(group: GroupsResult, ctrl: boolean) {
        if (ctrl) {
            this.router.navigate(['/group', group.id]);
        } else {
            this.router.navigate(['/talking', group.id]);
        }
    }
}
