import { ReactNode } from 'react';

import { GraphLocation } from '../../routing/types';

export type RouteEndpointSummary = {
    id: string;
    code: string;
    name?: string;
};

export type DirectionStepRenderer = (request: {
    graphLocation: GraphLocation;
    order: number;
    onlyHighlightOnHover: boolean;
}) => ReactNode;
