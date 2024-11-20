import { Component, Input, model } from '@angular/core';
import { ThreadOptions } from '../Models/Threads/ThreadOptions';
import { PropertryNamesWithType } from '../Utils/Typing';

@Component({
    selector: 'app-thread-options',
    templateUrl: '../Views/thread-options.html',
    styleUrls: ['../Styles/menu.scss', '../Styles/button.scss', '../Styles/menu-textbox.scss'],
    standalone: false,
})
export class ThreadOptionsComponent {
    @Input() public showAvatarOptions = false;

    public threadOptions = model.required<ThreadOptions>();

    public flipOption<T>(name: PropertryNamesWithType<ThreadOptions, T>, newValue: T) {
        this.threadOptions.set({
            ...this.threadOptions(),
            [name]: newValue,
        });
    }
}
