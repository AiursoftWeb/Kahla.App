import { ApiService } from './ApiService';
import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/';
import { UploadFile } from '../../Models/Probe/UploadFile';
import { catchError, map } from 'rxjs/operators';
import { AiurValue } from '../../Models/AiurValue';
import { FileTokenApiModel } from '../../Models/ApiModels/FileTokenApiModel';
import { ForwardMediaApiModel } from '../../Models/ApiModels/ForwardMediaApiModel';

@Injectable()
export class FilesApiService {
    private static serverPath = '/Storage';

    constructor(
        private apiService: ApiService,
        private http: HttpClient,
    ) {
    }

    public InitIconUpload() {
        return this.apiService.Get<AiurValue<string>>(FilesApiService.serverPath + '/InitIconUpload');
    }

    public InitFileAccess(conversationId: number, upload: boolean = false) {
        return this.apiService.Get<FileTokenApiModel>(`${FilesApiService.serverPath}/InitFileAccess` +
            `?ConversationId=${conversationId}&upload=${upload}&download=${!upload}`);
    }

    public ForwardMedia(sourceConversationId: number,
                        sourceFilePath: string,
                        targetConversationId: number) {
        return this.apiService.Post<ForwardMediaApiModel>(`${FilesApiService.serverPath}/ForwardMedia`, {
            SourceConversationId: sourceConversationId,
            SourceFilePath: sourceFilePath,
            TargetConversationId: targetConversationId
        });
    }

    public UploadFile(formData: FormData, uploadURL: string): Promise<number | UploadFile> {
        const req = new HttpRequest('POST', uploadURL, formData, {
            reportProgress: true
        });

        return this.http.request(req).pipe(
            map(event => this.getProgress(event)),
            catchError(this.apiService.handleError)
        ).toPromise();
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
}
