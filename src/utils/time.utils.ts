function SecondsToHHMMSS(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    const nseconds = String(seconds).padStart(2, "0");
    if (hours > 0) {
        return (`${hours}:${String(minutes).padStart(2, "0")}:${nseconds} `);
    }
    return `${minutes}:${nseconds} `;
};

export { SecondsToHHMMSS };