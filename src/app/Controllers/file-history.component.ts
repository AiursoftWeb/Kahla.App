import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileHistoryApiModel } from '../Models/ApiModels/FileHistoryApiModel';
import { switchMap } from 'rxjs/operators';
import { ConversationApiService } from '../Services/ConversationApiService';
import { ProbeFile } from '../Models/Probe/ProbeFile';
import { ProbeFolder } from '../Models/Probe/ProbeFolder';
import { ProbeService } from '../Services/ProbeService';

@Component({
    selector: 'app-file-history',
    templateUrl: '../Views/file-history.html',
    styleUrls: ['../Styles/menu.scss',
        '../Styles/file-list.scss']
})
export class FileHistoryComponent implements OnInit {

    public files: FileHistoryApiModel;

    constructor(
        private route: ActivatedRoute,
        private conversationApiService: ConversationApiService,
        public probeService: ProbeService,
    ) {

    }

    ngOnInit(): void {
        this.route.params.pipe(switchMap(param => {
            return this.conversationApiService.FileHistory(param.id);
        })).subscribe(t => {
            if (t.code === 0) {
                t.items.reverse();
                this.files = t;
            }
        });
    }

    public isImage(fileName: string): boolean {
        return !!fileName.substring(fileName.lastIndexOf('.') + 1).match(/png|jpg|jpeg|gif|webp|bmp/);
    }

    public buildProbeUrl(file: ProbeFile, dir: ProbeFolder): string {
        return this.probeService.encodeProbeFileUrl(`${this.files.siteName}/${this.files.rootPath}/${dir.folderName}/${file.fileName}`);
    }

    public calcSummary() {
        let totalSize = 0;
        let count = 0;
        this.files.items.forEach(t => {
            count += t.files.length;
            t.files.forEach(t1 => {
                totalSize += t1.fileSize;
            });
        });
        return `${count} files. Total Size:${this.probeService.getFileSizeText(totalSize)}`;
    }
}
