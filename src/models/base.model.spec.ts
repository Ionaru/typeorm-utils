/* eslint-disable jest/no-hooks */
import { Column, createConnection, Entity, getConnection } from 'typeorm';

import { BaseModel } from './base.model';

@Entity()
class MyModel extends BaseModel {
    public static alias = 'MyModel';
    @Column({nullable: true})
    public value?: string;
}

describe('tests for BaseModel', () => {

    const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[ab89][a-f0-9]{3}-[a-f0-9]{12}/;

    beforeEach(() => createConnection({
        database: ':memory:',
        dropSchema: true,
        entities: [MyModel],
        logging: false,
        synchronize: true,
        type: 'sqlite',
    }));

    afterEach(() => getConnection().close());

    it('must create without arguments', () => {

        expect.assertions(5);

        const entity = new MyModel();

        expect(typeof entity).toBe('object');
        expect(entity.id).toBeTruthy();
        expect(entity.createdOn).toBeFalsy();
        expect(entity.updatedOn).toBeFalsy();
        expect(entity.deletedOn).toBeFalsy();
    });

    it('must create without arguments and save to db', async () => {

        expect.assertions(6);

        const entity = new MyModel();
        await entity.save();

        expect(typeof entity).toBe('object');
        expect(entity.id).toBeTruthy();
        expect(entity.createdOn).toBeTruthy();
        expect(entity.updatedOn).toBeTruthy();
        expect(entity.createdOn).toStrictEqual(entity.updatedOn);
        expect(entity.deletedOn).toBeFalsy();
    });

    it('must add a UUID when creating the entity', async () => {

        expect.assertions(1);

        const entity = new MyModel();

        expect(entity.id).toMatch(uuidRegex);
    });

    it('must keep the UUID after saving to the db', async () => {

        expect.assertions(1);

        const entity = new MyModel();
        const idBeforeSaving = entity.id;
        await entity.save();

        expect(entity.id).toStrictEqual(idBeforeSaving);
    });

    it('must update the updatedOn property on update', async () => {

        expect.assertions(3);

        const entity = new MyModel();
        await entity.save();
        const oldCreatedOn = entity.createdOn;
        const oldUpdatedOn = entity.updatedOn;

        entity.value = 'something';
        await entity.save();

        expect(entity.createdOn === oldCreatedOn).toBeTruthy();
        expect(entity.updatedOn !== entity.createdOn).toBeTruthy();
        expect(entity.updatedOn !== oldUpdatedOn).toBeTruthy();
    });

    it('must fill the deletedOn property on softRemove', async () => {

        expect.assertions(1);

        const entity = new MyModel();
        await entity.save();

        await entity.softRemove();

        const deletedEntity = await MyModel.doQuery()
            .addSelect(`${MyModel.alias}.deletedOn`)
            .where(`${MyModel.alias}.id == :id`, {id: entity.id})
            .withDeleted()
            .getOne();
        expect(deletedEntity && deletedEntity.deletedOn).toBeTruthy();
    });
});
