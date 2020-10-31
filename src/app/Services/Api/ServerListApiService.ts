import { Injectable } from '@angular/core';
import { ApiService } from './ApiService';
import { Observable } from 'rxjs';
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

    public Version(): Observable<VersionViewModel> {
        return this.apiService.GetByFullUrl(`${environment.serversProvider}/version`, false);
    }

    public getServerConfig(server: string) {
        return this.apiService.GetByFullUrl<ServerConfig>(server, false).toPromise();
    }
}
