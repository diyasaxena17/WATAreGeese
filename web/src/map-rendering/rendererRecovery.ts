export function isRecoverableRendererError(error: unknown) {
	const message = error instanceof Error ? error.message : String(error ?? '');
	return /webgl|webgl2|canvas|getcontext|context lost|gpu|worker|maplibre|loading chunk|failed to fetch dynamically imported module/i.test(message);
}
