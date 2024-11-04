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
    [otherOptions: string]: unknown;
}

export interface MessageSegmentText extends MessageSegmentBase {
    type: 'text';
    content: string;
    ats: {
        userId: string;
        pos: number;
    }[];
}

export interface MessageSegmentFileLike extends MessageSegmentBase {
    url: string;
}

export interface MessageSegmentImage extends MessageSegmentFileLike {
    type: 'image';
    width: number;
    height: number;
    alt?: string;
}

export interface MessageSegmentVideo extends MessageSegmentFileLike {
    type: 'video';
}

export interface MessageSegmentVoice extends MessageSegmentFileLike {
    type: 'voice';
    duration: number;
}

export interface MessageSegmentFile extends MessageSegmentFileLike {
    type: 'file';
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
