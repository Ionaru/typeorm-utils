/* eslint-disable sonarjs/no-duplicate-string */
import * as fs from 'fs';

import { mocked } from 'ts-jest/utils';

import { buildMySQLConnectionOptions } from './build-connection-options';

describe('buildMySQLConnectionOptions', () => {

    // eslint-disable-next-line jest/no-hooks
    beforeEach(() => {
        jest.spyOn(fs, 'readFileSync');
        jest.spyOn(process, 'emitWarning');
    });

    // eslint-disable-next-line jest/no-hooks
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it('basic config', () => {

        expect.assertions(1);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('different timezone', () => {

        expect.assertions(1);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'local',
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'local',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('empty entity list', () => {

        expect.assertions(1);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            models: [],
            password: 'myPassword',
            port: 3306,
            timezone: 'local',
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'local',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('config with entity', () => {

        expect.assertions(1);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            models: ['user.model'],
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: ['dist/models/user.model.js'],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('multiple entities', () => {

        expect.assertions(1);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            models: ['user.model', 'photo.model'],
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: ['dist/models/user.model.js', 'dist/models/photo.model.js'],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('ssl warning', () => {

        expect.assertions(3);

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'some.external.ip',
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(process.emitWarning).toHaveBeenCalledTimes(1);
        expect(process.emitWarning).toHaveBeenCalledWith(
            'Connection to Database is not secure, always use SSL to connect to external databases!'
        );

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'some.external.ip',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('ssl', () => {

        expect.assertions(1);

        mocked(fs.readFileSync)
            .mockImplementationOnce(() => Buffer.from('CA'))
            .mockImplementationOnce(() => Buffer.from('CERT'))
            .mockImplementationOnce(() => Buffer.from('KEY'));

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            sslCA: 'ca.crt',
            sslCert: 'cert.crt',
            sslKey: 'key.crt',
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            ssl: {
                ca: 'CA',
                cert: 'CERT',
                key: 'KEY',
                rejectUnauthorized: true,
            },
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('unsafe ssl', () => {

        expect.assertions(3);

        mocked(fs.readFileSync)
            .mockImplementationOnce(() => Buffer.from('CA'))
            .mockImplementationOnce(() => Buffer.from('CERT'))
            .mockImplementationOnce(() => Buffer.from('KEY'));

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            sslCA: 'ca.crt',
            sslCert: 'cert.crt',
            sslKey: 'key.crt',
            sslReject: false,
            username: 'myUser',
        });

        expect(process.emitWarning).toHaveBeenCalledTimes(1);
        expect(process.emitWarning).toHaveBeenCalledWith(
            'SSL connection to Database is not secure, \'sslReject\' should be true'
        );

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: [],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            ssl: {
                ca: 'CA',
                cert: 'CERT',
                key: 'KEY',
                rejectUnauthorized: false,
            },
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('running in TS', () => {

        expect.assertions(1);

        process.argv = ['', 'index.ts'];

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            models: ['user.model'],
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            database: 'myDB',
            entities: ['src/models/user.model.ts'],
            host: 'localhost',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

    it('running migration', () => {

        expect.assertions(1);

        process.argv = ['', '', 'migration'];

        const connectionOptions = buildMySQLConnectionOptions({
            database: 'myDB',
            host: 'localhost',
            models: ['user.model'],
            password: 'myPassword',
            port: 3306,
            username: 'myUser',
        });

        expect(connectionOptions).toStrictEqual({
            cli: {
                migrationsDir: 'migrations',
            },
            database: 'myDB',
            entities: ['src/models/user.model.ts'],
            host: 'localhost',
            migrations: ['migrations/*.ts'],
            migrationsTableName: 'migrations',
            password: 'myPassword',
            port: 3306,
            timezone: 'Z',
            type: 'mysql',
            username: 'myUser',
        });

    });

});
