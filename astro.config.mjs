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
			description:
				'Free helicopter training. A ground curriculum built as building blocks, plus a handbook of full-detail reference articles.',
			// Pagefind is a static, client-side search index — no search service,
			// no cost. Keep it that way.
			pagefind: true,
			// Left sidebar only. The right-hand table of contents made lesson pages
			// hard to read: two columns of navigation around one column of prose.
			tableOfContents: false,
			editLink: {
				baseUrl: 'https://github.com/Masmith530/collective_knowledge/edit/main/',
			},
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/Masmith530/collective_knowledge',
				},
			],
			components: {
				Header: './src/components/overrides/Header.astro',
				ThemeSelect: './src/components/overrides/ThemeToggle.astro',
				Hero: './src/components/overrides/Hero.astro',
				Sidebar: './src/components/overrides/Sidebar.astro',
				ThemeProvider: './src/components/overrides/ThemeProvider.astro',
			},
			customCss: ['./src/styles/global.css'],
			// NOTE: this does not render the sidebar — Sidebar.astro does, and it
			// is context aware (course lessons inside a course, subjects inside the
			// Handbook). This config is still what Starlight's prev/next pagination
			// reads, so keep it in the real reading order.
			sidebar: [
				{
					label: 'Private Pilot — Helicopter',
					items: [{ autogenerate: { directory: 'curriculum/private-helicopter' } }],
				},
				{
					label: 'Subject Areas',
					items: [{ autogenerate: { directory: 'subjects' } }],
				},
			],
		}),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
