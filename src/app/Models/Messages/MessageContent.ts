import { MessageSegmentBase } from './MessageSegments';

export interface MessageContent {
    preview?: string;
    segments: MessageSegmentBase[];
}
