import { FormEvent, useState } from 'react';

import { BuildingSearchResult } from '../../campus-data/buildingSearch';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import LocationField from '../../components/ui/LocationField';
import LocationSearchSurface from './LocationSearchSurface';

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
	const [activeEndpoint, setActiveEndpoint] = useState<RouteEndpoint | null>(null);
	const activeLabel = activeEndpoint == 'from' ? 'Starting point' : 'Destination';

	const selectBuilding = (building: BuildingSearchResult) => {
		if(activeEndpoint == 'from') onFromChange(building);
		else onToChange(building);
		setActiveEndpoint(null);
	};

	return (
		<form className="relative space-y-4" onSubmit={onSubmit}>
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

			<Button
				type="submit"
				className="w-full"
				disabled={!from || !to}
			>
				Find route
			</Button>

			{activeEndpoint ? (
				<div className="fixed inset-x-0 bottom-0 z-50 h-[82svh] rounded-t-sheet border border-border bg-surface p-4 shadow-sheet md:absolute md:inset-x-0 md:top-0 md:h-[min(36rem,calc(100vh-8rem))] md:rounded-panel md:shadow-panel">
					<LocationSearchSurface
						label={activeLabel}
						onSelect={selectBuilding}
						onClose={() => setActiveEndpoint(null)}
					/>
				</div>
			) : null}
		</form>
	);
}
