import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { Observable } from 'rxjs';
import { ServerConfig } from '../Models/ServerConfig';
import { environment } from '../../environments/environment';
import { VersionViewModel } from '../Models/VersionViewModel';

@Injectable({
    providedIn: 'root',
})
export class ServerListApiService {

    constructor(private apiService: ApiService) {
    }

    public Servers(): Observable<Array<ServerConfig>> {
        return this.apiService.GetByFullUrl(`${environment.officialServerList}/servers`, false);
    }

    public Version(): Observable<VersionViewModel> {
        return this.apiService.GetByFullUrl(`${environment.officialServerList}/version`, false);
    }
}
