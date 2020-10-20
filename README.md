# @ionaru/typeorm-utils

[![npm version](https://img.shields.io/npm/v/@ionaru/typeorm-utils.svg?style=for-the-badge)](https://www.npmjs.com/package/@ionaru/typeorm-utils)
[![npm version](https://img.shields.io/npm/v/@ionaru/typeorm-utils/next.svg?style=for-the-badge)](https://www.npmjs.com/package/@ionaru/typeorm-utils/v/next)
[![Build Status](https://img.shields.io/github/workflow/status/Ionaru/typeorm-utils/cd/master.svg?style=for-the-badge)](https://github.com/Ionaru/typeorm-utils/actions)
[![codecov](https://img.shields.io/codecov/c/github/Ionaru/typeorm-utils/master.svg?style=for-the-badge)](https://codecov.io/gh/Ionaru/typeorm-utils)

## Description
This package contains common TypeORM utilities I use in my projects.

## Usage
```
npm install @ionaru/typeorm-utils typeorm uuid
```

### `BaseModel`
This extendable class extends the TypeORM BaseEntity and adds useful properties to the model. 

```ts
import { BaseModel } from '@ionaru/typeorm-utils'; 

@Entity()
class UserModel extends BaseModel {

    public static alias = 'User';

    @Column({nullable: true})
    public name?: string;

}
```
```ts
const user = new UserModel();
await user.save()
console.log(UserModel.alias) // Alias given to the model in queries.
console.log(user.id) // A uuid4 string.
console.log(user.name) // Value from UserModel.
console.log(user.createdOn) // date of creation.
console.log(user.updatedOn) // date of last update.
console.log(user.deletedOn) // date when (soft) deleted.

await UserModel.doQuery() // Query example.
    .where(`${UserModel.alias}.name == :name`, {name: 'thomas'})
    .withDeleted() // Include (soft) deleted entries.
    .getOne()
```

### `buildMySQLConnectionOptions(options: IOptions)`
A helper for building the TypeORM MysqlConnectionOptions dict.

```ts
interface IOptions {
    database: string; // Database name.
    host: string; // Database host.
    port: number; // Database port.
    username: string; // Database username.
    password: string; // Database password.
    sslCA?: string; // (Optional) Path to CA certificate, relative to ormconfig.js.
    sslCert?: string; // (Optional) Path to Client certificate, relative to ormconfig.js.
    sslKey?: string; // (Optional) Path to Client Key, relative to ormconfig.js.
    sslReject?: boolean; // (Optional) Reject unsecure SSL, 'true' or 'false'.
    timezone?: string; // (Optional) Timezone for TypeORM.
    models?: string[]; // (Optional) Filenames (without extension) of the models to include.
}
```
```ts
import { buildMySQLConnectionOptions } from '@ionaru/typeorm-utils'; 

const connectionOptions = buildMySQLConnectionOptions({ // Example
    database: 'userDB',
    host: 'some.external.host',
    port: 3306,
    username: 'DBAdminUser',
    password: 'SuperSecurePa$$word',
    sslCA: 'crt/ca.crt',
    sslCert: 'crt/cert.crt',
    sslKey: 'crt/key.crt',
    sslReject: true,
    timezone: 'Z',
    models: ['user.model'],
})
```
