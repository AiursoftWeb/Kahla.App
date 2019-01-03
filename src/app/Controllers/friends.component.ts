import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ContactInfo } from '../Models/ContactInfo';
import { Values } from '../values';
import { MessageService } from '../Services/MessageService';
import { CacheService } from '../Services/CacheService';
import { HeaderService } from '../Services/HeaderService';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';

@Component({
    templateUrl: '../Views/friends.html',
    styleUrls: [
        '../Styles/friends.css',
        '../Styles/menu.css',
        '../Styles/reddot.css']

})
export class FriendsComponent implements OnInit, OnDestroy {
    public loadingImgURL = Values.loadingImgURL;

    constructor(
        private groupsApiService: GroupsApiService,
        private router: Router,
        private messageService: MessageService,
        public cacheService: CacheService,
        private headerService: HeaderService) {
            this.headerService.title = 'Friends';
            this.headerService.returnButton = false;
            this.headerService.button = true;
            this.headerService.routerLink = '/discover';
            this.headerService.buttonIcon = 'plus';
            this.headerService.shadow = false;
    }
    public ngOnInit(): void {
        this.messageService.updateFriends(null);
    }

    public detail(info: ContactInfo): void {
        if (info.userId == null) {
            this.router.navigate(['/group', info.conversationId]);
        } else {
            this.router.navigate(['/user', info.userId]);
        }
    }

    public createGroup(): void {
        Swal({
            title: 'Enter your group name:',
            input: 'text',
            inputAttributes: {
                maxlength: '25'
            },
            html: '<input type="checkbox" id="checkPrivate"><label for="checkPrivate">Private group<label>',
            showCancelButton: true,
        }).then(input => {
            if (input.value) {
                if (input.value.includes(' ')) {
                    Swal('Try again', 'Group name can\'t contain whitespaces.', 'error');
                    return;
                }
                if (input.value.length < 3 || input.value.length > 25) {
                    Swal('Try again', 'Group name length must between three and twenty five.', 'error');
                    return;
                }
                if (!(<HTMLInputElement>document.querySelector('#checkPrivate')).checked) {
                    Swal({
                        title: 'Are you sure to create this group?',
                        type: 'question',
                        showCancelButton: true
                    }).then((result) => {
                        if (result.value) {
                            this.createPrivateGroup(input.value, '');
                        }
                    });
                } else {
                    Swal({
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
                this.router.navigate(['/talking', response.value]);
            } else {
                Swal('Can\'t create group', response.message, 'error');
            }
        });
    }

    public ngOnDestroy(): void {
    }
}
