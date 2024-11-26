import { Component, EventEmitter, input, Input, model, Output } from '@angular/core';
import { ContactInfo } from '../Models/Contacts/ContactInfo';
import { RepositoryListBase } from '../Repositories/RepositoryBase';
import { Values } from '../values';

@Component({
    selector: 'app-contact-list',
    templateUrl: '../Views/contact-list.html',
    styleUrls: ['../Styles/contact-list.scss', '../Styles/reddot.scss', '../Styles/button.scss'],
    standalone: false,
})
export class ContactListComponent {
    public loadingImgURL = Values.loadingImgURL;

    @Input() public contacts?: RepositoryListBase<ContactInfo> = null;

    @Input() public contactsList?: ContactInfo[] = null;

    @Input() public emptyMessage = 'No results.';

    public multiSelect = input(false);
    public selectedIds = model<string[]>([]);

    @Output() public contactClicked = new EventEmitter<{
        item: ContactInfo;
        secondary: boolean;
    }>();

    public userClick(contact: ContactInfo, secondary: boolean) {
        this.contactClicked.emit({
            item: contact,
            secondary,
        });
        if (this.multiSelect()) {
            if (this.selectedIds().includes(contact.user.id)) {
                this.selectedIds.set(this.selectedIds().filter((id) => id !== contact.user.id));
            } else {
                this.selectedIds.set([...this.selectedIds(), contact.user.id]);
            }
        }
    }
}
