<script lang="ts">
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	let {
		willAskForKey,
		onCancel
	}: {
		/** No stored API key yet, so the sign-in card comes right after this one. */
		willAskForKey: boolean;
		onCancel: () => void;
	} = $props();

	let elapsed = $state(0);
	onMount(() => {
		const start = performance.now();
		const id = setInterval(() => (elapsed = (performance.now() - start) / 1000), 100);
		return () => clearInterval(id);
	});
</script>

<div
	class="glass-panel w-full max-w-[520px] overflow-hidden rounded-[14px] border border-bc-mist/15 px-8 pt-8 pb-7 shadow-2xl"
>
	<div class="mb-6 flex items-center gap-3.5">
		<span
			class="flex h-12 w-12 items-center justify-center rounded-xl bg-bc-orchid/10 text-bc-orchid"
		>
			<Icon icon="hugeicons:chat-gpt" width="26" height="26" />
		</span>
		<div class="flex flex-col gap-1">
			<span class="text-[15px] font-semibold text-zinc-50">Loading Codex CLI</span>
			<span class="text-[12.5px] text-white/40">
				Streaming Codex into your browser sandbox. Nothing installs on your machine.
			</span>
		</div>
	</div>

	<div class="relative h-2 w-full overflow-hidden rounded-full bg-white/7">
		<div class="track absolute top-0 bottom-0 w-1/3 rounded-full"></div>
	</div>

	{#if willAskForKey}
		<div
			class="mt-4.5 flex gap-3 rounded-[10px] border border-bc-gold/18 bg-bc-gold/6 p-3.5 text-[12.5px] leading-relaxed text-white/60"
		>
			<span
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-bc-gold/12 text-bc-gold"
			>
				<Icon icon="mingcute:information-line" width="15" height="15" />
			</span>
			<div>
				<span class="font-semibold text-zinc-50">Sign-in comes next.</span>
				Codex needs an OpenAI API key to run in BrowserPod, so grab one from
				<a
					href="https://platform.openai.com/api-keys"
					target="_blank"
					rel="noopener noreferrer"
					class="text-bc-mist hover:text-bc-azure">platform.openai.com/api-keys</a
				> while this loads.
			</div>
		</div>
	{/if}

	<div class="mt-5.5 flex items-center justify-between">
		<span class="text-xs text-white/28 tabular-nums">{elapsed.toFixed(1)}s elapsed</span>
		<button
			onclick={onCancel}
			class="rounded-md bg-white/5 px-4.5 py-2 text-[13px] font-medium text-zinc-300 transition hover:bg-white/10"
		>
			Cancel
		</button>
	</div>
</div>

<style>
	.track {
		background-image: linear-gradient(90deg, var(--color-bc-azure), var(--color-bc-orchid));
		animation: sweep 1.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
	}
	@keyframes sweep {
		0% {
			transform: translateX(-105%);
		}
		100% {
			transform: translateX(305%);
		}
	}
</style>
