import * as dts from 'dts-bundle';
import { existsSync } from 'fs';
import * as rc from 'recursive-copy';
import * as rimraf from 'rimraf';

export type pluginOptions = {
    libraryName: string
    srcPath: string
    distPath: string
    dtsCopySrc: string
    dtsCopyDest: string
    main: string
    outFile: string
    removeSrcDts: boolean;
    debug: boolean;
    filter: string[];
};

export class DtsBundlePlugin {
    options: pluginOptions;

    constructor (options: pluginOptions) {
        this.options = options;
        // Set src and dest paths unless provided
        const root = process.cwd() + '/';
        this.options.libraryName = this.options.libraryName || 'index';
        this.options.srcPath = this.options.srcPath || root + 'src/';
        this.options.distPath = this.options.distPath || root + 'dist/';
        this.options.dtsCopySrc = this.options.dtsCopySrc || root;
        this.options.dtsCopyDest = this.options.dtsCopyDest || this.options.distPath + 'declaration/';
        this.options.main = this.options.main || this.options.dtsCopyDest + 'src/index.d.ts';
        this.options.outFile = this.options.outFile || this.options.distPath + this.options.libraryName + '.d.ts';
        this.options.removeSrcDts = this.options.removeSrcDts || false;
        this.options.debug = this.options.debug || false;
        this.options.filter = this.options.filter || ['src/**/*.d.ts'];
    }

    apply (compiler) {
        compiler.plugin('after-emit', (compilation, callback) => {

            const dtsCopySrc = this.options.dtsCopySrc;
            const dtsCopyDest = this.options.dtsCopyDest;
            const rcOptions = {
                overwrite: true,
                filter: [
                    ...this.options.filter
                ]
            };
            rc(dtsCopySrc, dtsCopyDest, rcOptions, function (error, results) {
                if (error) {
                    console.error('[webpack: plugin/dts-bundle]', error);
                }
                callback();
            });
        });

        compiler.plugin('done', () => {
            if (!existsSync(this.options.main)) {
                console.error('[webpack: plugin/dts-bundle] main does not exist.');
                return;
            }

            dts.bundle({
                name: this.options.libraryName,
                main: this.options.main,
                out: this.options.outFile,
                removeSource: this.options.removeSrcDts,
                outputAsModuleFolder: true,
                emitOnIncludedFileNotFound: true,
                verbose: this.options.debug
            });

            // DTS Bundle does not remove the folder, just the files.
            if (this.options.removeSrcDts) {
                rimraf(this.options.dtsCopyDest, (error) => {
                    if (error) {
                        console.error('[webpack: plugin/dts-bundle] ', error);
                    }
                });
            }
        });
    }
}
