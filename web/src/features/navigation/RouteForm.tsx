import { FormEvent, useRef, useState } from 'react';

import { BuildingSearchResult } from '../../campus-data/buildingSearch';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import LocationField from '../../components/ui/LocationField';
import LocationSearchSurface from './LocationSearchSurface';

export type RouteEndpoint = 'from' | 'to';
export type TunnellingPreference = 'no-the-geese' | 'touch-grass';

export type RouteFormProps = {
	from: BuildingSearchResult | null;
	to: BuildingSearchResult | null;
	fromFloor: string | null;
	toFloor: string | null;
	tunnellingPreference: TunnellingPreference;
	onFromChange: (building: BuildingSearchResult) => void;
	onToChange: (building: BuildingSearchResult) => void;
	onFromFloorChange: (floor: string) => void;
	onToFloorChange: (floor: string) => void;
	onTunnellingPreferenceChange: (preference: TunnellingPreference) => void;
	onSwap: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function RouteForm({
	from,
	to,
	fromFloor,
	toFloor,
	tunnellingPreference,
	onFromChange,
	onToChange,
	onFromFloorChange,
	onToFloorChange,
	onTunnellingPreferenceChange,
	onSwap,
	onSubmit
}: RouteFormProps) {
	const [activeEndpoint, setActiveEndpoint] = useState<RouteEndpoint | null>(null);
	const fromFieldRef = useRef<HTMLButtonElement>(null);
	const toFieldRef = useRef<HTMLButtonElement>(null);
	const activeLabel = activeEndpoint == 'from' ? 'Starting point' : 'Destination';

	const closeSearch = () => {
		const endpoint = activeEndpoint;
		setActiveEndpoint(null);
		window.requestAnimationFrame(() => {
			if(endpoint == 'from') fromFieldRef.current?.focus();
			if(endpoint == 'to') toFieldRef.current?.focus();
		});
	};

	const selectBuilding = (building: BuildingSearchResult) => {
		if(activeEndpoint == 'from') onFromChange(building);
		else onToChange(building);
		closeSearch();
	};

	return (
		<form className="relative space-y-4" onSubmit={onSubmit}>
			<div className="space-y-2">
				<LocationField
					ref={fromFieldRef}
					label="From"
					state={from ? 'selected' : 'empty'}
					primaryText={from?.buildingCode ?? 'Choose starting point'}
					secondaryText={from ? `${from.officialName}${fromFloor ? ` · Floor ${fromFloor}` : ''}` : undefined}
					onClick={() => setActiveEndpoint('from')}
				/>
				<FloorSelect
					label="From floor"
					value={fromFloor}
					floors={from?.floors ?? []}
					disabled={!from}
					onChange={onFromFloorChange}
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
					ref={toFieldRef}
					label="To"
					state={to ? 'selected' : 'empty'}
					primaryText={to?.buildingCode ?? 'Choose destination'}
					secondaryText={to ? `${to.officialName}${toFloor ? ` · Floor ${toFloor}` : ''}` : undefined}
					onClick={() => setActiveEndpoint('to')}
				/>
				<FloorSelect
					label="To floor"
					value={toFloor}
					floors={to?.floors ?? []}
					disabled={!to}
					onChange={onToFloorChange}
				/>
			</div>

			<label className="block">
				<span className="wg-label mb-1 block">Tunnelling Preference</span>
				<select
					className="wg-control min-h-touch w-full px-3 py-2 text-wg-body"
					value={tunnellingPreference}
					onChange={event => onTunnellingPreferenceChange(event.target.value as TunnellingPreference)}
				>
					<option value="no-the-geese">NO THE GEESE</option>
					<option value="touch-grass">touch grass</option>
				</select>
			</label>

			<Button
				type="submit"
				className="w-full"
				disabled={!from || !to || !fromFloor || !toFloor}
			>
				Find route
			</Button>

			{activeEndpoint ? (
				<div className="fixed inset-x-0 bottom-0 z-[1200] h-[82svh] rounded-t-sheet border border-border bg-surface p-4 shadow-sheet md:absolute md:inset-x-0 md:top-0 md:h-[min(36rem,calc(100vh-8rem))] md:rounded-panel md:shadow-panel">
					<LocationSearchSurface
						label={activeLabel}
						onSelect={selectBuilding}
						onClose={closeSearch}
					/>
				</div>
			) : null}
		</form>
	);
}

type FloorSelectProps = {
	label: string;
	value: string | null;
	floors: string[];
	disabled: boolean;
	onChange: (floor: string) => void;
};

function FloorSelect({ label, value, floors, disabled, onChange }: FloorSelectProps) {
	return (
		<label className="block">
			<span className="wg-label mb-1 block">{label}</span>
			<select
				className="wg-control min-h-touch w-full px-3 py-2 text-wg-body disabled:cursor-not-allowed disabled:opacity-55"
				value={value ?? ''}
				disabled={disabled}
				onChange={event => onChange(event.target.value)}
			>
				<option value="" disabled>Choose floor</option>
				{floors.map(floor => (
					<option key={floor} value={floor}>
						Floor {floor}
					</option>
				))}
			</select>
		</label>
	);
}
