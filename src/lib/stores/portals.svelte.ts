import type { PortalUpdate } from '$lib/pod/portals';

/** A live preview target as rendered by Portal.svelte's port selector. */
export type PortalItem = { port: number; url: string };

export type PortalStateOptions = {
	/**
	 * When it returns a port, only that port is auto-selected for the preview (frameworks with
	 * a declared appPort); other ports stay reachable through the port selector. When it returns
	 * undefined (agents, GitHub repos), every new active portal takes over the preview.
	 */
	preferredPort?: () => number | undefined;
	/** Fires after a portal becomes active, with the new portal count (agents: auto-show/switch). */
	onActivate?: (count: number) => void;
	/** Fires when the last portal goes away (agents: auto-hide the preview pane). */
	onEmpty?: () => void;
};

/**
 * The portal controller shared by the IDE shell and the agents page: holds the live portal
 * list plus the preview-header UI state (menu, QR panel, copied flash), and folds BrowserPod
 * portal events into them. Handlers are arrow-function fields so they can be passed straight
 * to Portal.svelte as props. Host-specific behaviour stays in the host via the options hooks.
 */
export class PortalState {
	portals = $state<PortalItem[]>([]);
	selectedPort = $state<number | null>(null);
	/** Preview URL of the selected portal; '' when none. */
	url = $state('');
	showMenu = $state(false);
	showInfo = $state(false);
	copied = $state(false);
	qrError = $state('');

	private copiedTimeout: ReturnType<typeof setTimeout> | undefined;

	constructor(private options: PortalStateOptions = {}) {}

	/** Folds a BrowserPod portal event into the list and the current selection. */
	apply = (update: PortalUpdate): void => {
		const next = [...this.portals];
		const idx = next.findIndex((item) => item.port === update.port);

		if (update.active && update.url) {
			if (idx >= 0) next[idx] = { port: update.port, url: update.url };
			else next.push({ port: update.port, url: update.url });
			next.sort((a, b) => a.port - b.port);
			this.portals = next;

			const preferred = this.options.preferredPort?.();
			if (preferred === undefined || update.port === preferred || this.selectedPort === null) {
				this.selectedPort = update.port;
				this.url = update.url;
			}
			this.options.onActivate?.(next.length);
			return;
		}

		if (idx >= 0) next.splice(idx, 1);
		this.portals = next;

		if (
			this.selectedPort === update.port ||
			!next.some((item) => item.port === this.selectedPort)
		) {
			const fallback = next[0];
			this.selectedPort = fallback?.port ?? null;
			this.url = fallback?.url ?? '';
		}
		if (next.length === 0) this.options.onEmpty?.();
	};

	/** Change handler for Portal.svelte's port <select>. */
	onPortChange = (event: Event): void => {
		const value = Number((event.currentTarget as HTMLSelectElement).value);
		if (!Number.isInteger(value)) return;
		this.selectedPort = value;
		this.url = this.portals.find((item) => item.port === value)?.url ?? '';
		this.closeOverlays();
	};

	toggleMenu = (): void => {
		this.showMenu = !this.showMenu;
		if (this.showMenu) this.showInfo = false;
	};

	closeOverlays = (): void => {
		this.showMenu = false;
		this.showInfo = false;
		this.qrError = '';
	};

	showQRCode = (): void => {
		if (!this.url) return;
		this.showMenu = false;
		this.showInfo = true;
	};

	/** Records what Portal.svelte's QR render reported; it owns the canvas, this owns the message. */
	reportQrResult = (error: string | null): void => {
		this.qrError = error ?? '';
	};

	openInNewTab = (): void => {
		if (!this.url) return;
		this.showMenu = false;
		window.open(this.url, '_blank', 'noopener,noreferrer');
	};

	copyUrl = async (): Promise<void> => {
		if (!this.url) return;
		this.showMenu = false;
		await navigator.clipboard.writeText(this.url);
		this.copied = true;
		clearTimeout(this.copiedTimeout);
		this.copiedTimeout = setTimeout(() => (this.copied = false), 1200);
	};

	/** Clears the copied-flash timer; call on host unmount. */
	dispose = (): void => {
		clearTimeout(this.copiedTimeout);
	};
}
