import { Component, Input, model } from '@angular/core';
import { ThreadOptions } from '../Models/Threads/ThreadOptions';
import { PropertryNamesWithType } from '../Utils/Typing';

@Component({
    selector: 'app-thread-options',
    templateUrl: '../Views/thread-options.html',
    styleUrls: ['../Styles/menu.scss', '../Styles/button.scss', '../Styles/toggleButton.scss'],
})
export class ThreadOptionsComponent {
    @Input() public showAvatarOptions = false;

    public threadOptions = model.required<ThreadOptions>();

    public flipOption(name: PropertryNamesWithType<ThreadOptions, boolean>, newValue: boolean) {
        this.threadOptions.set({
            ...this.threadOptions(),
            [name]: newValue,
        });
    }
}
