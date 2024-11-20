import { AfterViewInit, Component, HostListener, input, signal } from '@angular/core';
import { scrollBottom, scrollTop } from '../Utils/Scrolling';

@Component({
    selector: 'app-scroll-button',
    templateUrl: '../Views/scroll-button.html',
    styleUrls: ['../Styles/scroll-button.scss', '../Styles/button.scss'],
    standalone: false,
})
export class ScrollButtonComponent implements AfterViewInit {
    emphasis = input<boolean>(false);
    direction = input<'up' | 'down'>('up');
    hide = signal(false);

    ngAfterViewInit(): void {
        this.onScroll();
    }

    @HostListener('window:scroll', [])
    onScroll() {
        // const belowWindowPercent =
        //     (document.documentElement.scrollHeight -
        //         window.scrollY -
        //         document.documentElement.clientHeight) /
        //     document.documentElement.clientHeight;

        if (this.direction() === 'up') {
            const upperPixels = window.scrollY;
            console.log(upperPixels);
            this.hide.set(upperPixels < 300);
        } else {
            const h = document.documentElement.scrollHeight;
            const y = window.scrollY;
            console.log(y + window.innerHeight - h);
            this.hide.set(y + window.innerHeight > h - 300);
        }
    }

    clicked() {
        if (this.direction() === 'up') {
            scrollTop(true);
        } else {
            scrollBottom(true);
        }
    }
}
