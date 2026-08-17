import { getBuildings } from './selectors';
import { BUILDING_METADATA } from './buildingMetadata';

export type CampusLocationKind = 'building';

export type BuildingSearchResult = {
    kind: CampusLocationKind;
    id: string;
    buildingCode: string;
    officialName: string;
    aliases: string[];
    floors: string[];
    label: string;
    score: number;
    matchedOn: 'code' | 'officialName' | 'alias';
};

type BuildingSearchDocument = Omit<BuildingSearchResult, 'score' | 'matchedOn'>;

const emptyQueryResults: BuildingSearchResult[] = [];

export function searchBuildings(query: string): BuildingSearchResult[] {
    const normalizedQuery = normalizeSearchTerm(query);
    if(normalizedQuery.length == 0) return emptyQueryResults.slice();

    return getBuildingSearchDocuments()
        .map(document => scoreBuilding(document, normalizedQuery))
        .filter((result): result is BuildingSearchResult => result != null)
        .sort(compareBuildingResults);
}

export function getBuildingSearchDocuments(): BuildingSearchDocument[] {
    const byCode = new Map<string, BuildingSearchDocument>();

    getBuildings().forEach(feature => {
        const buildingCode = feature.properties.building.buildingCode;
        const metadata = BUILDING_METADATA[buildingCode];
        const existing = byCode.get(buildingCode);
        const floors = existing?.floors ?? [];

        feature.properties.building.floors.forEach(floor => {
            if(!floors.includes(floor)) floors.push(floor);
        });

        const officialName = metadata?.officialName ?? buildingCode;
        const aliases = metadata?.aliases?.slice() ?? [];

        byCode.set(buildingCode, {
            kind: 'building',
            id: buildingCode,
            buildingCode,
            officialName,
            aliases,
            floors: floors.slice().sort(),
            label: formatBuildingLabel(buildingCode, officialName, aliases)
        });
    });

    return Array.from(byCode.values())
        .sort((a, b) => a.buildingCode.localeCompare(b.buildingCode));
}

function scoreBuilding(document: BuildingSearchDocument, normalizedQuery: string): BuildingSearchResult | null {
    const candidates = [
        { matchedOn: 'code' as const, value: document.buildingCode },
        { matchedOn: 'officialName' as const, value: document.officialName },
        ...document.aliases.map(alias => ({ matchedOn: 'alias' as const, value: alias }))
    ];

    const scores = candidates
        .map(candidate => {
            const score = scoreText(candidate.value, normalizedQuery, candidate.matchedOn);
            return score == null ? null : { score, matchedOn: candidate.matchedOn };
        })
        .filter((score): score is { score: number; matchedOn: BuildingSearchResult['matchedOn'] } => score != null);

    if(scores.length == 0) return null;

    const best = scores.sort((a, b) => a.score - b.score)[0];

    return {
        ...document,
        aliases: document.aliases.slice(),
        floors: document.floors.slice(),
        score: best.score,
        matchedOn: best.matchedOn
    };
}

function scoreText(value: string, normalizedQuery: string, matchedOn: BuildingSearchResult['matchedOn']) {
    const normalizedValue = normalizeSearchTerm(value);
    if(normalizedValue == normalizedQuery) return matchScore('exact', matchedOn);
    if(normalizedValue.startsWith(normalizedQuery)) return matchScore('prefix', matchedOn);
    if(normalizedValue.includes(normalizedQuery)) return matchScore('substring', matchedOn);
    return null;
}

function matchScore(matchType: 'exact' | 'prefix' | 'substring', matchedOn: BuildingSearchResult['matchedOn']) {
    const matchBase = matchType == 'exact' ? 0 : matchType == 'prefix' ? 200 : 400;
    return matchBase + fieldScore(matchedOn);
}

function fieldScore(matchedOn: BuildingSearchResult['matchedOn']) {
    if(matchedOn == 'code') return 0;
    if(matchedOn == 'officialName') return 100;
    return 110;
}

function compareBuildingResults(a: BuildingSearchResult, b: BuildingSearchResult) {
    if(a.score != b.score) return a.score - b.score;
    return a.buildingCode.localeCompare(b.buildingCode);
}

function formatBuildingLabel(buildingCode: string, officialName: string, aliases: string[]) {
    const aliasText = aliases.length > 0 ? ` (${aliases.join(', ')})` : '';
    return `${buildingCode} - ${officialName}${aliasText}`;
}

function normalizeSearchTerm(term: string) {
    return term
        .trim()
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
