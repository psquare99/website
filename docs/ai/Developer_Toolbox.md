# Prateek's Developer Toolbox

> A curated set of high-signal sources for discovering existing APIs, libraries, services, open-source implementations, tools, assets, and learning resources before building something from scratch.

## How We Use This

Before implementing a substantial feature, check the relevant toolbox category:

1. **Does a package/library already solve this?**
2. **Does an API or public dataset already provide the data?**
3. **Does an open-source project already implement something similar?**
4. **Is there a free developer service that removes infrastructure work?**
5. **Is there a local/self-hosted option?**
6. **Is there an established tool instead of custom code?**

### Important rule

These sources are **discovery and reference sources**, not automatic recommendations.

Before adopting anything, verify:

- Maintenance/activity
- Documentation quality
- Compatibility with the project's stack
- License
- Security/privacy implications
- API limits and pricing
- Offline/local requirements
- Long-term suitability

Prefer mature, well-maintained, boring solutions over clever but fragile ones.

---

# 1. General Discovery

## Awesome

**Repository:** https://github.com/sindresorhus/awesome

The central index for the "Awesome" ecosystem.

**Use it when:** We need to discover established tools, libraries, resources, tutorials, or curated lists for a technology or problem.

**First stop when:** We don't know what already exists.

---

# 2. APIs & Public Data

## Public APIs

**Repository:** https://github.com/public-apis/public-apis

A large catalogue of public APIs covering books, finance, weather, games, music, news, government data, geocoding, science, and many other categories.

**Use it for:**
- Curio data sources
- Website experiments
- Prototypes
- Game experiments
- Weather/location/data features
- Learning REST APIs

**Caution:** "Free" does not necessarily mean reliable, unlimited, permanent, or production-ready.

## Awesome APIs

**Repository:** https://github.com/brandonhimpfen/awesome-apis

Curated API resources and tools.

**Use it when:** Public APIs doesn't have what we need or we want broader API tooling/resources.

---

# 3. Free Developer Services

## Free for Developers

**Repository:** https://github.com/ripienaar/free-for-dev

A large catalogue of free tiers for developer services including hosting, databases, storage, monitoring, CI/CD, email, APIs, and infrastructure.

**Use it before:** Paying for infrastructure.

**Especially useful for:**
- Personal projects
- Prototypes
- MVPs
- Portfolio projects
- Small production workloads

**Caution:** Always verify current pricing and limits on the provider's official site.

---

# 4. Flutter

## Awesome Flutter

**Repository:** https://github.com/Solido/awesome-flutter

Curated Flutter libraries, plugins, tools, UI components, state management, storage, networking, animations, and other resources.

**Use it for:**
- Prime
- Curio
- Vault
- Future Flutter apps

**Check here before:** Writing a custom Flutter component or utility.

## Awesome Open Source Flutter Apps

**Repository:** https://github.com/fluttergems/awesome-open-source-flutter-apps

Collection of real open-source Flutter applications.

**Use it for:**
- Architecture reference
- UI patterns
- Feature implementation ideas
- Project structure
- Learning how mature apps solve similar problems

**Important:** Study the implementation and ideas; don't blindly copy architecture.

---

# 5. Self-Hosted & Open Source Software

## Awesome Selfhosted

**Repository:** https://github.com/awesome-selfhosted/awesome-selfhosted

Catalogue of free/open-source software that can be self-hosted.

**Useful for:**
- Personal infrastructure
- File storage
- Password management
- Notes
- RSS
- Bookmarks
- Analytics
- Dashboards
- Automation
- Media
- Monitoring
- Personal cloud services

**Use it when:** We are about to build a service that might already exist as mature open-source software.

---

# 6. Developer Services & Infrastructure

## Awesome Developer First

**Repository:** https://github.com/agamm/awesome-developer-first

Curated developer-first services covering authentication, databases, analytics, automation, CI/CD, deployment, email, search, monitoring, payments, scraping, AI, and more.

**Use it when:** A project needs infrastructure and we are considering building it ourselves.

---

# 7. Local AI & AI Development

## Awesome OpenAI Developer Tools

**Repository:** https://github.com/Sami-Uysal/awesome-open-ai-developer-tools

Collection of AI/developer tools covering local LLMs, RAG, vector databases, agent frameworks, evaluation, and observability.

**Use it for:**
- Offline AI experiments
- Local coding assistants
- RAG
- AI-powered apps
- Agent experiments
- AI developer tooling

**Important:** Treat the list as a discovery index. Verify model/tool activity, hardware requirements, licensing, and privacy before adoption.

### Local AI discovery

When evaluating offline AI, separately investigate:

- Model families
- Quantized models
- Local inference runtimes
- Coding-specialized models
- Embedding models
- Vector databases
- RAG frameworks
- Local coding agents
- IDE integrations

---

# 8. Game Development

## Godot Ecosystem

For Wayfarer and game experiments, prioritize:

- Official Godot documentation
- Godot Asset Library
- Godot GitHub repositories
- Open-source Godot games
- Kenney assets
- OpenGameArt

**Use it for:**
- Game systems
- UI
- 2D/3D mechanics
- Dialogue systems
- Inventory
- Save systems
- Animation
- Assets

**Rule:** Prefer official documentation and permissively licensed assets for anything intended for redistribution.

---

# 9. Open-Source Reference Projects

This category is intentionally broader than Flutter.

When implementing a substantial feature, search GitHub for **complete applications** that already solve a similar problem.

Examples:

- Password managers → Vault
- Personal finance → Prime
- Read-later/bookmarking → Curio
- Portfolio sites → Personal website
- Games → Wayfarer

**Why this matters:**

A mature application can reveal:

- Data models
- Folder structure
- State management
- Error handling
- Security considerations
- UX patterns
- Testing strategy
- Edge cases we might otherwise discover late

**Rule:** Reference architecture; don't blindly copy code.

---

# 10. UI, Design & Frontend Inspiration

Useful discovery sources to investigate when needed:

- Mobbin
- Dribbble
- Behance
- Awwwards
- Godly
- Land-book
- Refero
- shadcn/ui
- Radix UI
- Material Design
- Apple Human Interface Guidelines

**Use these for:** Visual reference and interaction patterns.

**Rule:** Inspiration is not implementation. Don't copy a design blindly; adapt the underlying interaction idea to the project's identity.

---

# 11. Developer Tools & Utilities

Before writing custom tooling, check whether an established tool already exists for:

- Git workflows
- CLI automation
- File synchronization
- Image optimization
- Video processing
- PDF processing
- Database inspection
- API testing
- HTTP debugging
- Code formatting
- Static analysis
- Documentation
- Project scaffolding

Examples already relevant to our workflow include:

- Git
- GitHub
- VS Code
- Android Studio
- Flutter tooling
- FFmpeg
- yt-dlp
- rclone
- Syncthing

---

# 12. How This Applies to Our Projects

## Prime

Check:

1. Awesome Flutter
2. Open-source Flutter apps
3. Public APIs
4. Free for Developers
5. Reference finance applications

Likely useful for:
- Charts
- Finance data
- UI components
- Storage
- Export/import
- Authentication
- Testing

## Curio

Check:

1. Public APIs
2. Awesome Flutter
3. Open-source Flutter apps
4. Awesome Selfhosted
5. Free for Developers

Likely useful for:
- Book metadata
- Article metadata
- Covers
- Search
- Reader functionality
- Sync
- Import/export

## Vault

Check:

1. Open-source password managers
2. Awesome Flutter
3. Security-focused repositories
4. Local/self-hosted projects

**Security rule:** Security-sensitive code gets a higher verification bar. Never introduce a dependency merely because it is popular.

## Personal Website

Check:

1. Awesome frontend/web resources
2. Open-source portfolio sites
3. Free for Developers
4. UI/design inspiration sources

Likely useful for:
- Hosting
- Analytics
- Fonts
- Components
- Accessibility
- SEO

## Wayfarer

Check:

1. Godot official resources
2. Open-source Godot projects
3. Godot Asset Library
4. Kenney
5. OpenGameArt

Likely useful for:
- Dialogue
- NPC systems
- Inventory
- Save/load
- Maps
- UI
- Art/audio placeholders

## Offline AI

Check:

1. Local AI tool lists
2. Open-source AI projects
3. Model repositories
4. Coding-agent projects
5. Local inference runtimes

Likely useful for:
- Coding assistants
- Local chat
- RAG
- Embeddings
- Offline documentation search
- AI-assisted development

---

# 13. The "Don't Reinvent It" Workflow

When we encounter a new feature:

### Step 1 — Define the actual problem

Don't start coding yet.

Example:

> "We need to extract metadata from a saved article."

### Step 2 — Search the toolbox

Check:

- APIs
- Libraries
- Open-source applications
- Developer services

### Step 3 — Find 2–3 candidates

Don't immediately pick the first result.

### Step 4 — Evaluate

Compare:

- Maintenance
- License
- Security
- Documentation
- Dependencies
- Performance
- Offline support
- Cost
- Vendor lock-in

### Step 5 — Choose the simplest viable solution

Prefer:

> Existing mature library > existing service > small custom implementation > giant custom system

### Step 6 — Build the project-specific part

Our code should focus on what makes the project **ours**.

---

# 14. Source Quality Hierarchy

When sources disagree or provide competing solutions, use this rough priority:

1. **Official documentation**
2. **Official repository**
3. **Mature, actively maintained open-source project**
4. **Well-maintained curated list**
5. **Community recommendations**
6. **Random blog/video/tutorial**

A curated list is a **map**, not the destination.

---

# 15. Maintenance Rule

This document is a living toolbox.

When we repeatedly discover a useful resource, add it.

When a resource becomes:

- abandoned
- unsafe
- irrelevant
- paid beyond usefulness
- incompatible with our stack

remove or downgrade it.

Keep the toolbox **small, current, and high-signal**.

---

# 16. Quick Reference

| Need | Check first |
|---|---|
| "Does an API already exist?" | Public APIs |
| "Is there a library for this?" | Awesome + stack-specific lists |
| "Has someone already built this?" | Open-source reference apps |
| "Can we get this for free?" | Free for Developers |
| "Can we self-host it?" | Awesome Selfhosted |
| "How should we implement this in Flutter?" | Awesome Flutter |
| "Is there a Flutter app doing this?" | Awesome Open Source Flutter Apps |
| "Can local AI do this?" | AI developer-tool lists + model repositories |
| "How should this UI work?" | Design/reference galleries |
| "Can we use an existing game system?" | Godot resources + open-source games |
| "Do we really need to build this?" | **Check everything above first.** |

---

## Guiding Principle

> **Build the unique parts. Borrow the boring parts.**
>
> Our time should go into the ideas, experience, design, and engineering decisions that make a project ours—not into rebuilding infrastructure someone else has already solved well.
