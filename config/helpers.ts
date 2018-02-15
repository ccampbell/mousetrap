import { join, resolve } from 'path';

const ROOT = resolve(__dirname, '..');
export const root = (path: string): string => join(ROOT, path);

export const exclude = /(node_modules|bower_components|dist|public|build|.tmp|temp)(\/|\\)/;

