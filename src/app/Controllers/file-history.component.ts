import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileHistoryApiModel } from '../Models/ApiModels/FileHistoryApiModel';
import { switchMap } from 'rxjs/operators';
import { ConversationApiService } from '../Services/ConversationApiService';

@Component({
    selector: 'app-file-history',
    templateUrl: '../Views/file-history.html',
    styleUrls: ['../Styles/menu.scss']
})
export class FileHistoryComponent implements OnInit {

    public files: FileHistoryApiModel;

    constructor(
        private route: ActivatedRoute,
        private conversationApiService: ConversationApiService,
    ) {

    }

    ngOnInit(): void {
        this.route.params.pipe(switchMap(param => {
            return this.conversationApiService.FileHistory(param.id);
        })).subscribe(t => {
            if (t.code === 0) {
                this.files = t;
            }
        });
    }
}
