import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap(file => {
        const path = join(dir, file);
        return statSync(path).isDirectory() ? sourceFiles(path) : [path];
    });
}

describe('directions presentation boundary', () => {
    it('does not import routing internals, raw campus data, or Leaflet', () => {
        const source = sourceFiles('src/features/directions')
            .filter(file => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'))
            .map(file => readFileSync(file, 'utf8'))
            .join('\n');

        expect(source).not.toContain('../../routing/dijkstra');
        expect(source).not.toContain('../../routing/graph');
        expect(source).not.toContain('new Dijkstra');
        expect(source).not.toContain('new AdjacencyList');
        expect(source).not.toContain('buildings.json');
        expect(source).not.toContain('paths.json');
        expect(source).not.toContain('leaflet');
        expect(source).not.toContain('react-leaflet');
    });
});
