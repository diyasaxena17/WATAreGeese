import { ReactNode } from 'react';

import { GraphLocation } from '../../routing/types';

export type DirectionStepRenderer = (request: {
    graphLocation: GraphLocation;
    order: number;
    onlyHighlightOnHover: boolean;
}) => ReactNode;
