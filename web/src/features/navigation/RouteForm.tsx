import { FormEvent, useId, useMemo, useState } from 'react';

import { BuildingSearchResult, searchBuildings } from '../../campus-data/buildingSearch';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import LocationField from '../../components/ui/LocationField';
import SearchInput from '../../components/ui/SearchInput';

export type RouteEndpoint = 'from' | 'to';

export type RouteFormProps = {
	from: BuildingSearchResult | null;
	to: BuildingSearchResult | null;
	onFromChange: (building: BuildingSearchResult) => void;
	onToChange: (building: BuildingSearchResult) => void;
	onSwap: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function RouteForm({
	from,
	to,
	onFromChange,
	onToChange,
	onSwap,
	onSubmit
}: RouteFormProps) {
	const id = useId();
	const [activeEndpoint, setActiveEndpoint] = useState<RouteEndpoint>('from');
	const [query, setQuery] = useState('');
	const results = useMemo(() => searchBuildings(query).slice(0, 6), [query]);
	const activeLabel = activeEndpoint == 'from' ? 'starting point' : 'destination';

	const selectBuilding = (building: BuildingSearchResult) => {
		if(activeEndpoint == 'from') onFromChange(building);
		else onToChange(building);
		setQuery('');
		setActiveEndpoint(activeEndpoint == 'from' ? 'to' : 'from');
	};

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			<div className="space-y-2">
				<LocationField
					label="From"
					state={from ? 'selected' : 'empty'}
					primaryText={from?.buildingCode ?? 'Choose starting point'}
					secondaryText={from?.officialName}
					onClick={() => setActiveEndpoint('from')}
				/>
				<div className="flex justify-center">
					<IconButton
						aria-label="Swap start and destination"
						icon="⇅"
						onClick={onSwap}
						disabled={!from && !to}
					/>
				</div>
				<LocationField
					label="To"
					state={to ? 'selected' : 'empty'}
					primaryText={to?.buildingCode ?? 'Choose destination'}
					secondaryText={to?.officialName}
					onClick={() => setActiveEndpoint('to')}
				/>
			</div>

			<div className="space-y-2">
				<SearchInput
					id={`${id}-${activeEndpoint}-search`}
					label={`Search ${activeLabel}`}
					placeholder={`Search ${activeLabel}`}
					value={query}
					onChange={setQuery}
				/>
				{query.trim().length > 0 ? (
					<div className="max-h-56 overflow-y-auto rounded-panel border border-border bg-surface">
						{results.length > 0 ? results.map(building => (
							<button
								key={building.id}
								type="button"
								className="flex min-h-touch w-full items-center gap-3 border-b border-border px-3 py-2 text-left last:border-b-0 hover:bg-surface-raised focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-focus-ring"
								onClick={() => selectBuilding(building)}
							>
								<span className="wg-building-code w-12 shrink-0">{building.buildingCode}</span>
								<span className="min-w-0">
									<span className="block truncate text-wg-body text-text-primary">{building.officialName}</span>
									{building.aliases.length > 0 ? (
										<span className="block truncate text-wg-body-secondary">{building.aliases.join(', ')}</span>
									) : null}
								</span>
							</button>
						)) : (
							<div className="wg-body-secondary px-3 py-3">No matching buildings</div>
						)}
					</div>
				) : null}
			</div>

			<Button
				type="submit"
				className="w-full"
				disabled={!from || !to}
			>
				Find route
			</Button>
		</form>
	);
}
