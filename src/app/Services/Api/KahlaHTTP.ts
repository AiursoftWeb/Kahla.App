import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Toolbox } from '../Toolbox';
import { ServerManager } from '../../Repos/ServerManager';

@Injectable({
    providedIn: 'root'
})
export class KahlaHTTP {
    private _headers: HttpHeaders =
        new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

    constructor(
        private http: HttpClient,
        private serverRepo: ServerManager) {
    }

    private getOurServerAddress(): string {
        const ourServer = this.serverRepo.getOurServerSync();
        return ourServer.domain.server;
    }

    public Get<T>(address: string, withCredentials = true): Observable<T> {
        return this.http.get<T>(`${this.getOurServerAddress()}${address}`, {
            headers: this._headers,
            withCredentials: withCredentials
        }).pipe(catchError(this.handleError));
    }

    public Post<T>(address: string, data: any): Observable<T> {
        return this.http.post<T>(`${this.getOurServerAddress()}${address}`, Toolbox.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }
}
