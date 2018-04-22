import logs from 'color-logs';

const isDebug = process.env.NODE_ENV !== "production";

export const logger = logs(true, isDebug, process.cwd());

logger.info(`Starting in debug mode: ${isDebug}`);
