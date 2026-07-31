<script lang="ts">
	import Icon from '@iconify/svelte';
	import { frameworkRailItems } from '$lib/config/frameworks';
	import { parseGitHubUrl } from '$lib/github/parse';

	let url = $state('');
	let error = $state('');

	const maxFieldHeight = 112;

	// The field wraps so a long URL stays fully readable instead of scrolling out of view.
	function fitToContent(el: HTMLTextAreaElement) {
		el.style.height = 'auto';
		el.style.height = `${Math.min(el.scrollHeight, maxFieldHeight)}px`;
		el.style.overflowY = el.scrollHeight > maxFieldHeight ? 'auto' : 'hidden';
	}

	function handleInput(el: HTMLTextAreaElement) {
		error = '';
		// A pasted URL can carry newlines or stray spaces; the field holds one value.
		if (/\s/.test(el.value)) el.value = el.value.replace(/\s+/g, '');
		url = el.value;
		fitToContent(el);
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
			<div class="mb-2 text-[11px] font-medium tracking-widest text-bc-mist/40 uppercase">
				Clone from GitHub
			</div>
			<!-- Field and action share one shell so the growing URL never drags the button out of place. -->
			<label
				class="glass-panel flex cursor-text items-center gap-1.5 rounded-xl border p-1.5 transition-colors focus-within:border-bc-azure/45 {error
					? 'border-bc-coral/45'
					: 'border-bc-mist/12'}"
			>
				<textarea
					value={url}
					oninput={(e) => handleInput(e.currentTarget)}
					onkeydown={(e) => {
						if (e.key !== 'Enter') return;
						e.preventDefault();
						openRepo();
					}}
					rows="1"
					spellcheck="false"
					aria-label="GitHub repository URL"
					aria-invalid={error ? 'true' : undefined}
					aria-describedby={error ? 'clone-error' : undefined}
					placeholder="github.com/owner/repo/tree/main/dir"
					class="min-w-0 flex-1 resize-none overflow-hidden bg-transparent px-2 py-1 text-[13px] leading-5 break-all text-zinc-200 outline-none placeholder:text-white/25"
				></textarea>
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
