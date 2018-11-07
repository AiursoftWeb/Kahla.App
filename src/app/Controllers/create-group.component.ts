import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GroupsApiService } from '../Services/GroupsApiService';
import { AiurProtocal } from '../Models/AiurProtocal';
import { AiurCollection } from '../Models/AiurCollection';
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
    }

    public createGroup(): void {
        this.groupsApiService.CreateGroup(this.groupName.trim()).subscribe((response) => {
            if (response.code === 0) {
                this.router.navigate(['/kahla/talking', response.value]);
            } else if (response.code === -7) {
              Swal('Can not create group', response.message, 'error');
             } else if (response.code === -10) {
              Swal(response.message, (response as AiurProtocal as AiurCollection<string>).items[0], 'error');
            } else {
              Swal('Invalid group', response.message, 'error');
            }
        });
    }
}
