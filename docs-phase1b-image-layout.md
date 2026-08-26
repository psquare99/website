# Phase 1B — Natural Journal Image Layout

The published Journal image renderer now treats images as editorial content rather than full-width banners.

## Behavior

- Preserves the source image's aspect ratio.
- Centers images by default.
- Allows landscape images to use the article width without forcing portrait images to do the same.
- Caps desktop image height at 75vh so very tall screenshots remain visually contained.
- Lets mobile images use the full article width.
- Keeps the existing float classes available for future editorial alignment controls.
- Keeps image presentation separate from the media/storage implementation.

## Toolbox decision

No new image-processing dependency was introduced for this presentation fix. Optimization/transformation can be added later at the delivery layer (for example through Cloudflare) without coupling the website renderer to storage internals.
