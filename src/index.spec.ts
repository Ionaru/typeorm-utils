import * as index from './index';

describe('export tests', () => {

    it('must export everything', () => {
        expect.assertions(4);

        expect(Object.entries(index)).toHaveLength(3);
        expect(typeof index.buildMySQLConnectionOptions).toBe('function');
        expect(typeof index.BaseModel).toBe('function');
        expect(typeof index.QueryLogger).toBe('function');
    });
});
