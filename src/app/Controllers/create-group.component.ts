import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'sweetalert';

import { ApiService } from '../Services/ApiService';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';

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
            } else if (response.code === -10) {
                swal(response.message, (response as AiurProtocal as AiurCollection<string>).items[0], 'error');
            } else {
                swal('Try again', response.message, 'error');
            }
        });
    }
}
