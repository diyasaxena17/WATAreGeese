import { Route } from '../../routing/types';
import DirectionsList from './DirectionsList';
import DirectionsListItem from './DirectionsListItem';
import RouteSummary from './RouteSummary';
import { DirectionStepRenderer } from './types';

export type DirectionsPanelProps = {
    route: Route | null;
    variant: 'mobile' | 'desktop';
    currentDirection?: number;
    onPreviousDirection?: () => void;
    onNextDirection?: () => void;
    renderDirectionItem: DirectionStepRenderer;
};

export default function DirectionsPanel({
    route,
    variant,
    currentDirection = 1,
    onPreviousDirection,
    onNextDirection,
    renderDirectionItem
}: DirectionsPanelProps) {
    if(variant == 'mobile') {
        return (
            <div
                id="mobile-directions"
                className="z-20 visible md:invisible absolute top-[16%] w-[90%] bg-gray-200/85 py-1 shadow-2xl"
            >
                {route != null ? (
                    <>
                        <RouteSummary route={route} />
                        <div className="flex flex-row">
                            <button
                                className="px-1 text-xl"
                                onClick={onPreviousDirection}
                            >
                                {"◀️"}
                            </button>
                            <div className="grow">
                                <DirectionsListItem
                                    graphLocation={route.graphLocations[currentDirection]}
                                    order={currentDirection}
                                    onlyHighlightOnHover={false}
                                    renderDirectionItem={renderDirectionItem}
                                />
                            </div>
                            <button
                                className="px-1 text-xl"
                                onClick={onNextDirection}
                            >
                                {"▶️"}
                            </button>
                        </div>
                    </>
                ) : 'No routes found :('}
            </div>
        );
    }

    return (
        <div
            id="directions"
            className="z-20 invisible md:visible absolute left-[2%] w-auto top-[25%] max-h-[20%] md:max-h-[65%] overflow-y-auto p-4 bg-gray-200/85 shadow-2xl"
        >
            {route != null ? (
                <>
                    <RouteSummary route={route} />
                    <DirectionsList route={route} renderDirectionItem={renderDirectionItem} />
                </>
            ) : 'No routes found :('}
        </div>
    );
}
