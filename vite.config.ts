import { sveltekit } from '@sveltejs/kit/vite';
import { imagetools } from '@zerodevx/svelte-img/vite';
import { FontaineTransform } from 'fontaine';
import { defineConfig } from 'vitest/config';
// import { partytownVite } from '@builder.io/partytown/utils';

export default defineConfig({
	ssr: {
		noExternal: ['typesafe-i18n']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	plugins: [
		sveltekit(),

		FontaineTransform.vite({
			fallbacks: ['BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'Noto Sans'],
			resolvePath: (id) => new URL('.' + id, import.meta.url)
		}),

		imagetools()

		// partytownVite({
		// 	dest: join(process.cwd(), '.svelte-kit/output/client/~partytown')
		// })
	]
});
