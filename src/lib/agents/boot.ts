import type { BrowserPod } from '@leaningtech/browserpod';
import { cliConfigs, toolItems } from '$lib/config/tools';
import { writePodBinaryFile, writeToTerminal } from '$lib/pod/fs';
import type { PortalUpdate } from '$lib/pod/portals';
import { isIos } from '$lib/utils/platform';
import { trackEvent } from '$lib/utils/useLazyTracking';

/**
 * Boots an agent tool's disk image into a pod and runs its CLI against `terminalEl`.
 * Portal events (and Claude's OAuth open events) stream through the callbacks
 * configured in `cliConfigs`.
 */
export async function bootCLI(
	tool: keyof typeof cliConfigs,
	terminalEl: HTMLElement,
	onPortalUpdate?: (update: PortalUpdate) => void
) {
	const { BrowserPod } = await import('@leaningtech/browserpod');

	const config = cliConfigs[tool] ?? cliConfigs.gemini;
	const toolLabel = toolItems.find((item) => item.id === tool)?.label ?? tool;

	if (isIos()) {
		terminalEl.textContent = 'unsupported';
		return;
	}

	const pod = await BrowserPod.boot({
		apiKey: import.meta.env.VITE_API_KEY as string,
		userImage: config.userImage,
		storageKey: config.storageKey
	});
	const terminal = await pod.createDefaultTerminal(terminalEl);

	pod.onPortal((portal) => {
		const port = Number(portal?.port);
		const rawUrl = portal?.url;
		const url = typeof rawUrl === 'string' ? rawUrl.trim() : '';

		if (!Number.isInteger(port) || port <= 0) {
			console.log('[portal] update', portal);
			return;
		}

		if (url.length > 0) {
			console.log(`[portal] active port=${port} url=${url}`);
			onPortalUpdate?.({ port, url, active: true });
		} else {
			console.log(`[portal] removed port=${port}`);
			onPortalUpdate?.({ port, url: null, active: false });
		}
	});

	if (config.openCallback) {
		pod.onOpen(config.openCallback);
	}

	const homePath = '/home/user/project';
	await pod.createDirectory(homePath, { recursive: true });

	if (config.projectFile) {
		const filename = config.projectFile.split('/').pop()!;
		await copyStaticFile(pod, config.projectFile, `${homePath}/${filename}`);
	}

	writeToTerminal(terminal, `Starting ${toolLabel}...\n`);

	trackEvent('Booted', { tool: toolLabel });

	await pod.run(config.command, config.args, {
		env: ['COLORTERM=truecolor'],
		terminal,
		cwd: homePath
	});
}

/** Copies a static asset served by this app into the pod at `destPath`. */
async function copyStaticFile(pod: BrowserPod, srcPath: string, destPath: string): Promise<void> {
	const response = await fetch(srcPath);
	if (!response.ok) {
		throw new Error(`Failed to fetch "${srcPath}" (${response.status} ${response.statusText})`);
	}
	await writePodBinaryFile(pod, destPath, await response.arrayBuffer());
}
