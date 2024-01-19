import Session from './Session';
import './style.css';
import RecordingSessionElement, { props } from './components/recording-session';
import { SecondsToHHMMSS } from './utils/time.utils';
import RecordedVideo from './components/RecordedVideo';

const shelf = document.getElementById("shelf")! as HTMLDivElement;
const videosShelf = document.getElementById("videos-shelf")! as HTMLDivElement;
const sessionForm = document.getElementById("session-form")! as HTMLFormElement;
const button = sessionForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
const message = sessionForm.querySelector<HTMLParagraphElement>('[data-item-id="message"]')!;
const nameInput = sessionForm.querySelector<HTMLInputElement>('[name="session-name"]')!;
const map = new Map<string, Session>();

button.addEventListener("click", handleSubmit);
window.addEventListener("beforeunload", (event) => {
    if (map.size > 0) {
        event.preventDefault();
        event.returnValue = "if you close this window all recorder will end.";
    }
})

async function handleSubmit(event: MouseEvent) {
    event.preventDefault();
    const name = nameInput.value as string;
    
    if (name.length <= 0) {
        message.textContent = "invalid name";
        return;
    }
    
    const session = await Session.create();
    const ElementProps: props = elementPropsFrom(session, name);
    const $element = new RecordingSessionElement(ElementProps);
    
    map.set(session.id, session);
    $element.video = session.stream;

    session.onDurationChange = (duration: number) => {
        $element.duration = duration;
    };
    session.endCallback = (file: File) => {
        removeSession($element);
        appendRecordedVideo($element, file);
    };
    
    shelf.appendChild($element);
    resetForm();
}

function elementPropsFrom(session: Session, name: string): props {
    return ({
        name,
        id: session.id,
        kind: session.kind,
        label: session.label,
        duration: SecondsToHHMMSS(session.duration),
        onEnd: session.stop,
        onPause: session.togglePause,
    });
}

function resetForm() {
    message.textContent = "";
    nameInput.value = "";
}

function appendRecordedVideo($element: RecordingSessionElement, file: File) {
    const element = new RecordedVideo({
        title: $element.name,
        src: URL.createObjectURL(file)
    });
    videosShelf.appendChild(element);
}

function removeSession($element: RecordingSessionElement) {
    if (map.has($element.id)) map.delete($element.id);
    shelf.removeChild($element);
}