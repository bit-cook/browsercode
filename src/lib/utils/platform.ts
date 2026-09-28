/**
 * True on iOS, which BrowserPod does not support. iPadOS in desktop mode reports
 * `MacIntel`, so touch points are checked too. Returns false without a `navigator`.
 */
export function isIos(): boolean {
	if (typeof navigator === 'undefined') return false;
	return (
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
	);
}

/** Why BrowserPod cannot run here, or null when it can. */
export type PodBlocker = 'unsupported-browser' | 'not-isolated';

/**
 * SharedArrayBuffer is only exposed on cross-origin isolated pages, and isolation is inherited
 * from the top-level document, so an embed fails here when its host page omits the headers.
 */
export function podBlocker(): PodBlocker | null {
	if (typeof Atomics?.waitAsync !== 'function') return 'unsupported-browser';
	if (!globalThis.crossOriginIsolated) return 'not-isolated';
	return null;
}
