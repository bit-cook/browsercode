# Embedding BrowserCode

BrowserCode runs entirely in the browser, so an embed is our page inside your iframe.

```html
<iframe
	src="https://browsercode.io/embed?repo=github.com/sveltejs/kit&view=preview"
	allow="cross-origin-isolated"
	style="width: 100%; height: 600px; border: 0"
></iframe>
```

## Your page must be cross-origin isolated

This is the one requirement we cannot satisfy for you. BrowserPod needs `SharedArrayBuffer`, which browsers only expose on cross-origin isolated pages, and isolation is inherited from the top-level document. The page doing the embedding has to send both headers itself:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

and the iframe needs `allow="cross-origin-isolated"`. Without all three the embed loads and then reports that the headers are missing.

Be aware that `require-corp` blocks cross-origin resources that do not opt in, which can break images, fonts, analytics and third-party iframes elsewhere on your page. Deploy `Cross-Origin-Embedder-Policy-Report-Only` first to see what would break, and consider `credentialless` instead, which clears most of it. If you cannot enable these headers at all, open BrowserCode in a new tab instead, which needs nothing from your page.

## Options

| Parameter   | Value                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| `repo`      | Any GitHub URL or `owner/repo`, optionally `.../tree/<ref>/<dir>`             |
| `framework` | A template id (`vite`, `react`, `svelte`, `vue`, `nextjs`, `nuxt`, `express`) |
| `view`      | Comma separated: `files`, `search`, `editor`, `terminal`, `preview`           |

`view` defaults to every pane. Pass `repo` or `framework`, not both; with neither, the default template boots. Controls that stop making sense are dropped automatically, so a preview-only embed has no hide button and no port badge.

```
/embed?repo=https://github.com/user/repo/tree/main/examples/demo
/embed?framework=vite&view=preview
/embed?framework=nextjs&view=files,editor,terminal
```
