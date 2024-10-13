import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { AiurProtocol } from '../../Models/AiurProtocal';
import { UserDetailViewModel } from '../../Models/ApiModels/UserDetailViewModel';
import { ApiService } from './ApiService';
import { SearchResult } from '../../Models/SearchResult';
import { AiurValueNamed } from '../../Models/AiurValue';
import { ContactInfo } from '../../Models/Contacts/ContactInfo';

@Injectable()
export class ContactsApiService {
    private static serverPath = '/contacts';

    constructor(
        private apiService: ApiService
    ) {
    }

    public Mine(): Observable<AiurValueNamed<ContactInfo[], 'knownContacts'>> {
        return this.apiService.Get(ContactsApiService.serverPath + '/mine');
    }

    public Add(id: string): Observable<AiurProtocol> {
        return this.apiService.Post(ContactsApiService.serverPath + `/add/${id}`, {});
    }

    public Remove(id: string): Observable<AiurProtocol> {
        return this.apiService.Post(ContactsApiService.serverPath + `/remove/${id}`, {});
    }

    public Details(id: string, takeThreads = 1): Observable<UserDetailViewModel> {
        return this.apiService.Get(ContactsApiService.serverPath + `/details/${id}?takeThreads=${takeThreads}`);
    }

    public Report(targetUserId: string, reason: string): Observable<AiurProtocol> {
        return this.apiService.Post(ContactsApiService.serverPath + `/report/`, {
            TargetUserId: targetUserId,
            Reason: reason
        });
    }

}
