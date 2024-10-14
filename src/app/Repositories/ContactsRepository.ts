import { lastValueFrom } from "rxjs";
import { ContactInfo } from "../Models/Contacts/ContactInfo";
import { ContactsApiService } from "../Services/Api/ContactsApiService";
import { RepositoryBase } from "./RepositoryBase";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root",
})
export class ContactsRepository extends RepositoryBase<ContactInfo> {
    constructor(private contactsApiService: ContactsApiService) {
        super();
    }

    protected get name(): string {
        return "contacts";
    }
    protected get version(): number {
        return 1;
    }

    protected async requestOnline(
        take: number,
        skip: number
    ): Promise<[ContactInfo[], number]> {
        const resp = await lastValueFrom(
            this.contactsApiService.List(take, skip)
        );
        return [resp.knownContacts, resp.totalKnownContacts];
    }
}
