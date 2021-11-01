import {
    BaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    PrimaryGeneratedColumn,
    SelectQueryBuilder,
    UpdateDateColumn,
} from 'typeorm';
import * as uuid from 'uuid';

export type BaseModelProperties = Pick<BaseModel, 'id' | 'createdOn' | 'updatedOn' | 'deletedOn'>;

export abstract class BaseModel extends BaseEntity {

    public static readonly alias: string;

    @PrimaryGeneratedColumn('uuid')
    public readonly id!: string;

    @CreateDateColumn()
    public readonly createdOn!: Date;

    @UpdateDateColumn()
    public readonly updatedOn!: Date;

    @DeleteDateColumn({name: 'deletedOn', select: false})
    public readonly deletedOn?: Date;

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    public constructor() {
        super();
        this.id = uuid.v4();
    }

    public static doQuery<T extends BaseModel>(): SelectQueryBuilder<T> {
        return this.createQueryBuilder<T>(this.alias);
    }
}
