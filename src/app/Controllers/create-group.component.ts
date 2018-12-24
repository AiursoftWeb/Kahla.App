import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { HeaderService } from '../Services/HeaderService';

@Component({
    templateUrl: '../Views/create-group.html',
    styleUrls: [
        '../Styles/add-friend.css',
        '../Styles/menu.css',
        '../Styles/button.css'
    ]
})
export class CreateGroupComponent {
    public groupName: string;

    constructor(
        private groupsApiService: GroupsApiService,
        private router: Router,
        private headerService: HeaderService) {
            this.headerService.title = 'Create Group';
            this.headerService.returnButton = true;
            this.headerService.button = false;
            this.headerService.shadow = false;
    }

    public createGroup(privateGroup: boolean): void {
        if (this.groupName.includes(' ')) {
            Swal('Try again', 'Group name can\'t contain whitespaces.', 'error');
            return;
        }
        if (this.groupName.length < 3 || this.groupName.length > 25) {
            Swal('Try again', 'Group name length must between three and twenty five.', 'error');
            return;
        }
        if (privateGroup) {
            Swal({
                title: 'Enter your group password if you want to create a private group.',
                input: 'text',
                inputAttributes: {
                    maxlength: '100'
                },
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    this.createPrivateGroup(result.value);
                }
            });
        } else {
            Swal({
                title: 'Are you sure to create this group?',
                type: 'question',
                showCancelButton: true
            }).then((result) => {
                if (result.value) {
                    this.createPrivateGroup('');
                }
            });
        }
    }

    private createPrivateGroup(password: string): void {
        this.groupsApiService.CreateGroup(this.groupName, password).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/talking', response.value]);
            } else {
                Swal('Can\'t create group', response.message, 'error');
            }
        });
    }
}
