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
            if (response.code === 0) {
                this.router.navigate(['/kahla/talking', response.value]);
            } else {
                swal('Try again', response.message, 'error');
            }
        });
    }
}
