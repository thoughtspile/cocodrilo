import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
    environment: 'happy-dom',
		clearMocks: true,
		globals: true,
		threads: false,
		setupFiles: ['vitest.setup.ts'],
	},
});
