/**
 * @file Manages the configuration settings for TypeORM.
 */
import * as fs from 'fs';

import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

type Writable<T> = { -readonly [P in keyof T]: T[P] };

interface IOptions {
    database: string;
    host: string;
    port: number;
    username: string;
    password: string;
    sslCA?: string;
    sslCert?: string;
    sslKey?: string;
    sslReject?: boolean;
    timezone?: string;
    models?: string[];
}

export const buildMySQLConnectionOptions = (
    {database, host, port, username, password, sslCA, sslCert, sslKey, sslReject = true, timezone = 'Z', models = []}: IOptions
): MysqlConnectionOptions => {

    const runningMigration = process.argv.length >= 3 && process.argv[2].includes('migration');
    const runningTSMain = process.argv[1].includes('index.ts');

    const connectionOptions: Writable<MysqlConnectionOptions> = {
        database,
        host,
        password,
        port,
        timezone,
        type: 'mysql',
        username,
    };

    if (sslCA && sslCert && sslKey) {
        connectionOptions.ssl = {
            ca: fs.readFileSync(sslCA).toString(),
            cert: fs.readFileSync(sslCert).toString(),
            key: fs.readFileSync(sslKey).toString(),
            rejectUnauthorized: sslReject,
        };

        if (!sslReject) {
            process.emitWarning('SSL connection to Database is not secure, \'sslReject\' should be true');
        }
    }

    if (!connectionOptions.ssl && !['localhost', '0.0.0.0', '127.0.0.1'].includes(host)) {
        process.emitWarning('Connection to Database is not secure, always use SSL to connect to external databases!');
    }

    const jsMapper =  (model: string) => `dist/models/${model}.js`;
    const tsMapper =  (model: string) => `src/models/${model}.ts`;
    connectionOptions.entities = models.map(runningMigration || runningTSMain ? tsMapper : jsMapper);

    if (runningMigration) {
        connectionOptions.cli = {
            migrationsDir: 'migrations',
        };
        connectionOptions.migrations = ['migrations/*.ts'];
        connectionOptions.migrationsTableName = 'migrations';
    }

    return connectionOptions;
};
