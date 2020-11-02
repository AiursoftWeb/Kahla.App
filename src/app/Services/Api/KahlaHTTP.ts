import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Toolbox } from '../Toolbox';
import { ServerRepo } from '../../Repos/ServerRepo';

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
        private tools: Toolbox,
        private serverRepo: ServerRepo) {
    }

    private getOurServerAddress(): string {
        const ourServer = this.serverRepo.getOurServerSync();
        return ourServer.domain.server;
    }

    public Get<T>(address: string, withCredentials = true): Observable<T> {
        return this.http.get<T>(`${this.getOurServerAddress()}${address}address`, {
            headers: this._headers,
            withCredentials: withCredentials
        }).pipe(catchError(this.handleError));
    }

    public Post<T>(address: string, data: any): Observable<T> {
        return this.http.post<T>(`${this.getOurServerAddress()}${address}`, this.tools.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }
}
