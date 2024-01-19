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
    if (!isValidName(name)) {
        message.textContent = "invalid name";
        return;
    }
    const session = await Session.create();
    const sessionElemetOnShelf = new RecordingSessionElement(extractElementProps(session, name));
    map.set(session.id, session);
    sessionElemetOnShelf.video = session.stream;

    session.endCallback = sessionEndCallbackFactory(sessionElemetOnShelf, name);
    session.onDurationChange = (duration: number) => {
        sessionElemetOnShelf.duration = duration;
    }
    sessionElemetOnShelf.onEnd = stopSessionFactory(session);
    sessionElemetOnShelf.onPause = pauseSessionFactory(session);

    shelf.appendChild(sessionElemetOnShelf);
    resetForm();
}

function extractElementProps(session: Session, name: string): props {
    return ({
        id: session.id, name,
        kind: session.kind,
        label: session.label,
        duration: SecondsToHHMMSS(session.duration),
    });
}

function resetForm() {
    message.textContent = "";
    nameInput.value = "";
}

function stopSessionFactory(session: Session): () => void {
    return () => session.stop();
}

function pauseSessionFactory(session: Session): () => void {
    return () => session.togglePause();
}

function sessionEndCallbackFactory($element: RecordingSessionElement, title: string): (file: File) => void {
    return (file: File) => {
        if (map.has($element.id)) map.delete($element.id);
        videosShelf.appendChild(new RecordedVideo({
            title: title,
            src: URL.createObjectURL(file)
        }));
        shelf.removeChild($element);
    };
}

function isValidName(name: string) {
    return name.length > 0;
}