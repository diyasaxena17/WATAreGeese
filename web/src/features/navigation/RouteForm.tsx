import Select, { SingleValue } from 'react-select';

import { Dijkstra } from '../../algorithm/dijkstra';
import { OptionType } from '../../map/locations';
import Button from '../../components/ui/Button';

export type RouteFormProps = {
	buildingOptions: OptionType[];
	startFloorOptions: OptionType[];
	endFloorOptions: OptionType[];
	startBuilding: SingleValue<OptionType>;
	startFloor: SingleValue<OptionType>;
	endBuilding: SingleValue<OptionType>;
	endFloor: SingleValue<OptionType>;
	tunnellingPreference: OptionType;
	onStartBuildingChange: (value: SingleValue<OptionType>) => void;
	onStartFloorChange: (value: SingleValue<OptionType>) => void;
	onEndBuildingChange: (value: SingleValue<OptionType>) => void;
	onEndFloorChange: (value: SingleValue<OptionType>) => void;
	onTunnellingPreferenceChange: (value: SingleValue<OptionType>) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function RouteForm({
	buildingOptions,
	startFloorOptions,
	endFloorOptions,
	startBuilding,
	startFloor,
	endBuilding,
	endFloor,
	tunnellingPreference,
	onStartBuildingChange,
	onStartFloorChange,
	onEndBuildingChange,
	onEndFloorChange,
	onTunnellingPreferenceChange,
	onSubmit
}: RouteFormProps) {
	return (
		<form className="space-y-3" onSubmit={onSubmit}>
			<div className="space-y-1.5">
				<label htmlFor="start-building" className="wg-label">Start Building</label>
				<Select
					id="start-building"
					name="start-building"
					options={buildingOptions}
					className="react-select-container"
					classNamePrefix="react-select"
					value={startBuilding}
					onChange={onStartBuildingChange}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="start-floor" className="wg-label">Start Floor</label>
				<Select
					id="start-floor"
					name="start-floor"
					options={startFloorOptions}
					className="react-select-container"
					classNamePrefix="react-select"
					value={startFloor}
					onChange={onStartFloorChange}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="end-building" className="wg-label">End Building</label>
				<Select
					id="end-building"
					name="end-building"
					options={buildingOptions}
					className="react-select-container"
					classNamePrefix="react-select"
					value={endBuilding}
					onChange={onEndBuildingChange}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="end-floor" className="wg-label">End Floor</label>
				<Select
					id="end-floor"
					name="end-floor"
					options={endFloorOptions}
					className="react-select-container"
					classNamePrefix="react-select"
					value={endFloor}
					onChange={onEndFloorChange}
				/>
			</div>
			<div className="space-y-1.5">
				<label htmlFor="tunnelling-preference" className="wg-label">Tunnelling Preference</label>
				<Select
					id="tunnelling-preference"
					name="tunnelling-preference"
					options={Dijkstra.COMPARATOR_OPTIONS}
					className="react-select-container"
					classNamePrefix="react-select"
					value={tunnellingPreference}
					onChange={onTunnellingPreferenceChange}
				/>
			</div>
			<Button
				type="submit"
				className="w-full"
				disabled={!startBuilding || !startFloor || !endBuilding || !endFloor}
			>
				Find route
			</Button>
		</form>
	);
}
