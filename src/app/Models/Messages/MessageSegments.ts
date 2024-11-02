export type MessageSegmentTypes = (
    | MessageSegmentText
    | MessageSegmentImage
    | MessageSegmentVideo
    | MessageSegmentVoice
    | MessageSegmentFile
    | MessageSegmentContact
    | MessageSegmentThreadInvitation
    | MessageSegmentThreadJoinRequest
)['type'];

export interface MessageSegmentBase {
    type: MessageSegmentTypes;
}

export interface MessageSegmentText extends MessageSegmentBase {
    type: 'text';
    content: string;
    ats: {
        userId: string;
        pos: number;
    }[];
}

interface MessageSegmentFileLike<TName extends MessageSegmentTypes> extends MessageSegmentBase {
    type: TName;
    url: string;
}

export interface MessageSegmentImage extends MessageSegmentFileLike<'image'> {
    width: number;
    height: number;
    alt?: string;
}

export type MessageSegmentVideo = MessageSegmentFileLike<'video'>;

export interface MessageSegmentVoice extends MessageSegmentFileLike<'voice'> {
    duration: number;
}

export interface MessageSegmentFile extends MessageSegmentFileLike<'file'> {
    fileName: string;
    size: number;
}

export interface MessageSegmentContact extends MessageSegmentBase {
    type: 'contact';
    id: string;
}

export interface MessageSegmentThreadInvitation extends MessageSegmentBase {
    type: 'thread-invitation';
    id: string;
    token: string;
    validTo: Date;
}

export interface MessageSegmentThreadJoinRequest extends MessageSegmentBase {
    type: 'thread-join-request';
    id: string;
    token: string;
    validTo: Date;
}
