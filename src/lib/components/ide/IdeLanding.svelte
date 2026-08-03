<script lang="ts">
	import Icon from '@iconify/svelte';
	import { frameworkRailItems } from '$lib/config/frameworks';
	import { parseGitHubUrl } from '$lib/github/parse';

	let url = $state('');
	let error = $state('');

	function handleInput(el: HTMLInputElement) {
		error = '';
		// A pasted URL can carry newlines or stray spaces; the field holds one value.
		if (/\s/.test(el.value)) el.value = el.value.replace(/\s+/g, '');
		url = el.value;
	}

	// Resolves as you type, so the Clone action can show whether the URL is actually cloneable.
	const target = $derived(parseGitHubUrl(url));

	function openRepo() {
		if (!target) {
			error = 'Use github.com/owner/repo or …/tree/branch/optional/dir';
			return;
		}
		const { owner, repo, ref, dir } = target;
		// Full reload so any prior pod is torn down cleanly.
		window.location.href = `/ide/github/${owner}/${repo}/tree/${ref}${dir ? `/${dir}` : ''}`;
	}

	function openFramework(id: string) {
		window.location.href = `/ide?framework=${id}`;
	}
</script>

<div class="flex h-full w-full items-center justify-center overflow-auto p-6 text-zinc-300">
	<div class="w-full max-w-lg">
		<h1 class="mb-1 font-display text-lg font-semibold text-zinc-100">IDE Playground</h1>
		<p class="mb-4 text-[13px] text-white/40">
			Start from a framework template or clone a GitHub repo.
		</p>

		<a
			href="https://browserpod.io"
			target="_blank"
			rel="noopener noreferrer"
			class="glass-panel mb-6 flex items-start gap-2.5 rounded-lg border border-bc-mist/12 px-3 py-2.5 text-left transition hover:border-bc-mist/30"
		>
			<Icon
				icon="mingcute:cube-3d-line"
				width="16"
				height="16"
				class="mt-0.5 shrink-0 text-bc-mist"
			/>
			<span class="text-[12px] leading-relaxed text-white/45">
				Runs entirely in a <span class="text-zinc-200">BrowserPod</span> sandbox, a WebAssembly Node.js
				environment with a real filesystem, npm and git. Nothing installs on your machine.
			</span>
		</a>

		<div class="mb-6">
			<div class="mb-2 text-[11px] font-medium tracking-widest text-bc-mist/40 uppercase">
				Frameworks
			</div>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each frameworkRailItems as fw (fw.id)}
					<button
						onclick={() => openFramework(fw.id)}
						class="glass-panel flex items-center gap-2 rounded-lg border border-bc-mist/12 px-3 py-2 text-left text-[13px] text-zinc-300 transition hover:border-bc-mist/30"
					>
						<Icon icon={fw.icon} width="16" height="16" class="shrink-0" />
						<span class="truncate">{fw.label}</span>
					</button>
				{/each}
			</div>
		</div>

		<div>
			<div class="mb-2 flex items-center gap-2">
				<span class="text-[11px] font-medium tracking-widest text-bc-mist/40 uppercase">
					Clone from GitHub
				</span>
				<span class="group relative flex items-center">
					<span
						class="cursor-default rounded-full border border-bc-azure/30 bg-bc-azure/10 px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wider text-bc-azure/85 uppercase"
					>
						Beta
					</span>
					<span
						class="pointer-events-none absolute top-full left-0 z-50 mt-2 flex flex-col items-start opacity-0 transition-opacity duration-100 group-hover:opacity-100"
					>
						<span class="solid-panel ml-3 h-1.5 w-1.5 rotate-45 border-t border-l border-bc-mist/15"
						></span>
						<span
							class="solid-panel -mt-px flex w-[26rem] max-w-[80vw] flex-col gap-2 rounded-md border border-bc-mist/15 px-3.5 py-3 text-[12.5px] leading-[1.6] text-zinc-300 shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
						>
							<span>
								Paste the GitHub URL of a working template, for example;
								<span class="block font-mono text-[11.5px] break-all text-bc-mist">
									github.com/vitejs/vite/tree/main/packages/create-vite/template-vanilla
								</span>
							</span>
							<span class="text-zinc-400">
								Browsing and editing a cloned repo works. Automatically building and running one is
								still in beta.
							</span>
						</span>
					</span>
				</span>
			</div>
			<!-- Field and action share one shell, so the row keeps a fixed height whatever the URL length. -->
			<label
				class="glass-panel flex h-11 cursor-text items-center gap-1.5 rounded-xl border p-1.5 transition-colors focus-within:border-bc-azure/45 {error
					? 'border-bc-coral/45'
					: 'border-bc-mist/12'}"
			>
				<input
					type="text"
					value={url}
					oninput={(e) => handleInput(e.currentTarget)}
					onkeydown={(e) => {
						if (e.key !== 'Enter') return;
						e.preventDefault();
						openRepo();
					}}
					spellcheck="false"
					autocomplete="off"
					autocapitalize="off"
					aria-label="GitHub repository URL"
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={error ? 'clone-error' : undefined}
					placeholder="github.com/owner/repo/tree/main/dir"
					class="min-w-0 flex-1 bg-transparent px-2 py-1 text-[13px] leading-5 text-ellipsis whitespace-nowrap text-zinc-200 outline-none placeholder:text-white/25"
				/>
				<!-- Fills in only once the URL resolves to a repo: the action reflects what the field holds. -->
				<button
					onclick={openRepo}
					class="flex shrink-0 cursor-pointer items-center gap-1.5 self-center rounded-md px-3 py-1 text-[13px] leading-5 font-medium transition-colors duration-200 focus-visible:ring-1 focus-visible:ring-bc-mist/60 focus-visible:outline-none {target
						? 'bg-bc-azure text-white hover:bg-bc-azure/85'
						: 'bg-white/6 text-bc-mist/55 hover:text-bc-mist/85'}"
				>
					<Icon icon="simple-icons:github" width="14" height="14" />
					Clone
				</button>
			</label>
			{#if error}
				<p id="clone-error" class="mt-2 text-[12px] text-bc-coral">{error}</p>
			{/if}
		</div>
	</div>
</div>
