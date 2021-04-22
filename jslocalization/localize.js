/* eslint-disable sort-imports */
import { existsSync, readFileSync } from 'fs-extra';
import { resolve } from 'path';
import { extensions } from 'vscode';

class Localize {
    constructor() {
        this.bundle = this.resolveLanguagePack();
        this.options = undefined;
    }

    localize(key, ...args) {
        const message = this.bundle[key] || key;
        return this.format(message, args);
    }

    init() {
        this.options = {
            ...this.options,
            ...JSON.parse(process.env.VSCODE_NLS_CONFIG || '{}')
        };
    }

    format(message, args) {
        return args.length
            ? message.replace(
                /\{(\d+)\}/g,
                (match, rest) => args[rest[0]] || match
            )
            : message;
    }

    resolveLanguagePack() {
        this.init();

        const languageFormat = 'package.nls{0}.json';
        const defaultLanguage = languageFormat.replace('{0}', '.en');

        const rootPath = extensions.getExtension('YuchengWang.jslocalization').extensionPath;
        const languagePath = rootPath.concat('/i18n'.toString());

        const resolvedLanguage = this.recurseCandidates(
            languagePath,
            languageFormat,
            this.options.locale
        );

        const languageFilePath = resolve(languagePath, resolvedLanguage);

        const defaultLanguageBundle = JSON.parse(
            resolvedLanguage !== defaultLanguage
                ? readFileSync(resolve(languagePath, defaultLanguage), 'utf-8')
                : '{}'
        );

        const resolvedLanguageBundle = JSON.parse(
            readFileSync(languageFilePath, 'utf-8')
        );

        return { ...defaultLanguageBundle, ...resolvedLanguageBundle };
    }

    recurseCandidates(
        rootPath,
        format,
        candidate
    ) {
        const filename = format.replace('{0}', `.${candidate}`);
        const filepath = resolve(rootPath, filename);
        if (existsSync(filepath)) {
            return filename;
        }
        if (candidate.split('-')[0] !== candidate) {
            return this.recurseCandidates(rootPath, format, candidate.split('-')[0]);
        }
        return format.replace('{0}', '');
    }
}

export default Localize.prototype.localize.bind(new Localize());