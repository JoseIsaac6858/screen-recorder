function getElementById<T extends HTMLElement | null = HTMLElement | null>(id: string): T {
    return globalThis.document.getElementById(id) as T;
}

export {
    getElementById,
}