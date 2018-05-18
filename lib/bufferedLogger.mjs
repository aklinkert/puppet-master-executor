import util from 'util';

export class BufferedLogger {
    constructor() {
        this.flush();
    }

    getLogs() {
        return this.logs;
    }

    flush() {
        this.logs = [];
    }

    dir(...obj) {
        this.debug(obj.map((obj) => JSON.stringify(obj)));
    }

    log(...msg) {
        this.info(...msg);
    }

    info(...msg) {
        this._append("INFO", ...msg);
    }

    debug(...msg) {
        this._append("DEBUG", ...msg);
    }

    warn(...msg) {
        this._append("WARN", ...msg);
    }

    warning(...msg) {
        this.warn(...msg);
    }

    error(...msg) {
        this._append("ERROR", ...msg);
    }

    _append(level, ...msg) {
        this.logs.push(new Log({
            time: (new Date()).toISOString(),
            level: level.toUpperCase(),
            message: util.format(...msg),
        }));
    }
}

export class Log {
    constructor({ time, level, message }) {
        this.time = time;
        this.level = level;
        this.message = message;
    }

    toString() {
        return `${this.time} ${this.level} ${this.message}`;
    }
}
