import { Component, input } from '@angular/core';
import { MessageSegmentFile } from '../../Models/Messages/MessageSegments';

@Component({
    selector: 'app-mseg-text',
    templateUrl: '../../Views/MessageSegments/mseg-file.html',
    styleUrls: ['../../Styles/MessageSegments/mseg-file.scss']
})
export class MessageSegmentFileComponent {
    content = input.required<MessageSegmentFile>();
}
