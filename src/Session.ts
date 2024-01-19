const displayConfig: DisplayMediaStreamOptions = {
    video: {
        displaySurface: "window",
    }
};
const mimeType = "video/webm; codecs=vp8";
class Session {
    readonly id: string;
    private recorder: MediaRecorder;
    readonly stream: MediaStream;
    private data: Blob[];
    kind: string;
    label: string;
    duration: number;
    private durationCount: number = 0;
    endCallback?: (file: File) => void;
    onDurationChange?: (duration: number) => void;
    constructor(MediaStream: MediaStream) {
        const { kind, label } = MediaStream.getTracks()[0];
        const recordedData: Blob[] = [];
        this.recorder = new MediaRecorder(MediaStream, {
            mimeType: mimeType,
        });
        this.stream = MediaStream;
        this.data = recordedData;
        this.id = MediaStream.id;
        this.kind = kind;
        this.label = Session.cutStreamLabel(label);
        this.duration = 0;
        this.stop = this.stop.bind(this);
        this.start();
    }
    start() {
        this.recorder.ondataavailable = (event) => {
            this.data.push(event.data)
        };
        this.recorder.onstop = this.stop;
        this.recorder.start();
        this.resumeTimeCounter();
    }
    private resumeTimeCounter() {
        this.durationCount = setInterval(() => {
            this.duration++;
            if (this.onDurationChange) {
                this.onDurationChange(this.duration);
            }
        }, 1000);
    }

    stop() {
        this.pauseTimeCounter();
        if (this.recorder.state !== "inactive") {
            this.recorder.stop();
            return;
        }
        if (this.stream.active) {
            Session.stopStream(this.stream);
        }
        const blob = new Blob(this.data, { type: mimeType });
        const file = new File([blob], `${this.id}.webm`, { type: mimeType });
        if (this.endCallback) this.endCallback(file)
    }
    private pauseTimeCounter() {
        clearInterval(this.durationCount);
    }

    resume() {
        this.recorder.resume();
        this.resumeTimeCounter();
    }
    pause() {
        this.pauseTimeCounter();
        this.recorder.pause();
    }
    togglePause() {
        if (this.recorder.state !== "recording") {
            this.resume();
            return;
        }
        this.pause();
    }
    static stopStream(stream: MediaStream) {
        stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    static async create() {
        const MediaStream = await navigator.mediaDevices.getDisplayMedia(displayConfig);
        return new Session(MediaStream);
    }
    static cutStreamLabel(type: string) {
        if (/window/.test(type)) {
            return `window:${type.slice(type.length - 2).replace(":", "")}`;
        }
        if (/screen/.test(type)) {
            return `screen:${type.slice(type.length - 2).replace(":", "")}`;
        }
        return "navigator:tab";
    }
}

export default Session;