interface SessionDescriptor {
    id: string;
    name: string;
}

interface props extends SessionDescriptor {
    onEnd?: callback;
    onPause?: callback;
}

type callback = (prams: Omit<SessionDescriptor, "image">) => void;
const ElementsQuery = {
    video: 'video',
    title: '[data-item-id="title"]',
    main: '[data-item-id="main"]',
    pauseButton: '[data-item-id="pause-button"]',
    endButton: '[data-item-id="end-button"]',
    downloadButton: '[data-item-id="download-button"]',
}

class SessionElement extends DocumentFragment {
    readonly id: string;
    readonly name: string;
    onEnd: callback | undefined;
    onPause: callback | undefined;
    #isFinished: boolean;
    root: HTMLDivElement;
    get isFinished() {
        return this.#isFinished;
    }
    constructor(props: props) {
        super();
        this.#isFinished = false;
        this.id = props.id;
        this.name = props.name;
        this.onEnd = props.onEnd;
        this.onPause = props.onPause;

        const Root = SessionElement.create(props);
        const pauseButton = Root.querySelector<HTMLButtonElement>(ElementsQuery.pauseButton)!;
        const endButton = Root.querySelector<HTMLButtonElement>(ElementsQuery.endButton)!;

        pauseButton.addEventListener("click", this.handlePause.bind(this));
        endButton.addEventListener("click", this.handleEnd.bind(this));

        this.appendChild(Root);
        this.root = Root;
    }
    private handlePause(event: MouseEvent) {
        event.preventDefault();
        if (this.onPause) this.onPause({ id: this.id, name: this.name });
    }
    private handleEnd(event: MouseEvent) {
        event.preventDefault();
        if (this.onEnd) this.onEnd({ id: this.id, name: this.name });
    }
    finish({ url }: { url: string }) {
        const downloadButton = this.root.querySelector<HTMLLinkElement>(ElementsQuery.downloadButton)!;
        const videoElement = this.root.querySelector<HTMLVideoElement>(ElementsQuery.video)!;
        downloadButton.target = "__blank";
        downloadButton.href = url;
        videoElement.src = url;
        videoElement.setAttribute("controls", "true");
        // i'm coding again
        this.changeButtonVisibility();
    }
    private changeButtonVisibility() {
        const downloadButton = this.root.querySelector<HTMLLinkElement>(ElementsQuery.downloadButton)!;
        const pauseButton = this.root.querySelector<HTMLButtonElement>(ElementsQuery.pauseButton)!;
        const endButton = this.root.querySelector<HTMLButtonElement>(ElementsQuery.endButton)!;
        pauseButton.setAttribute("aria-hidden", "true");
        endButton.setAttribute("aria-hidden", "true");
        downloadButton.removeAttribute("aria-hidden");
    }
    static create(props: SessionDescriptor) {
        const template = document.getElementById("session-template") as HTMLTemplateElement;
        const clone = template.content.children[0]!.cloneNode(true) as HTMLDivElement;
        const title = clone.querySelector<HTMLHeadingElement>(ElementsQuery.title)!;
        title.textContent = props.name;
        return clone;
    }
}

export default SessionElement;