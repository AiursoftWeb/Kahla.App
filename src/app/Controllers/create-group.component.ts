import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'sweetalert';

import { ApiService } from '../Services/ApiService';

@Component({
    templateUrl: '../Views/create-group.html',
    styleUrls: [
        '../Styles/add-friend.css',
        '../Styles/menu.css'
    ]
})
export class CreateGroupComponent {

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public createGroup(groupName: string) {
        this.apiService.CreateGroup(groupName).subscribe((response) => {
            switch (response.code) {
                case 0:
                    this.router.navigate(['/kahla/talking', response.value]);
                    break;
                case -10:
                    swal('Try again', `Group name length should between 5 and 25`, 'error');
                    break;
                case -8:
                    swal('Try again', `Unauthorized`, 'error');
                    break;
                case -7:
                    swal('Try again', `Group already exists`, 'error');
                    break;
                default:
                    break;
            }
        });
    }
}
