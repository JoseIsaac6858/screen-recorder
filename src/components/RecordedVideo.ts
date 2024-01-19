import { getElementById } from "../utils/dom.utils";

interface templateProps {
    title?: string | null;
    src?: string | null;
}


class RecordedVideo extends HTMLElement {
    static className = "recorded-video";
    static templateID = "recorded-video";
    
    static readonly Attributes = {
        title: "data-title",
        src: "data-src",
    } as const;
    
    static readonly Queries = {
        title: "h2",
        video: "video",
    } as const;

    static readonly template = getElementById<HTMLTemplateElement>(this.templateID);

    constructor(props?: templateProps) {
        super();
        this.classList.add(RecordedVideo.className);
        const children = RecordedVideo.childrenFrom(props, this);
        this.appendChild(children);
    }
    static childrenFrom(props: templateProps | undefined, $element: RecordedVideo) {
        if (props) 
            return RecordedVideo.useTemplate(props);
        return RecordedVideo.useAttributes($element);
    }
    static useAttributes($element: RecordedVideo) {
        const Attributes = this.Attributes;
        const title = $element.getAttribute(Attributes.title);
        const src = $element.getAttribute(Attributes.src);
        return this.useTemplate({ title, src });
    }
    static useTemplate(props: templateProps) {
        const Queries = this.Queries;
        const template = RecordedVideo.template;
        const $root = template.content.cloneNode(true) as DocumentFragment;
        const $title = $root.querySelector<HTMLHeadingElement>(Queries.title)!;
        const $video = $root.querySelector<HTMLVideoElement>(Queries.video)!;
        const { title, src } = props;
        if (typeof title === "string") $title.textContent = title;
        if (typeof src === "string") $video.src = src;
        return $root;
    }
}

customElements.define("recorded-video", RecordedVideo, {
    extends: "article"
});

export type { templateProps as props };
export default RecordedVideo;