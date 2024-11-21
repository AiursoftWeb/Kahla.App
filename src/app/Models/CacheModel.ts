import { ThreadInfo } from './ThreadInfo';
import { KahlaUser } from './KahlaUser';
import { AccessToken } from './AccessToken';
import { AppOptions } from './AppOptions';

export class CacheModel {
    public static readonly VERSION = 4;
    public version = CacheModel.VERSION;
    public me: KahlaUser;
    public options: AppOptions;
    /**
     * @deprecated
     */
    public conversations: ThreadInfo[];
    /**
     * @deprecated
     */
    public probeTokens: Map<number, AccessToken> = new Map<number, AccessToken>();
}
