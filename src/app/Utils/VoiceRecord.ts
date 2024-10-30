import { Subject } from 'rxjs';

export class VoiceRecorder {
    private audioChunks = [];
    private stream: MediaStream;
    private recorder: MediaRecorder;
    private forceStopTimeout: ReturnType<typeof setTimeout>;
    public gotAudio = new Subject<Blob>();

    constructor(private maxSeconds: number) {
    }

    public async init() {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new MediaRecorder(this.stream);

        this.recorder.addEventListener('dataavailable', event => {
            this.audioChunks.push(event.data);
        });
        this.recorder.addEventListener('stop', () => {
            this.gotAudio.next(new Blob(this.audioChunks));
            this.audioChunks = [];
        });
    }

    public startRecording() {
        this.recorder.start();
        this.forceStopTimeout = setTimeout(() => {
            this.stopRecording();
        }, this.maxSeconds * 1000);
    }

    public stopRecording() {
        if (this.recorder.state === 'recording') {
            this.recorder.stop();
        }
        clearTimeout(this.forceStopTimeout);
    }
}
