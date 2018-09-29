import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ApiService } from '../Services/ApiService';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';

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
        private apiService: ApiService,
        private router: Router) {
    }

    public createGroup(): void {
        this.apiService.CreateGroup(this.groupName.trim()).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/kahla/talking', response.value]);
            } else if (response.code === -10) {
                Swal(response.message, (response as AiurProtocal as AiurCollection<string>).items[0], 'error');
            } else {
                Swal('Try again', response.message, 'error');
            }
        });
    }
}
