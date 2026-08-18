import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import {
    Button,
    Chip,
    Divider,
    IconButton,
    LocationField,
    MapControlButton,
    Panel,
    RouteMetric,
    SearchInput,
    SectionHeader,
    Sheet
} from '../components/ui';

function ShowcaseContent() {
    const [search, setSearch] = useState('Davis');

    return (
        <div className="space-y-5">
            <SectionHeader
                title="WATAreGeese UI"
                description="Reusable primitives for a map-first routing experience."
            />

            <div className="space-y-2">
                <p className="wg-label">Buttons</p>
                <div className="flex flex-wrap gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button isLoading>Loading</Button>
                </div>
            </div>

            <Divider />

            <div className="space-y-2">
                <p className="wg-label">Search</p>
                <SearchInput label="Search buildings" value={search} onChange={setSearch} />
            </div>

            <div className="space-y-2">
                <p className="wg-label">Location fields</p>
                <LocationField label="From" state="selected" primaryText="Davis Centre" secondaryText="DC" />
                <LocationField label="To" state="empty" primaryText="Choose destination" />
            </div>

            <div className="space-y-2">
                <p className="wg-label">Route modes</p>
                <div className="flex flex-wrap gap-2">
                    <Chip variant="selected">Fastest</Chip>
                    <Chip>Indoors</Chip>
                    <Chip>Goose</Chip>
                    <Chip variant="disabled">Accessible</Chip>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <RouteMetric label="Time" value="8 min" />
                <RouteMetric label="Distance" value="650 m" />
                <RouteMetric label="Cover" value="Mostly indoors" />
            </div>

            <div className="flex gap-2">
                <IconButton aria-label="Swap route endpoints" icon="⇅" />
                <IconButton aria-label="Use current location" icon="⌖" pressed />
            </div>
        </div>
    );
}

export default function DesignSystemPage() {
    const showcase = <ShowcaseContent />;

    return (
        <AppShell
            panel={<Panel className="m-4 shadow-none">{showcase}</Panel>}
            sheet={<Sheet header={<SectionHeader title="Route planner" description="Mobile sheet preview" />}>{showcase}</Sheet>}
            mapControls={
                <>
                    <MapControlButton aria-label="Recenter map" icon="⌖" />
                    <MapControlButton aria-label="Zoom in" icon="+" />
                </>
            }
            map={
                <div className="flex h-full w-full items-center justify-center bg-background">
                    <div className="absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45" />
                    <div className="relative rounded-panel border border-border bg-surface px-4 py-3 shadow-subtle">
                        <p className="wg-building-code">Map/content area</p>
                        <p className="wg-body-secondary">Placeholder for visual inspection only.</p>
                    </div>
                </div>
            }
        />
    );
}
