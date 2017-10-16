class CreateChannelViewModel {
    public channelId: number;
    public connectKey: string;
}

export class InitPusherViewModel extends CreateChannelViewModel {
    public serverPath: string;
}
