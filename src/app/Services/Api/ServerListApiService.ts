import { Injectable } from '@angular/core';
import { ServerConfig } from '../../Models/ServerConfig';
import { environment } from '../../../environments/environment';
import { VersionViewModel } from '../../Models/ApiModels/VersionViewModel';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class ServerListApiService {
    constructor(
        private http: HttpClient) {
    }

    private get<T>(address: string, withAuth = false): Promise<T> {
        return this.http.get<T>(address, {
            withCredentials: withAuth
        }).pipe(catchError(this.handleError)).toPromise();
    }

    public Servers() {
        return this.get<ServerConfig[]>(`${environment.serversProvider}/servers`);
    }

    public Version() {
        return this.get<VersionViewModel>(`${environment.serversProvider}/version`);
    }

    public getServerConfig(server: string) {
        return this.get<ServerConfig>(server, true);
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }
}
