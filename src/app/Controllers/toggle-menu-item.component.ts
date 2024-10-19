import { Component, Input, model } from '@angular/core';

@Component({
    selector: 'app-toggle-menu-item',
    templateUrl: '../Views/toggle-menu-item.html',
    styleUrls: ['../Styles/menu.scss', '../Styles/toggleButton.scss'],
})
export class ToggleMenuItemComponent {
    @Input() title = 'option';
    @Input() iconClasses = 'fas fa-cogs';
    value = model.required<boolean>();
}
