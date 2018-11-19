import { ApiService } from './ApiService';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpClient, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/';
import { UploadFile } from '../Models/UploadFile';
import { map, catchError } from 'rxjs/operators';
import { FilePath } from '../Models/FilePath';

@Injectable()
export class FilesApiService {
    private static serverPath = '/files';

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
    ) {}

    public UploadMedia(formData: FormData): Observable<number | UploadFile> {
        const req = new HttpRequest('POST', `${ApiService.serverAddress + FilesApiService.serverPath}/UploadMedia`, formData, {
            reportProgress: true,
            withCredentials: true
        });

        return this.http.request(req).pipe(
            map(event => this.getProgress(event)),
            catchError(this.apiService.handleError)
        );
    }

    public UploadFile(formData: FormData, conversationID: number): Observable<number | UploadFile> {
        const req = new HttpRequest('POST', `${ApiService.serverAddress +
            FilesApiService.serverPath}/UploadFile?ConversationId=${conversationID}`, formData, {
                reportProgress: true,
                withCredentials: true
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

    public GetFileURL(fileKey: number): Observable<FilePath> {
        return this.apiService.Post(FilesApiService.serverPath + '/FileDownloadAddress', {FileKey: fileKey});
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
