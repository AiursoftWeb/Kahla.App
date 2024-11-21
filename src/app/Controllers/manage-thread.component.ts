import { Component, input, signal } from "@angular/core";

@Component({
    selector: 'app-manage-thread',
    templateUrl: '../Views/manage-thread.html',
    styleUrls: ['../Styles/manage-thread.scss'],
    standalone: false
})
export class ManageThreadComponent {
    id = input.required<number>();


    constructor() {
        
    }
}
