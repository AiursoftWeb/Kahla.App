import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'sweetalert';

import { ApiService } from '../Services/ApiService';

@Component({
    templateUrl: '../Views/join-group.html',
    styleUrls: [
        '../Styles/add-friend.css',
        '../Styles/menu.css'
    ]
})
export class JoinGroupComponent {

    constructor(
        private apiService: ApiService,
        private router: Router) {
    }

    public joinGroup(groupName: string) {
        this.apiService.JoinGroup(groupName).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/']);
            } else {
                swal('Try again', response.message, 'error');
            }
        });
    }
}
