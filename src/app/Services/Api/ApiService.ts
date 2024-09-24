import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { ParamService } from '../ParamService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ServerConfig } from '../../Models/ServerConfig';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    public readonly STORAGE_SERVER_CONFIG = 'serverConfig';

    private _headers: HttpHeaders =
        new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

    constructor(
        private http: HttpClient,
        private paramTool: ParamService) {
    }

    public Get<T>(address: string): Observable<T> {
        return this.GetByFullUrl<T>(`${environment.serversProvider}${address}`);
    }

    public GetByFullUrl<T>(address: string, withCredentials = true): Observable<T> {
        return this.http.get<T>(address, {
            headers: this._headers,
            withCredentials: withCredentials
        }).pipe(catchError(this.handleError));
    }

    public Post<T>(address: string, data: any): Observable<T> {
        return this.http.post<T>(`${environment.serversProvider}${address}`, this.paramTool.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public Put<T>(address: string, data: any): Observable<T> {
        return this.http.put<T>(`${environment.serversProvider}${address}`, this.paramTool.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }

    public ServerInfo() {
        return this.Get<ServerConfig>('/');
    }
}
