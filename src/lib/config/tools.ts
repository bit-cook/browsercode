import type { BrowserPod } from '@leaningtech/browserpod';
import { codexEnv, prepareCodexPod, CODEX_BIN_PATH } from '$lib/agents/codex';

export type ToolId = 'claude' | 'antigravity' | 'codex' | 'opencode';

export type ToolItem = {
	id: ToolId;
	icon: string | null;
	label: string;
	disabled: boolean;
	/** Set what the tool needs before booting, shown under its label on the agents landing. */
	requirement?: string;
	/** Tailwind classes for the icon badge when the tool is available (ignored while disabled). */
	accentClass: string;
	/** Solid Tailwind background class for the small "this one is running" status dot. */
	dotClass: string;
};

export const toolItems: ToolItem[] = [
	{
		id: 'claude',
		icon: 'mingcute:claude-line',
		label: 'Claude Code',
		disabled: false,
		// Original brand colors, not the app's accent palette — kept recognizable at a glance.
		accentClass: 'bg-orange-500/10 text-orange-400',
		dotClass: 'bg-orange-400'
	},
	{
		id: 'codex',
		icon: 'hugeicons:chat-gpt',
		label: 'Codex CLI',
		disabled: false,
		requirement: 'OpenAI API key',
		accentClass: 'bg-bc-orchid/10 text-bc-orchid',
		dotClass: 'bg-bc-orchid'
	},
	{
		id: 'antigravity',
		icon: 'bxl:google-antigravity',
		label: 'Antigravity',
		disabled: true,
		accentClass: 'bg-blue-500/10 text-blue-400',
		dotClass: 'bg-blue-400'
	},
	{
		id: 'opencode',
		icon: null,
		label: 'OpenCode',
		disabled: true,
		accentClass: 'bg-bc-coral/10 text-bc-coral',
		dotClass: 'bg-bc-coral'
	}
];

export type CLIConfig = {
	/** Prebuilt disk image, mounted at /home. */
	userImage?: string;
	storageKey: string;
	command: string;
	args: string[];
	projectFile?: string;
	openCallback?: (urlOrPath: string) => void;
	/** Runs after the pod boots, before the CLI launches. */
	prepare?: (pod: BrowserPod) => Promise<void>;
	/** Extra env for the CLI process, resolved at launch. */
	env?: () => string[];
};

export const cliConfigs: Record<string, CLIConfig> = {
	claude: {
		userImage: 'wss://disks.browserpod.io/claude_20260506.ext2',
		storageKey: 'claude_20260506',
		command: 'node',
		args: ['/home/user/claude-extracted/src/entrypoints/cli.js'],
		projectFile: '/project/claude/CLAUDE.md',
		openCallback: (urlOrPath: string) => {
			if (
				urlOrPath.startsWith('https://claude.com/cai/oauth/authorize') ||
				urlOrPath.startsWith('https://platform.claude.com/oauth/authorize')
			) {
				// Rewrite the localhost callback to the code-based exchange
				const fixedUrl = urlOrPath.replace(
					'http%3A%2F%2Flocalhost%3A0',
					'https%3A%2F%2Fplatform.claude.com%2Foauth%2Fcode'
				);
				window.open(fixedUrl, '_blank');
			}
		}
	},
	codex: {
		userImage: 'wss://disks.browserpod.io/rust-post-demos-2.ext2',
		storageKey: 'rust-post-demos-2',
		command: CODEX_BIN_PATH,
		args: [],
		projectFile: '/project/codex/AGENTS.md',
		prepare: prepareCodexPod,
		env: codexEnv
	}
};
