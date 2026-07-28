# gigi-static

The Gigi Pizzeria **static marketing site** — plain HTML/CSS/images, no build step.
Split out of the original `gigipizza` repo to live within the Runtime Module
Composition boundaries (host / static / slices as separate deployables).

Contents: `index.html`, `menu.html`, `css/`, `images/`, `favicon.ico`.

## Deploy

Deploys as static assets (e.g. Cloudflare Pages) at the site's primary origin.
The host (`gigi-host`) and ordering slice (`gigi-ordering`) deploy separately;
link to `/ordering` for online ordering once the host is wired to the domain.

## Note

This is a **copy** of the marketing files from the legacy `gigipizza` repo. That
repo also still holds the online-ordering design docs, the Cloudflare backend
plan, and `db/seed/menu.seed.json`. Retire `gigipizza` only after gigi-static /
gigi-host / gigi-ordering are verified and deployed.
