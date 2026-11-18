// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
	site: 'https://collectiveknowledge.pages.dev',
	integrations: [
		starlight({
			title: 'Collective Knowledge',
			pagefind: false,
			components: {
				Header:      './src/components/overrides/Header.astro',
				ThemeSelect: './src/components/overrides/ThemeToggle.astro',
				Hero:        './src/components/overrides/Hero.astro',
			},
			customCss: ['./src/styles/global.css'],
		}),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
