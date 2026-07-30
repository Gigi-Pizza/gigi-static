# Gigi menu icons

This folder contains one lightweight, transparent SVG icon for every item in
`db/seed/menu.seed.json` (37 total). The icons use the Gigi logo's crimson,
gold, and cream palette and are designed to remain clear at 64–80 px. Pizza,
sub, and poutine shapes are based on reference photos of Gigi's actual food:
browned cheese and a substantial crust, open toasted subs with lettuce and
tomato, and plate-served poutine with abundant gravy and cheese curds.

`manifest.json` maps each stable seed `itemId` to its public image path. Icon
filenames use the same ID:

```text
PEP005.svg
```

Example:

```js
const icon = menuIconManifest[item.itemId];

return `<img src="${icon.src}" alt="" width="72" height="72">`;
```

The empty `alt` is intentional when the adjacent menu-item name already labels
the choice. Regenerate the set after changing the icon definitions with:

```sh
node scripts/generate-menu-icons.mjs
```

## Photo-based alternatives

The `photo/` directory contains 28 transparent 512×512 PNG icons generated from
Gigi's real food photography: 15 pizzas, nine submarines, and four potato sides.
Its own `manifest.json` maps the covered seed items to their images. The SVG set
is kept intact as a lightweight fallback for the full menu.
