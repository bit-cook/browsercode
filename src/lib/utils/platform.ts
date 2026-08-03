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
