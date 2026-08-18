import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import {
	BuildingSearchResult,
	getBuildingSearchDocuments,
	searchBuildings
} from '../../campus-data/buildingSearch';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';

export type LocationSearchSurfaceProps = {
	label: string;
	onSelect: (building: BuildingSearchResult) => void;
	onClose: () => void;
};

export default function LocationSearchSurface({
	label,
	onSelect,
	onClose
}: LocationSearchSurfaceProps) {
	const [query, setQuery] = useState('');
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);

	const results = useMemo(() => {
		if(query.trim().length > 0) return searchBuildings(query).slice(0, 12);

		return getBuildingSearchDocuments()
			.map(building => ({
				...building,
				aliases: building.aliases.slice(),
				floors: building.floors.slice(),
				score: 0,
				matchedOn: 'code' as const
			}))
			.slice(0, 24);
	}, [query]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		setActiveIndex(0);
	}, [query]);

	const chooseBuilding = (building: BuildingSearchResult) => {
		onSelect(building);
		onClose();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if(event.key == 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}

		if(results.length == 0) return;

		if(event.key == 'ArrowDown') {
			event.preventDefault();
			const nextIndex = Math.min(activeIndex + 1, results.length - 1);
			setActiveIndex(nextIndex);
			resultRefs.current[nextIndex]?.focus();
		}

		if(event.key == 'ArrowUp') {
			event.preventDefault();
			const previousIndex = Math.max(activeIndex - 1, 0);
			setActiveIndex(previousIndex);
			if(previousIndex == 0) inputRef.current?.focus();
			else resultRefs.current[previousIndex]?.focus();
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col gap-3" onKeyDown={handleKeyDown}>
			<div className="flex items-start justify-between gap-3">
				<div>
					<div className="wg-label">Choose location</div>
					<h2 className="wg-section-title">{label}</h2>
				</div>
				<Button variant="ghost" className="min-h-0 px-3 py-1.5" onClick={onClose}>
					Close
				</Button>
			</div>

			<SearchInput
				ref={inputRef}
				label={`Search ${label.toLowerCase()}`}
				placeholder="Search by code or building name"
				value={query}
				onChange={setQuery}
			/>

			<button
				type="button"
				disabled
				className="flex min-h-touch w-full items-center gap-3 rounded-control border border-border bg-background px-3 py-2 text-left opacity-60"
			>
				<span aria-hidden="true" className="text-lg">📍</span>
				<span>
					<span className="block text-wg-body text-text-primary">Current location</span>
					<span className="block text-wg-body-secondary">Coming soon</span>
				</span>
			</button>

			<div className="min-h-0 flex-1 overflow-y-auto rounded-panel border border-border bg-surface">
				{results.length > 0 ? results.map((building, index) => (
					<button
						key={building.id}
						ref={element => {
							resultRefs.current[index] = element;
						}}
						type="button"
						className="flex min-h-touch w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-surface-raised focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus-ring"
						onFocus={() => setActiveIndex(index)}
						onClick={() => chooseBuilding(building)}
					>
						<span className="wg-building-code w-12 shrink-0">{building.buildingCode}</span>
						<span className="min-w-0">
							<span className="block truncate text-wg-body text-text-primary">{building.officialName}</span>
						</span>
					</button>
				)) : (
					<div className="wg-body-secondary px-3 py-4">No buildings found.</div>
				)}
			</div>
		</div>
	);
}
