import { Injectable } from '@angular/core';
import { Values } from '../values';

@Injectable({
    providedIn: 'root',
})
export class ProbeService {
    public encodeProbeFileUrl(filePath: string) {
        const encoded = encodeURIComponent(filePath).replace(/%2F/g, '/');
        const index = encoded.indexOf('/');
        return Values.fileCompatAddress.replace('{site}', encoded.substring(0, index)) + encoded.substring(index + 1);
    }
}
