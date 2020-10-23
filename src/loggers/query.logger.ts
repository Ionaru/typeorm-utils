import * as chalk from 'chalk';
import Debug, { Debugger } from 'debug';
import { Logger, QueryRunner } from 'typeorm';

export class QueryLogger implements Logger {

    private readonly queryDebug: Debugger;

    public constructor(debug?: Debugger) {
        this.queryDebug = (debug ? debug : Debug('typeorm-utils')).extend('QueryLogger');
    }

    private static colorizeQuery(query: string): string {
        const queryWords = query.split(' ');
        const uppercaseRegex = new RegExp('^([A-Z]){2,}$');
        for (const queryWord of queryWords) {
            if (uppercaseRegex.test(queryWord)) {
                queryWords[queryWords.indexOf(queryWord)] = chalk.blueBright(queryWord);
            }
        }
        return queryWords.join(' ');
    }

    private static getQueryText(query: string, parameters: any[] = []) {
        let output = QueryLogger.colorizeQuery(query);

        if (parameters.length) {
            const parametersText = `(${parameters})`;
            output += `; ${chalk.white(parametersText)}`;
        }

        return output;
    }

    public logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
        this.queryDebug(QueryLogger.getQueryText(query, parameters));
    }

    public logQueryError(error: string, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
        process.stderr.write(error + '\n');
        process.stderr.write(QueryLogger.getQueryText(query, parameters) + '\n');
    }

    public logQuerySlow(_time: number, _query: string, _parameters?: any[], _queryRunner?: QueryRunner): void {
        return;
    }

    public logSchemaBuild(_message: string, _queryRunner?: QueryRunner): void {
        return;
    }

    public logMigration(_message: string, _queryRunner?: QueryRunner): void {
        return;
    }

    public log(_level: 'log' | 'info' | 'warn', _message: string, _queryRunner?: QueryRunner): void {
        return;
    }
}
