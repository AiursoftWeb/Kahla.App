// vjs-player.component.ts
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs from 'video.js';

@Component({
    selector: 'app-vjs-player',
    template: `
        <video #target class="video-js vjs-theme-sea" controls playsinline preload="auto"></video>`,
    styleUrls: [
        '../Styles/vjs-module.scss'
    ],
    encapsulation: ViewEncapsulation.None,
})
export class VjsPlayerComponent implements OnInit, OnDestroy {
    @ViewChild('target', {static: true}) target: ElementRef;
    // see options: https://github.com/videojs/video.js/blob/mastertutorial-options.html
    @Input() options: VjsPluginOptions;
    player: videojs.Player;

    constructor() {
    }

    ngOnInit() {
        // instantiate Video.js
        this.player = videojs(this.target.nativeElement, this.options, function onPlayerReady() {
            console.log('onPlayerReady', this);
        });
    }

    ngOnDestroy() {
        // destroy player
        if (this.player) {
            this.player.dispose();
        }
    }
}

export class VjsPluginOptions {
    public fluid = false;
    public aspectRatio: string;
    public autoplay = false;
    public controls = true;
    public width: string | number;
    public height: string | number;
    public sources: {
        src: string,
        type: string,
    }[];
}
