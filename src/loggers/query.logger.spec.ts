/* eslint-disable jest/no-hooks */
import * as chalk from 'chalk';
import Debug from 'debug';

import { QueryLogger } from './query.logger';


describe('tests for QueryLogger', () => {

    const testError = 'Some Error';
    // noinspection SqlDialectInspection
    const testQuery = 'SELECT * FROM `some_table` WHERE `name` = ?';
    const testParameter = 'Bassie';

    beforeEach(() => {
        jest.spyOn(process.stderr, 'write');
        jest.spyOn(process.stdout, 'write');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        Debug.disable();
    });

    it('must create and log to typeorm-utils:QueryLogger without arguments', () => {

        expect.assertions(2);

        const debug = Debug('test-debug-logger');
        Debug.enable('test-debug-logger:typeorm-utils:QueryLogger');
        const logger = new QueryLogger(debug);

        expect(
            () => logger.logQuery(testQuery, [testParameter])
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(1);
    });

    it('must not log when debug logger is disabled', () => {

        expect.assertions(2);

        const debug = Debug('test-debug-logger');
        const logger = new QueryLogger(debug);

        expect(
            () => logger.logQuery(testQuery, [testParameter])
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);
    });

    it('must not log when no debug logger is passed', () => {

        expect.assertions(2);

        const logger = new QueryLogger();

        expect(
            () => logger.logQuery(testQuery, [testParameter])
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);
    });

    it ('must log query errors', () => {

        expect.assertions(3);

        const logger = new QueryLogger();
        logger.logQueryError(
            testError,
            testQuery, ['Bassie']
        );

        const b = (word: string) => chalk.blueBright(word);
        const g = (word: string) => chalk.white(word);

        expect(process.stderr.write).toHaveBeenCalledTimes(2);

        expect(process.stderr.write).toHaveBeenNthCalledWith(1,
            `${testError}\n`
        );
        // noinspection SqlDialectInspection
        expect(process.stderr.write).toHaveBeenNthCalledWith(2,
            `${b('SELECT')} * ${b('FROM')} \`some_table\` ${b('WHERE')} \`name\` = ?; ${g('(Bassie)')}\n`,
        );
    });

    it ('must log query errors without params', () => {

        expect.assertions(3);

        const logger = new QueryLogger();
        logger.logQueryError(
            testError,
            testQuery
        );

        const b = (word: string) => chalk.blueBright(word);

        expect(process.stderr.write).toHaveBeenCalledTimes(2);

        expect(process.stderr.write).toHaveBeenNthCalledWith(1,
            `${testError}\n`
        );
        // noinspection SqlDialectInspection
        expect(process.stderr.write).toHaveBeenNthCalledWith(2,
            `${b('SELECT')} * ${b('FROM')} \`some_table\` ${b('WHERE')} \`name\` = ?\n`,
        );
    });

    it('must do nothing with the other logging functions', () => {

        expect.assertions(8);

        const logger = new QueryLogger();

        expect(
            () => logger.logSchemaBuild('Schema')
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);

        expect(
            () => logger.logMigration('Migration')
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);

        expect(
            () => logger.logQuerySlow(50, 'Query')
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);

        expect(
            () => logger.log('log', 'Query')
        ).not.toThrow();
        expect(process.stderr.write).toHaveBeenCalledTimes(0);

    });
});
