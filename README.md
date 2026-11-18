# Helicopter Training Resource (Starter Scaffold)

A lean starter template built with **Astro + Starlight**, **TypeScript**, **Tailwind CSS**, and **React**, configured for free deployment on **Cloudflare Pages**.

## Quick Start

### 1. Start the Dev Server
```bash
npm run dev
```
Open [http://localhost:4321](http://localhost:4321) in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## How to Work With This Setup

### Adding Content
- Add Markdown (`.md`) or MDX (`.mdx`) files inside `src/content/docs/guides/` (or create new subdirectories like `src/content/docs/aerodynamics/`).
- Files automatically appear in the navigation sidebar thanks to Starlight's `autogenerate` setting.

### Adding Interactive React Components
1. Create your component in `src/components/MyTool.tsx` using React and Tailwind CSS.
2. In any `.mdx` file, import and use it:
   ```mdx
   import MyTool from '../../../components/MyTool';

   <MyTool client:load />
   ```
   *(Tip: Add the `not-content` class to your component's root wrapper to prevent Starlight's prose typography styles from overriding your Tailwind UI styles).*

---

## Cloudflare Pages Deployment (100% Free)

1. Commit and push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure tooling"
   git push origin main
   ```
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select `Masmith530/collective_knowledge`.
   - Preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
3. Click **Save and Deploy**.
