import { ApiService } from './ApiService';
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/';
import { UploadFile } from '../Models/UploadFile';
import { catchError, map } from 'rxjs/operators';
import { AiurValue } from '../Models/AiurValue';

@Injectable()
export class FilesApiService {
    private static serverPath = '/Storage';

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
    ) {}

    public InitIconUpload(): Observable<AiurValue<string>> {
        return this.apiService.Get(FilesApiService.serverPath + '/InitIconUpload');
    }

    public InitFileUpload(conversationId: number): Observable<AiurValue<string>> {
        return this.apiService.Get(`${FilesApiService.serverPath}/InitFileUpload?ConversationId=${conversationId}`);
    }

    public UploadFile(formData: FormData, uploadURL: string): Observable<number | UploadFile> {
        const req = new HttpRequest('POST', uploadURL, formData, {
            reportProgress: true
        });

        return this.http.request(req).pipe(
            map(event => this.getProgress(event)),
            catchError(this.apiService.handleError)
        );
    }

    private getProgress(event: HttpEvent<any>): number | UploadFile {
        switch (event.type) {
            case HttpEventType.UploadProgress:
                return Math.round(100 * event.loaded / event.total);
            case HttpEventType.Response:
                return event.body;
            default:
                return null;
        }
    }

    public UploadIcon(formData: FormData): Observable<number | UploadFile> {
        const req = new HttpRequest('POST', `${ApiService.serverAddress + FilesApiService.serverPath}/UploadIcon`, formData, {
            reportProgress: true,
            withCredentials: true
        });

        return this.http.request(req).pipe(
            map(event => this.getProgress(event)),
            catchError(this.apiService.handleError)
        );
    }
}
