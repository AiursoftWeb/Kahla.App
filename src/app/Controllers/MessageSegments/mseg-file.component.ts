import { Component, input } from '@angular/core';
import { MessageSegmentFile } from '../../Models/Messages/MessageSegments';

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-file.html',
    // styleUrls: ['../../Styles/MessageSegments/message-segment-text.scss']
})
export class MessageSegmentFileComponent {
    context = input.required<MessageSegmentFile>();
}
