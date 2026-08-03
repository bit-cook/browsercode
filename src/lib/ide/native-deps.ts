/**
 * Per-framework npm `overrides` injected into a cloned GitHub repo's package.json before
 * install.
 */

type Manifest = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	overrides?: Record<string, unknown>;
	[key: string]: unknown;
};

/** What the repo declares, package name to version spec, dependencies and devDependencies. */
type DeclaredDeps = Map<string, string>;

type OverrideRule = {
	framework: string;
	applies: (deps: DeclaredDeps) => boolean;
	overrides: Record<string, string>;
	/** Echoed to Output after the packages pinned; a lowercase clause saying why they are. */
	reason: string;
};

const OVERRIDE_RULES: OverrideRule[] = [
	{
		framework: 'Vite 8+',
		applies: (deps) => majorAtLeast(deps, 'vite', 8),
		overrides: {
			'@napi-rs/wasm-runtime': '1.1.6'
		},
		reason: 'the wasm runtime; it otherwise fails to instantiate in the pod'
	},
	{
		framework: 'Vite 7 and earlier',
		applies: (deps) => majorBelow(deps, 'vite', 8),
		overrides: {
			esbuild: 'npm:esbuild-wasm@0.25.11',
			rollup: 'npm:@rollup/wasm-node@4.52.4'
		},
		reason: 'the native esbuild and rollup binaries cannot run in the pod'
	}
];

/** Highest major the spec could install. Null means no ceiling at all. */
function highestMajor(spec: string): number | null {
	if (spec.includes('>') && !spec.includes('<')) return null;
	const versions = spec.match(/\d+(?:\.\d+)*/g);
	if (!versions) return null;
	return Math.max(...versions.map((version) => Number.parseInt(version, 10)));
}

/** True when `name` is declared and can install `major` or newer, an unversioned spec included. */
function majorAtLeast(deps: DeclaredDeps, name: string, major: number): boolean {
	const spec = deps.get(name);
	if (spec === undefined) return false;
	const highest = highestMajor(spec);
	return highest === null || highest >= major;
}

/** True when `name` is declared and cannot install `major` or newer. */
function majorBelow(deps: DeclaredDeps, name: string, major: number): boolean {
	const spec = deps.get(name);
	if (spec === undefined) return false;
	const highest = highestMajor(spec);
	return highest !== null && highest < major;
}

/**
 * Forces every matching rule's overrides into the manifest, winning over the repo's own entry
 * for the same package. Returns null when nothing changed: no rule matched, ours already match,
 * or the manifest would not parse.
 */
export function patchClonedManifest(
	manifestRaw: string
): { patched: string; notes: string[] } | null {
	let manifest: Manifest;
	try {
		manifest = JSON.parse(manifestRaw) as Manifest;
	} catch {
		return null;
	}
	const deps: DeclaredDeps = new Map(
		Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })
	);
	const overrides = { ...manifest.overrides };
	const notes: string[] = [];
	for (const rule of OVERRIDE_RULES) {
		if (!rule.applies(deps)) continue;
		const applied: string[] = [];
		for (const [name, spec] of Object.entries(rule.overrides)) {
			if (overrides[name] === spec) continue;
			overrides[name] = spec;
			applied.push(`${name}@${spec}`);
		}
		if (applied.length === 0) continue;
		notes.push(`${rule.framework}: pinned ${applied.join(', ')} — ${rule.reason}`);
	}
	if (notes.length === 0) return null;
	manifest.overrides = overrides;
	const indent = manifestRaw.match(/^([ \t]+)"/m)?.[1] ?? '  ';
	const patched = JSON.stringify(manifest, null, indent) + (manifestRaw.endsWith('\n') ? '\n' : '');
	return { patched, notes };
}
