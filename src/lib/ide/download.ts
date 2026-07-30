/**
 * Zips every path in `session.projectFiles` as raw bytes so binary assets survive,
 * named after the session. Files created outside the IDE (e.g. the terminal) are skipped.
 */
import { zipSync } from 'fflate';
import { readPodBinaryFile } from '$lib/pod/fs';
import type { IdeSession } from './session.svelte';

/** Turn a display label into a safe zip filename. */
function zipFilename(label: string): string {
	const slug = label
		.trim()
		.replace(/[^a-zA-Z0-9._-]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${slug || 'project'}.zip`;
}

export async function downloadProject(session: IdeSession): Promise<void> {
	const pod = session.pod;
	if (!pod) return;

	// Flush unsaved edits first so the zip matches the editor.
	await session.saveAll();

	// Read sequentially; projects are small.
	const files: Record<string, Uint8Array> = {};
	for (const path of session.projectFiles) {
		files[path] = await readPodBinaryFile(pod, `${session.workdir}/${path}`);
	}

	const zipped = zipSync(files);
	const blob = new Blob([zipped], { type: 'application/zip' });
	const url = URL.createObjectURL(blob);
	try {
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = zipFilename(session.displayLabel);
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	} finally {
		URL.revokeObjectURL(url);
	}
}
