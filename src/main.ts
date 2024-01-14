import Session from './Session';
import './style.css';
import SessionElement from './templates/session.temp';

const shelf = document.getElementById("shelf")! as HTMLDivElement;
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
    const sessionElemetOnShelf = new SessionElement({ id: session.id, name, });
    map.set(session.id, session);

    session.endCallback = sessionEndCallbackFactory(sessionElemetOnShelf);
    sessionElemetOnShelf.onEnd = stopSessionFactory(session);
    sessionElemetOnShelf.onPause = pauseSessionFactory(session);

    shelf.appendChild(sessionElemetOnShelf);
    resetForm();
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

function sessionEndCallbackFactory(sessionElemetOnShelf: SessionElement): (file: File) => void {
    return (file: File) => {
        if (map.has(sessionElemetOnShelf.id)) map.delete(sessionElemetOnShelf.id);
        sessionElemetOnShelf.finish({
            url: URL.createObjectURL(file),
        });
    };
}

function isValidName(name: string) {
    return name.length > 0;
}