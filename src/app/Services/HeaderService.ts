import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class HeaderService {
    public title = 'Kahla';
    public returnButton = true;
    public button = false;
    public routerLink = '';
    public buttonIcon = '';
}
