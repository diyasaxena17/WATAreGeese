import { describe, expect, it } from 'vitest';

import { isRecoverableRendererError } from './rendererRecovery';

describe('renderer recovery classification', () => {
	it('treats WebGL and renderer loading failures as recoverable', () => {
		expect(isRecoverableRendererError(new Error('Failed to initialize WebGL context'))).toBe(true);
		expect(isRecoverableRendererError(new Error('Failed to fetch dynamically imported module'))).toBe(true);
		expect(isRecoverableRendererError(new Error('Loading chunk MapLibreMapRenderer failed'))).toBe(true);
	});

	it('does not convert unrelated programming errors into renderer fallback', () => {
		expect(isRecoverableRendererError(new TypeError('Cannot read properties of undefined'))).toBe(false);
		expect(isRecoverableRendererError(new Error('Route graph invariant failed'))).toBe(false);
	});
});
