import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
    public loaded = false;

    constructor(
        private route: ActivatedRoute,
        private conversationApiService: ConversationApiService,
        public probeService: ProbeService,
        public router: Router,
    ) {

    }

    ngOnInit(): void {
        this.loaded = false;
        this.route.params.pipe(switchMap(param => {
            return this.conversationApiService.FileHistory(param.id);
        })).subscribe(t => {
            this.loaded = true;
            if (t.code === 0) {
                t.items = t.items.filter(x => (x.files && x.files.length > 0)).reverse();
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

    public share(file: ProbeFile, dir: ProbeFolder) {
        console.log(`[file]${this.files.rootPath}/${dir.folderName}/${file.fileName}|${file.fileName}|${this.probeService.getFileSizeText(file.fileSize)}`);
        this.router.navigate(['share-target', {message: `[file]${this.files.siteName}/${this.files.rootPath}/${dir.folderName}/${file.fileName}|${file.fileName}|${this.probeService.getFileSizeText(file.fileSize)}`}]);
    }
}
