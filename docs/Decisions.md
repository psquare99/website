# Design Decisions

---

## DD-001

### Title

Primary Typeface

### Decision

Use Geist as the primary font.

### Reason

Geist is clean, modern, highly readable and timeless.
It complements the calm and minimal philosophy of the website.

### Status

Accepted
---

## DD-002

### Title

Single Layout Container

### Decision

All pages will be wrapped inside a reusable `Container` component.

### Reason

This keeps page widths, horizontal spacing and alignment consistent across the entire website.

Changing the layout width requires editing only one component.

### Status

Accepted
## DD-003

### Title

Minimal Navigation

### Decision

The navigation bar will contain only the essential links.

Additional actions such as theme switching,
social icons and search will be introduced only
when they serve a clear purpose.

### Status

Accepted
## DD-004

### Title

Experience Before Features

### Decision

Every design decision should prioritize calmness, clarity and authenticity over visual spectacle.

The website should feel like an invitation rather than a presentation.

### Guiding Philosophy

Come in.

This is what I'm building.

Stay awhile if you'd like.

### Status

Accepted
### Title

Local Containers

### Decision

Each layout section (Navbar, Footer, Page) is responsible for its own container.

### Reason

Different sections may require different widths in the future while remaining internally consistent.

### Status

Accepted
## DD-006

### Title

Content Before Decoration

### Decision

Every section should communicate something meaningful before adding visual enhancements.

Illustrations, animations, and decorative elements should support the content rather than replace it.

### Status

Accepted
## DD-007

### Title

Earn Attention

### Decision

The website should never ask visitors to read more than necessary.

Each section should communicate its message with as few words as possible.

If visitors are curious, they will naturally explore further.

### Status

Accepted
## DD-008

### Title

Typography as Identity

### Decision

The primary brand mark will initially be a typographic wordmark.

The navigation will use a plain "P²" set in Geist.

A graphical logo may be introduced later only if it meaningfully strengthens the identity.

### Status

Accepted
DD-009 — Content Can Lead Somewhere

Informational items may optionally link to deeper content.

Navigation should emerge naturally from the content rather than relying solely on menus.

Navigation is defined by content, not components.

Any piece of content may optionally expose a destination through href. Components should render links only when content declares one.
## DD-010 — Thread-Based Navigation

The homepage is composed of threads rather than status items.

Each thread represents a meaningful aspect of life and may optionally lead to deeper content.

Visitors explore the website by following whichever thread interests them.

Content defines navigation.
Navigation does not define content.