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
			// This is the site-wide meta description — search results and link
			// previews. It said "a ground curriculum built as building blocks, plus a
			// handbook of full-detail reference articles", which used both framings
			// the project has explicitly dropped: "building blocks" (selling the
			// pedagogy to someone who has not decided to be here) and "handbook"
			// (renamed to Subject Areas so it would not be mistaken for the FAA
			// Handbooks the site cites). Keep it in step with the home page.
			description:
				'Free, open ground school for helicopter pilots. Week-by-week ground courses, plus reference articles covering each subject in full.',
			// Pagefind is a static, client-side search index — no search service,
			// no cost. Keep it that way.
			pagefind: true,
			// Left sidebar only. The right-hand table of contents made lesson pages
			// hard to read: two columns of navigation around one column of prose.
			tableOfContents: false,
			// No `editLink` and no `social` on purpose.
			//
			// The source is private, so both would send a reader somewhere they
			// cannot go. Even public they were wrong for this audience: student
			// pilots and instructors are not going to open a pull request, and an
			// "Edit page" link in the footer of a lesson is developer furniture.
			// Corrections come to the author directly — see `why-this-is-free`.
			components: {
				Header: './src/components/overrides/Header.astro',
				ThemeSelect: './src/components/overrides/ThemeToggle.astro',
				Hero: './src/components/overrides/Hero.astro',
				Sidebar: './src/components/overrides/Sidebar.astro',
				ThemeProvider: './src/components/overrides/ThemeProvider.astro',
			},
			customCss: ['./src/styles/global.css'],
			// NOTE: this does not render the sidebar — Sidebar.astro does, and it is
			// context aware (a course's outline inside a course, the subject list
			// inside Subject Areas). This config exists *only* because Starlight's
			// prev/next pagination reads it, so it holds exactly the pages that
			// belong in a reading sequence, in reading order.
			//
			// Subject Areas is deliberately absent. Including it chained the two
			// sections into one flat list, so the Subject Areas landing page
			// advertised "Previous: Low RPM Recovery & Rotor Stall" — a Private
			// Pilot lesson — and the last lesson of the course pointed "Next" at an
			// unrelated reference article. Subject articles are standalone by
			// definition: they assume nothing about where the reader is, so there is
			// no next one. Leaving them out removes their pagination entirely, which
			// is the correct behaviour rather than a side effect.
			sidebar: [
				{
					label: 'Private Pilot — Helicopter',
					items: [{ autogenerate: { directory: 'curriculum/private-helicopter' } }],
				},
			],
		}),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
