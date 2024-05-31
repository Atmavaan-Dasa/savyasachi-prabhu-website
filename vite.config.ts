import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import lqip from 'vite-plugin-lqip';

export default defineConfig({
	plugins: [sveltekit(), lqip(), imagetools()]
});
