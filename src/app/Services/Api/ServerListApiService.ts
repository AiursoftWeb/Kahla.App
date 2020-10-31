import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { ServerConfig } from '../../Models/ServerConfig';
import { environment } from '../../../environments/environment';
import { VersionViewModel } from '../../Models/VersionViewModel';

@Injectable({
    providedIn: 'root',
})
export class ServerListApiService {

    constructor(private apiService: ApiService) {
    }

    public Servers() {
        return this.apiService.GetByFullUrl<ServerConfig[]>(`${environment.serversProvider}/servers`, false).toPromise();
    }

    public Version() {
        return this.apiService.GetByFullUrl<VersionViewModel>(`${environment.serversProvider}/version`, false).toPromise();
    }

    public getServerConfig(server: string) {
        return this.apiService.GetByFullUrl<ServerConfig>(server, false).toPromise();
    }
}
