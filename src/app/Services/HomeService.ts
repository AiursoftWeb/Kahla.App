import { Injectable } from '@angular/core';
import { clearAllBodyScrollLocks, disableBodyScroll } from 'body-scroll-lock';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    public currentPage = 0;

    public get wideScreenEnabled(): boolean {
        return window.innerWidth > 730 && window.innerHeight < window.innerWidth;
    }

    public get contentWrapper(): HTMLDivElement {
        return document.querySelector('#contentWrapper');
    }

    // Nullable
    public get floatingHomeWrapper(): HTMLDivElement {
        return document.querySelector('#homeWrapper');
    }

    public updateIosDisableScroll(): void {
        clearAllBodyScrollLocks();
        if (this.contentWrapper) {
            disableBodyScroll(this.contentWrapper);
        }
        if (this.floatingHomeWrapper) {
            disableBodyScroll(this.floatingHomeWrapper);
        }
    }
}
