import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { ParamService } from './ParamService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiService {
    public static serverAddress;

    private _headers: HttpHeaders =
        new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

    constructor(
        private http: HttpClient,
        private paramTool: ParamService) {
    }

    public Get<T>(address: string): Observable<T> {
        return this.http.get<T>(`${ApiService.serverAddress}${address}`, {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public Post<T>(address: string, data: any): Observable<T> {
        return this.http.post<T>(`${ApiService.serverAddress}${address}`, this.paramTool.param(data), {
            headers: this._headers,
            withCredentials: true
        }).pipe(catchError(this.handleError));
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }
}
