import { Component, HostListener, input, OnInit } from '@angular/core';
import { scrollTop } from '../Utils/Scrolling';

@Component({
    selector: 'app-scroll-button',
    templateUrl: '../Views/scroll-button.html',
    styleUrls: ['../Styles/scroll-button.scss', '../Styles/button.scss'],
})
export class ScrollButtonComponent implements OnInit {
    emphasis = input<boolean>(false);
    belowWindowPercent = 0;

    ngOnInit(): void {
        this.onScroll();
    }

    @HostListener('window:scroll', [])
    onScroll() {
        this.belowWindowPercent =
            (document.documentElement.scrollHeight -
                window.scrollY -
                document.documentElement.clientHeight) /
            document.documentElement.clientHeight;
    }

    clicked() {
        scrollTop(true);
    }
}
