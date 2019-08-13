import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { SearchResult } from '../Models/SearchResult';

@Component({
    selector: 'app-friends',
    templateUrl: '../Views/friends.html',
    styleUrls: [
        '../Styles/menu.scss',
        '../Styles/reddot.scss',
        '../Styles/add-friend.scss',
        '../Styles/friends.scss',
        '../Styles/button.scss']

})
export class FriendsComponent implements OnInit, DoCheck {
    public loadingImgURL = Values.loadingImgURL;
    public showUsers = true;
    private results: SearchResult;
    public searchTxt = '';

    constructor(
        private groupsApiService: GroupsApiService,
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService) {
    }
    public ngOnInit(): void {
        if (this.messageService.me && !this.cacheService.cachedData.friends) {
            this.messageService.updateFriends();
        }
    }

    public createGroup(): void {
        if (!this.messageService.me.emailConfirmed) {
            Swal.fire('Your email is not verified!', 'You can\'t create group until your email is verified.', 'error');
            return;
        }

        Swal.fire({
            title: 'Enter your group name:',
            input: 'text',
            inputAttributes: {
                maxlength: '25'
            },
            html: '<input type="checkbox" id="checkPrivate"><label for="checkPrivate">Private group<label>',
            showCancelButton: true,
        }).then(input => {
            if (input.value) {
                if (input.value.length < 3 || input.value.length > 25) {
                    Swal.fire('Try again', 'Group name length must between three and twenty five.', 'error');
                    return;
                }
                if (!(<HTMLInputElement>document.querySelector('#checkPrivate')).checked) {
                    Swal.fire({
                        title: 'Are you sure to create this group?',
                        type: 'question',
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

    public search(term: string): void {
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
            if (this.showUsers && this.results.users.length === 0 && this.results.groups.length !== 0) {
                this.showUsers = false;
            } else if (!this.showUsers && this.results.groups.length === 0 && this.results.users.length !== 0) {
                this.showUsers = true;
            }
        }
    }

    ngDoCheck(): void {
        this.search(this.searchTxt);
    }
}
