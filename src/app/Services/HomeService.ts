import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    public currentPage = 0;

    public get wideScreenEnabled(): boolean {
        return window.innerWidth > 1000 && window.innerHeight < window.innerWidth;
    }

    public get contentWrapper(): HTMLDivElement {
        return document.querySelector('#contentWrapper');
    }

    // Nullable
    public get floatingHomeWrapper(): HTMLDivElement {
        return document.querySelector('#homeWrapper');
    }
}
