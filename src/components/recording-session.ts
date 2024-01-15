interface SessionDescriptor {
    id: string;
    name: string;
    kind: string;
    label: string;
    duration: string;
}

interface props extends SessionDescriptor {
    onEnd?: callback;
    onPause?: callback;
}

type callback = (prams: MouseEvent) => void;
const ElementsQuery = {
    video: 'video',
    title: '[aria-labelledby="name"]',
    kind: '[aria-labelledby="kind"]',
    label: '[aria-labelledby="label"]',
    duration: '[aria-labelledby="duration"]',
    pauseButton: '[data-item-id="pause-button"]',
    endButton: '[data-item-id="end-button"]',
    downloadButton: '[data-item-id="download-button"]',
}

class RecordingSessionElement extends HTMLElement {
    readonly id: string;
    readonly name: string;
    onEnd: callback | undefined;
    onPause: callback | undefined;
    #isFinished: boolean;
    root: HTMLDivElement;

    get isFinished() {
        return this.#isFinished;
    }

    constructor(props?: Partial<props>) {
        super();
        this.#isFinished = false;
        this.id = props?.id || "";
        this.name = props?.name || "";
        this.onEnd = props?.onEnd;
        this.onPause = props?.onPause;

        const Root = RecordingSessionElement.useTemplate(props);
        const pauseButton = Root.querySelector<HTMLButtonElement>(ElementsQuery.pauseButton)!;
        const endButton = Root.querySelector<HTMLButtonElement>(ElementsQuery.endButton)!;

        pauseButton.addEventListener("click", this.handlePause.bind(this));
        endButton.addEventListener("click", this.handleEnd.bind(this));

        this.appendChild(Root);
        this.root = Root;
    }

    private handlePause(event: MouseEvent): void {
        if (this.onPause) this.onPause(event);
        if (event.defaultPrevented) return;
        const pauseButton = this.root.querySelector<HTMLButtonElement>(ElementsQuery.pauseButton)!;
        if (pauseButton.title === "pause") {
            pauseButton.title = "resume";
        } else {
            pauseButton.title = "pause";
        }
    }

    private handleEnd(event: MouseEvent): void {
        if (this.onEnd) this.onEnd(event);
        if (event.defaultPrevented) return;
        this.changeButtonVisibility();
    }

    finish({ url }: { url: string }) {
        const downloadButton = this.root.querySelector<HTMLLinkElement>(ElementsQuery.downloadButton)!;
        downloadButton.href = url;
        this.setVideo(url)
    }

    setVideo(url: string | MediaProvider): void {
        const videoElement = this.root.querySelector<HTMLVideoElement>(ElementsQuery.video)!;
        if (typeof url === "string") {
            videoElement.src = url;
            return;
        }
        videoElement.srcObject = url;
    }

    private changeButtonVisibility() {
        const downloadButton = this.root.querySelector<HTMLLinkElement>(ElementsQuery.downloadButton)!;
        const pauseButton = this.root.querySelector<HTMLButtonElement>(ElementsQuery.pauseButton)!;
        const endButton = this.root.querySelector<HTMLButtonElement>(ElementsQuery.endButton)!;
        pauseButton.setAttribute("aria-hidden", "true");
        endButton.setAttribute("aria-hidden", "true");
        downloadButton.removeAttribute("aria-hidden");
    }

    private static useTemplate(props?: Partial<SessionDescriptor>) {
        const template = document.getElementById("session-template") as HTMLTemplateElement;
        const clone = template.content.children[0]!.cloneNode(true) as HTMLDivElement;
        if (!props) return clone;
        const title = clone.querySelector<HTMLHeadingElement>(ElementsQuery.title)!;
        const kind = clone.querySelector<HTMLHeadingElement>(ElementsQuery.kind)!;
        const label = clone.querySelector<HTMLHeadingElement>(ElementsQuery.label)!;
        const duration = clone.querySelector<HTMLHeadingElement>(ElementsQuery.duration)!;
        if (props.name) title.textContent = props.name;
        if (props.kind) kind.textContent = props.kind;
        if (props.label) label.textContent = props.label;
        if (props.duration) duration.textContent = props.duration;
        return clone;
    }
}

customElements.define("recording-session", RecordingSessionElement);

export default RecordingSessionElement;