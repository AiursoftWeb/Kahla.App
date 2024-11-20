import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContactInfo } from '../Models/Contacts/ContactInfo';
import { RepositoryBase } from '../Repositories/RepositoryBase';
import { Values } from '../values';

@Component({
    selector: 'app-contact-list',
    templateUrl: '../Views/contact-list.html',
    styleUrls: ['../Styles/contact-list.scss', '../Styles/reddot.scss', '../Styles/button.scss'],
    standalone: false
})
export class ContactListComponent {
    public loadingImgURL = Values.loadingImgURL;

    @Input() public contacts?: RepositoryBase<ContactInfo> = null;

    @Input() public contactsList?: ContactInfo[] = null;

    @Input() public emptyMessage = 'No results.';

    @Output() public contactClicked = new EventEmitter<{
        item: ContactInfo;
        secondary: boolean;
    }>();

    public userClick(contact: ContactInfo, secondary: boolean) {
        this.contactClicked.emit({
            item: contact,
            secondary,
        });
    }
}
