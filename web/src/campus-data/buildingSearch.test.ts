import { describe, expect, it } from 'vitest';

import rawBuildings from './buildings.json';
import { getBuildingSearchDocuments, searchBuildings } from './buildingSearch';

describe('building search', () => {
    it('matches exact building codes first', () => {
        const results = searchBuildings('DC');

        expect(results[0]).toMatchObject({
            kind: 'building',
            id: 'DC',
            buildingCode: 'DC',
            matchedOn: 'code'
        });
    });

    it('matches building codes case-insensitively', () => {
        expect(searchBuildings('dc')[0].buildingCode).toBe('DC');
        expect(searchBuildings('sLc')[0].buildingCode).toBe('SLC');
    });

    it('matches official building names', () => {
        const results = searchBuildings('William G Davis Computer Research Centre');

        expect(results[0]).toMatchObject({
            buildingCode: 'DC',
            officialName: 'William G. Davis Computer Research Centre',
            matchedOn: 'officialName'
        });
    });

    it('matches common aliases', () => {
        expect(searchBuildings('Davis')[0]).toMatchObject({
            buildingCode: 'DC',
            matchedOn: 'alias'
        });

        expect(searchBuildings('Math')[0]).toMatchObject({
            buildingCode: 'MC',
            matchedOn: 'alias'
        });
    });

    it('supports prefix matching', () => {
        expect(searchBuildings('Dav')[0]).toMatchObject({
            buildingCode: 'DC',
            matchedOn: 'alias'
        });

        expect(searchBuildings('Student Li')[0]).toMatchObject({
            buildingCode: 'SLC',
            matchedOn: 'officialName'
        });
    });

    it('supports substring matching', () => {
        expect(searchBuildings('Porter')[0]).toMatchObject({
            buildingCode: 'DP',
            officialName: 'Dana Porter Library'
        });

        expect(searchBuildings('Quantum')[0]).toMatchObject({
            buildingCode: 'QNC'
        });
    });

    it('returns no results for irrelevant queries', () => {
        expect(searchBuildings('definitely not a waterloo building')).toEqual([]);
    });

    it('returns no results for empty queries', () => {
        expect(searchBuildings('')).toEqual([]);
        expect(searchBuildings('    ')).toEqual([]);
    });

    it('keeps ranking stable and deterministic', () => {
        const firstRun = searchBuildings('m').map(result => result.buildingCode);
        const secondRun = searchBuildings('m').map(result => result.buildingCode);

        expect(secondRun).toEqual(firstRun);
        expect(firstRun.slice(0, 6)).toEqual(['M3', 'MC', 'MKV', 'ML', 'QNC', 'BMH']);
    });

    it('preserves routing building IDs and floors', () => {
        const dc = searchBuildings('Davis')[0];

        expect(dc.id).toBe('DC');
        expect(dc.buildingCode).toBe('DC');
        expect(dc.floors).toEqual(['1', '2', '3']);
    });

    it('returns unique building documents for duplicated raw building features', () => {
        expect(getBuildingSearchDocuments().filter(building => building.buildingCode == 'B1')).toHaveLength(1);
        expect(getBuildingSearchDocuments().filter(building => building.buildingCode == 'QNC')).toHaveLength(1);
        expect(getBuildingSearchDocuments().find(building => building.buildingCode == 'QNC')?.floors).toEqual(['1', '2', '3', '4', '5', 'B']);
    });

    it('does not mutate campus-data objects', () => {
        const before = JSON.stringify(rawBuildings);

        const result = searchBuildings('DC')[0];
        result.aliases.pop();
        result.floors.pop();
        getBuildingSearchDocuments().pop();
        searchBuildings('Math');
        searchBuildings('');

        expect(JSON.stringify(rawBuildings)).toBe(before);
        expect(searchBuildings('DC')[0].aliases).toEqual(['Davis', 'Davis Centre']);
        expect(searchBuildings('DC')[0].floors).toEqual(['1', '2', '3']);
    });
});
