import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap(file => {
        const path = join(dir, file);
        return statSync(path).isDirectory() ? sourceFiles(path) : [path];
    });
}

describe('location feature boundary', () => {
    it('does not import Leaflet, routing, or raw campus data', () => {
        const source = sourceFiles('src/features/location')
            .filter(file => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'))
            .map(file => readFileSync(file, 'utf8'))
            .join('\n');

        expect(source).not.toContain('leaflet');
        expect(source).not.toContain('react-leaflet');
        expect(source).not.toContain('../../routing');
        expect(source).not.toContain('Dijkstra');
        expect(source).not.toContain('buildings.json');
        expect(source).not.toContain('paths.json');
    });
});
