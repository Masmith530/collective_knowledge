# Collective Knowledge

A free educational resource site for students — lessons, guides, and study materials with no paywalls.

**Live site:** after setup, your site will be at one of:
- `https://<username>.github.io/collective_knowledge/` (project site)
- `https://<username>.github.io/` (if the repo is named `<username>.github.io`)

## Local preview

Open `index.html` in a browser, or run a local server:

```bash
cd collective_knowledge
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Project structure

```
collective_knowledge/
├── index.html          # Home page
├── 404.html            # Custom not-found page
├── css/styles.css      # Shared styles
├── js/main.js          # Mobile nav + footer year
├── assets/             # Images, favicon, etc.
└── resources/          # Lessons and guides go here
    └── index.html      # Resource listing page
```

## Adding a new lesson

1. Create a new HTML file under `resources/` (e.g. `resources/intro-to-algebra.html`).
2. Copy the header/footer pattern from `resources/index.html`.
3. Add a link to it in the resource list on `resources/index.html`.
4. Commit and push — GitHub Pages redeploys automatically.

## Deploy to GitHub Pages

### 1. Create the repo on GitHub

Create a new repository named `collective_knowledge` (or `yourusername.github.io` for a user site).

### 2. Push this project

```bash
git remote add origin git@github.com:<username>/collective_knowledge.git
git push -u origin main
```

### 3. Enable GitHub Pages

In the repo on GitHub:

1. Go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Choose branch **main** and folder **/ (root)**
4. Save

The site will be live in a minute or two at your GitHub Pages URL.

## License

Content added later can use whatever license you choose. The site shell is yours to use freely.
