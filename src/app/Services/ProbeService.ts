import { Injectable } from '@angular/core';
import { AccessToken } from '../Models/AccessToken';
import { ServerManager } from '../Repos/ServerManager';

@Injectable({
    providedIn: 'root',
})
export class ProbeService {

    constructor(private serverRepo: ServerManager) {
    }

    public encodeProbeFileUrl(filePath: string, accessToken?: string, downloadAddr = false) {
        const encoded = encodeURIComponent(filePath).replace(/%2F/g, '/');
        const index = encoded.indexOf('/');
        const probeConfig = this.serverRepo.getOurServerSync().probe;
        const formatString = downloadAddr ? probeConfig.downloadFormat : probeConfig.openFormat;
        return formatString.replace('{0}', encoded.substring(0, index)) + '/' +
            encoded.substring(index + 1) +
            (accessToken ? `?token=${encodeURIComponent(accessToken)}` : '');
    }

    public getFileSizeText(fileSize: number) {
        const units = ['KB', 'MB', 'GB'];
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
            { type: originalFile.type, lastModified: originalFile.lastModified });
    }

    public resolveAccessToken(tokenRaw: string): AccessToken {
        console.log(tokenRaw);
        const token = JSON.parse(atob(tokenRaw.split('.')[0])) as AccessToken;
        token.raw = tokenRaw;
        token.expiresDate = new Date(token.expires);
        return token;
    }
}
