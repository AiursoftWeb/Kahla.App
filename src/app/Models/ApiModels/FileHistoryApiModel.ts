import { AiurCollection } from '../AiurCollection';
import { ProbeFile } from '../Probe/ProbeFile';

export class FileHistoryApiModel extends AiurCollection<ProbeFile> {
    public siteName: string;
    public rootPath: string;
    public showingDateUTC: string;
}
