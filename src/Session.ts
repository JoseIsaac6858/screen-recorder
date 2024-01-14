const displayConfig: DisplayMediaStreamOptions = {
    video: {
        displaySurface: "window",
    }
};
const mimeType = "video/webm";
class Session {
    readonly id: string;
    private recorder: MediaRecorder;
    private stream: MediaStream;
    private data: Blob[];
    endCallback?: (file: File) => void;
    constructor(MediaStream: MediaStream) {
        const recordedData: Blob[] = [];
        this.recorder = new MediaRecorder(MediaStream, {
            mimeType: mimeType,
        });
        this.recorder.ondataavailable = (event) => recordedData.push(event.data);
        this.recorder.onstop = this.stop.bind(this);
        this.recorder.start();
        this.stream = MediaStream;
        this.data = recordedData;
        this.id = MediaStream.id;
    }
    stop() {
        if (this.stream.active) Session.stopStream(this.stream);
        this.recorder.stop();
        const blob = new Blob(this.data, { type: mimeType });
        const file = new File([blob], "yourfilename.mp4", { type: mimeType });
        if (this.endCallback) this.endCallback(file)
    }
    pause() {
        if (this.recorder.state === "paused") {
            return this.recorder.resume();
        }
        this.recorder.pause();
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
}

export default Session;