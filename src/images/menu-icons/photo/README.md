# Photo-based Gigi menu icons

This folder contains 28 transparent 512×512 PNG menu icons: 15 pizzas, nine
submarines, and four potato sides (fries, fries with sauce, poutine, and
Italian poutine). The images were generated individually using Gigi's real food
photographs as visual references.

Pizza variants share the same camera angle, thick golden crust, heavy mozzarella
coverage, and dark broiled-cheese texture. The submarine icons follow Gigi's
open-faced toasted presentation with shredded lettuce and tomato. The current
poutine image is retained as the working version until a better reference photo
is supplied.

`manifest.json` maps each included stable `itemId` to its public image path.
Icon filenames use the same ID. For example:

```js
const src = photoMenuManifest[item.itemId];
```

Use an empty `alt` attribute when the adjacent menu-item name already labels the
image. The existing SVG icons remain available one directory above as a
lighter-weight fallback for all menu items.
