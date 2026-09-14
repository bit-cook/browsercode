<script lang="ts">
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';
	import IdeShell from '$lib/components/ide/IdeShell.svelte';
	import { IdeSession } from '$lib/ide/session.svelte';
	import { templateSource } from '$lib/ide/template-source';
	import { repoSource } from '$lib/ide/repo-source';
	import { parseEmbedOptions } from '$lib/embed/options';

	// The host page composes the embed through the query string; nothing here is navigable, so the
	// options are read once for this page's lifetime.
	const options = parseEmbedOptions($page.url);
	const session =
		options &&
		new IdeSession(
			options.source.kind === 'framework'
				? templateSource(options.source.id)
				: repoSource(options.source.ref)
		);
</script>

{#if options && session}
	<IdeShell {session} shell={options.shell} />
{:else}
	<div class="bc-page-bg flex h-full w-full items-center justify-center p-4 text-zinc-300">
		<div class="glass-panel max-w-md rounded-xl border border-bc-mist/15 px-6 py-8 text-center">
			<div
				class="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-bc-coral/10 text-bc-coral"
			>
				<Icon icon="mingcute:alert-line" width="22" height="22" />
			</div>
			<h3 class="mb-2 text-sm font-semibold text-zinc-50">Nothing to boot</h3>
			<p class="text-[12px] leading-relaxed text-zinc-400">
				Pass <code class="text-zinc-200">?repo=&lt;github url&gt;</code> or
				<code class="text-zinc-200">?framework=&lt;id&gt;</code>, optionally with
				<code class="text-zinc-200">&amp;view=files,editor,terminal,preview</code>.
			</p>
		</div>
	</div>
{/if}
