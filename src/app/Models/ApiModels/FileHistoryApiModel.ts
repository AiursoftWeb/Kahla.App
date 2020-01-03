import { AiurCollection } from '../AiurCollection';
import { ProbeFolder } from '../Probe/ProbeFolder';

export class FileHistoryApiModel extends AiurCollection<ProbeFolder> {
    public siteName: string;
    public rootPath: string;
}
