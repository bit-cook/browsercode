<script lang="ts">
	import Icon from '@iconify/svelte';

	let {
		mode,
		onSubmit,
		onCancel
	}: {
		/** 'boot' gates the first launch; 'change' swaps the stored key and restarts the session. */
		mode: 'boot' | 'change';
		onSubmit: (key: string) => void;
		onCancel?: () => void;
	} = $props();

	let apiKey = $state('');
	let revealed = $state(false);

	function submit(event: SubmitEvent) {
		event.preventDefault();
		const key = apiKey.trim();
		if (key) onSubmit(key);
	}
</script>

<form
	onsubmit={submit}
	class="glass-panel w-full max-w-[520px] rounded-[14px] border border-bc-mist/15 p-8 shadow-2xl"
>
	<div class="mb-5 flex items-center gap-3.5">
		<span
			class="flex h-12 w-12 items-center justify-center rounded-xl bg-bc-orchid/10 text-bc-orchid"
		>
			<Icon icon="mingcute:key-2-line" width="24" height="24" />
		</span>
		<div class="flex flex-col gap-1">
			<span class="text-[15px] font-semibold text-zinc-50">
				{mode === 'boot' ? 'Sign in to Codex' : 'Change your API key'}
			</span>
			<span class="text-[12.5px] text-white/40">
				{mode === 'boot'
					? "ChatGPT sign-in isn't available here, so an API key is required."
					: 'Codex reads the key at launch, so saving a new one restarts your session. Anything running in the terminal stops.'}
			</span>
		</div>
	</div>

	<div class="flex flex-col gap-3 rounded-[11px] border border-bc-mist/12 bg-white/2 px-4 py-4">
		<label for="codex-api-key" class="text-[11px] tracking-widest text-bc-mist/55 uppercase">
			OpenAI API key
		</label>
		<div class="relative">
			<!-- No bind:value: Svelte requires a static type when two-way bound, and this one toggles. -->
			<input
				id="codex-api-key"
				type={revealed ? 'text' : 'password'}
				placeholder="sk-proj-…"
				autocomplete="off"
				spellcheck="false"
				value={apiKey}
				oninput={(event) => (apiKey = event.currentTarget.value)}
				class="w-full rounded-lg border border-bc-mist/18 bg-bc-navy/55 py-2.5 pr-11 pl-3 font-mono text-[13px] tracking-tight text-zinc-50 outline-none focus:border-bc-azure/65"
			/>
			<button
				type="button"
				onclick={() => (revealed = !revealed)}
				aria-label={revealed ? 'Hide key' : 'Show key'}
				class="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-white/30 transition hover:bg-white/8 hover:text-white/70"
			>
				<Icon
					icon={revealed ? 'mingcute:eye-close-line' : 'mingcute:eye-line'}
					width="16"
					height="16"
				/>
			</button>
		</div>
		<div class="text-xs leading-relaxed text-white/40">
			Create one at
			<a
				href="https://platform.openai.com/api-keys"
				target="_blank"
				rel="noopener noreferrer"
				class="text-bc-mist hover:text-bc-azure">platform.openai.com/api-keys</a
			>
			under <span class="text-white/60">Create new secret key</span>, then paste it here. It's saved
			in this browser so you only paste it once, and sent to OpenAI when Codex runs. Usage is billed
			per token to your OpenAI account, not to a ChatGPT plan.
		</div>
	</div>

	<div class="mt-5 flex items-center justify-end gap-3">
		{#if onCancel}
			<button
				type="button"
				onclick={onCancel}
				class="rounded-md bg-white/5 px-4.5 py-2 text-[13px] font-medium text-zinc-300 transition hover:bg-white/10"
			>
				Cancel
			</button>
		{/if}
		<button
			type="submit"
			disabled={apiKey.trim().length === 0}
			class="rounded-[7px] bg-bc-azure/90 px-5 py-2 text-[13px] font-medium text-white transition hover:bg-bc-azure disabled:cursor-not-allowed disabled:opacity-40"
		>
			{mode === 'boot' ? 'Continue' : 'Save & restart'}
		</button>
	</div>
</form>
