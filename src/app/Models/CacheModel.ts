import { ThreadInfo } from './ThreadInfo';
import { Device } from './Device';
import { KahlaUser } from './KahlaUser';
import { Conversation } from './Conversation';
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
    public devices: Device[];
    /**
     * @deprecated
     */
    public conversationDetail: Map<number, Conversation> = new Map<number, Conversation>();
    public probeTokens: Map<number, AccessToken> = new Map<number, AccessToken>();
}
