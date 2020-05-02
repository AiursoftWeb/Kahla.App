import { Injectable } from '@angular/core';
import { Values } from '../values';

@Injectable({
    providedIn: 'root',
})
export class ProbeService {
    public encodeProbeFileUrl(filePath: string, accessToken?: string, downloadAddr = false) {
        const encoded = encodeURIComponent(filePath).replace(/%2F/g, '/');
        const index = encoded.indexOf('/');

        return (downloadAddr ? Values.fileDownloadAddress : Values.fileCompatAddress)
                .replace('{site}', encoded.substring(0, index)) + encoded.substring(index + 1) +
            (accessToken ? `?token=${accessToken}` : '');
    }

    public getFileSizeText(fileSize: number) {
        const units = ['kB', 'MB', 'GB'];
        const thresh = 1000;
        if (fileSize < thresh) {
            return `${fileSize} B`;
        } else {
            let index = -1;
            do {
                fileSize /= thresh;
                index++;
            } while (fileSize >= thresh && index < units.length - 1);
            return fileSize.toFixed(1) + ' ' + units[index];
        }
    }

    public renameFile(originalFile: File, prefix: string): File {
        return new File([originalFile],
            `${prefix}${new Date().getTime()}.${originalFile.name.substring(originalFile.name.lastIndexOf('.') + 1)}`,
            {type: originalFile.type, lastModified: originalFile.lastModified});
    }
}
