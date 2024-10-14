import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { ParamService } from '../ParamService';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ServerConfig } from '../../Models/ServerConfig';
import { environment } from '../../../environments/environment';

type paramDict = Record<string, | string
        | number
        | boolean
        | readonly (string | number | boolean)[]
        | undefined
        | null>;

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    public readonly STORAGE_SERVER_CONFIG = 'serverConfig';

    private _headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
    });

    constructor(
        private http: HttpClient,
        private paramTool: ParamService
    ) {}

    public Get<T>(address: string, params?: paramDict): Observable<T> {
        return this.GetByFullUrl<T>(`${environment.serversProvider}${address}`, true, params);
    }

    public GetByFullUrl<T>(
        address: string,
        withCredentials = true,
        params?: paramDict
    ): Observable<T> {
        return this.http
            .get<T>(address, {
                headers: this._headers,
                withCredentials: withCredentials,
                params: this.processGetParams(params),
            })
            .pipe(catchError(this.handleError));
    }

    public processGetParams(params: paramDict): paramDict {
        // remove all undefined or null values
        const result = { ...params };
        for (const key in result) {
            if (result[key] === undefined || result[key] === null) {
                delete result[key];
            }
        }

        return result;
    }

    public Post<T>(address: string, data: any): Observable<T> {
        return this.http
            .post<T>(`${environment.serversProvider}${address}`, this.paramTool.param(data), {
                headers: this._headers,
                withCredentials: true,
            })
            .pipe(catchError(this.handleError));
    }

    public Put<T>(address: string, data: any): Observable<T> {
        return this.http
            .put<T>(`${environment.serversProvider}${address}`, this.paramTool.param(data), {
                headers: this._headers,
                withCredentials: true,
            })
            .pipe(catchError(this.handleError));
    }

    public Patch<T>(address: string, data: any): Observable<T> {
        return this.http
            .patch<T>(`${environment.serversProvider}${address}`, this.paramTool.param(data), {
                headers: this._headers,
                withCredentials: true,
            })
            .pipe(catchError(this.handleError));
    }

    public handleError(error: any): Promise<any> {
        return Promise.reject(error);
    }

    public ServerInfo() {
        return this.Get<ServerConfig>('/');
    }
}
