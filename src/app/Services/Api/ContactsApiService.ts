import { Injectable } from "@angular/core";
import { Observable } from "rxjs/";
import { AiurProtocol } from "../../Models/AiurProtocal";
import { UserDetailViewModel } from "../../Models/ApiModels/UserDetailViewModel";
import { ApiService } from "./ApiService";
import { ContactsListApiResponse } from "../../Models/Contacts/ContactsListApiResponse";

@Injectable()
export class ContactsApiService {
    private static serverPath = "/contacts";

    constructor(private apiService: ApiService) {}

    public List(
        take: number = 20,
        skip: number = 0,
        searchInput?: string,
        excluding?: string
    ): Observable<ContactsListApiResponse> {
        return this.apiService.Get(ContactsApiService.serverPath + "/list", {
            take,
            skip,
            searchInput,
            excluding,
        });
    }

    public Add(id: string): Observable<AiurProtocol> {
        return this.apiService.Post(
            ContactsApiService.serverPath + `/add/${id}`,
            {}
        );
    }

    public Remove(id: string): Observable<AiurProtocol> {
        return this.apiService.Post(
            ContactsApiService.serverPath + `/remove/${id}`,
            {}
        );
    }

    public Details(
        id: string,
        take = 1,
        skip = 0
    ): Observable<UserDetailViewModel> {
        return this.apiService.Get(
            ContactsApiService.serverPath + `/details/${id}`,
            {
                take,
                skip,
            }
        );
    }

    public Report(
        targetUserId: string,
        reason: string
    ): Observable<AiurProtocol> {
        return this.apiService.Post(
            ContactsApiService.serverPath + `/report/`,
            {
                TargetUserId: targetUserId,
                Reason: reason,
            }
        );
    }
}
