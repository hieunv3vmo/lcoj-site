# Vite + Tailwind CSS v4 + Alpine.js Setup

This document describes the modern frontend build pipeline for LCOJ.

## Technology Stack

- **Vite 6.0.7**: Modern build tool with instant HMR
- **Tailwind CSS 4.0**: CSS framework with Oxide engine and CSS-first configuration
- **Alpine.js 3.15**: Lightweight JavaScript framework (10KB)
- **PostCSS**: CSS transformations (built into Tailwind v4)

## Directory Structure

```
resources/
├── css/
│   ├── main.css          # Main entry point, Tailwind imports
│   ├── components.css    # Custom component styles
│   └── utilities.css     # Custom utility classes
├── js/
│   ├── main.js          # JavaScript entry point
│   ├── components/      # Alpine.js components
│   │   ├── dropdown.js
│   │   ├── modal.js
│   │   └── tabs.js
│   └── utils/           # Utility functions
│       └── helpers.js
├── icons/              # Static icons
└── [existing SCSS files - will be phased out]

templates/
├── vite-assets.html    # Vite asset loading macros
└── components/         # Jinja2 component macros (Phase 3)

static/dist/            # Vite build output (generated)
├── .vite/
│   └── manifest.json
├── css/
├── js/
└── assets/
```

## Development Workflow

### Prerequisites

- Node.js 20.19+ or 22.12+ (currently using v22.21.1)
- npm 10+ (currently using v10.9.4)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Vite dev server (in one terminal):
   ```bash
   npm run dev
   ```
   This starts Vite on http://localhost:5173 with HMR

3. Start Django server (in another terminal):
   ```bash
   python manage.py runserver
   ```
   This starts Django on http://localhost:8000

4. Access the site at http://localhost:8000
   - In development mode, Django loads assets from Vite dev server
   - Changes to CSS/JS are reflected instantly via HMR

### Build for Production

```bash
npm run build
```

This creates optimized bundles in `static/dist/`:
- CSS is minified and purged of unused classes
- JavaScript is minified and tree-shaken
- Files are hashed for cache busting
- Manifest is generated for Django

### Preview Production Build

```bash
npm run preview
```

## Using Vite Assets in Templates

### Import the Vite helper

```jinja2
{% import "vite-assets.html" as vite %}
```

### Load assets in development and production

```jinja2
{# Complete setup - loads everything needed #}
{{ vite.setup() }}

{# Or load individually #}
{{ vite.vite_dev_server() }}  {# HMR client in dev mode #}
{{ vite.css('styles') }}       {# CSS bundle #}
{{ vite.js('main') }}          {# JavaScript bundle #}
```

### Development vs Production

- **Development (DEBUG=True)**:
  - Assets loaded from http://localhost:5173
  - HMR enabled for instant updates
  - No build step required

- **Production (DEBUG=False)**:
  - Assets loaded from static/dist/
  - Optimized and minified
  - Requires `npm run build` before deployment

## Tailwind CSS v4 Features

### CSS-First Configuration

Theme is defined in `resources/css/main.css` using the `@theme` directive:

```css
@theme {
  --color-primary-500: oklch(0.58 0.20 250);
  --font-sans: ui-sans-serif, system-ui, sans-serif;
}
```

No `tailwind.config.js` needed!

### Zero-Config Content Detection

Tailwind v4 automatically scans template files. No manual configuration required.

### Modern Color Palette

Uses oklch color space for more vivid colors on P3 displays.

### Built-in Features

- Container queries (native `@min-*` and `@max-*`)
- 3D transforms (rotate-x/y, scale-z, translate-z)
- Lightning CSS (integrated PostCSS)
- Dynamic utilities (e.g., `grid-cols-15`, `z-40`)

## Alpine.js Usage

### Available Components

Pre-built Alpine.js components are in `resources/js/components/`:

- **dropdown**: Dropdown menus with keyboard navigation
- **modal**: Modal dialogs with backdrop and focus trapping
- **tabs**: Tabbed interfaces

### Example Usage

```html
<!-- Dropdown -->
<div x-data="dropdown()" @click.away="close()">
  <button @click="toggle()">Menu</button>
  <div x-show="open" x-cloak>
    <!-- dropdown content -->
  </div>
</div>

<!-- Modal -->
<div x-data="modal()" @keydown.escape="handleEscape">
  <button @click="show()">Open Modal</button>
  <div x-show="open" @click="handleBackdropClick">
    <!-- modal content -->
  </div>
</div>

<!-- Tabs -->
<div x-data="tabs(0)">
  <button @click="setTab(0)" :class="{ 'active': isActive(0) }">Tab 1</button>
  <button @click="setTab(1)" :class="{ 'active': isActive(1) }">Tab 2</button>
  <div x-show="isActive(0)">Tab 1 content</div>
  <div x-show="isActive(1)">Tab 2 content</div>
</div>
```

### Global Helpers

Available as `window.lcojHelpers`:

- `debounce(func, wait)`: Debounce function calls
- `throttle(func, limit)`: Throttle function calls
- `formatDate(date, locale)`: Format dates
- `copyToClipboard(text)`: Copy text to clipboard

## Django Configuration

### Settings

Vite configuration is in `dmoj/settings.py`:

```python
VITE_DEV_MODE = DEBUG  # Auto-detect dev/prod
VITE_DEV_SERVER_URL = 'http://localhost:5173'
VITE_MANIFEST_PATH = os.path.join(BASE_DIR, 'static', 'dist', '.vite', 'manifest.json')
```

### Context Processor

`dmoj.context_processors.vite_assets` makes these available in templates:
- `VITE_DEV_MODE`
- `VITE_DEV_SERVER_URL`
- `VITE_MANIFEST`

## Troubleshooting

### Vite dev server not working

1. Check if port 5173 is available
2. Ensure `npm run dev` is running
3. Check Django DEBUG=True

### Assets not loading in production

1. Run `npm run build`
2. Check manifest exists: `static/dist/.vite/manifest.json`
3. Run `python manage.py collectstatic`

### CSS not updating

1. Restart Vite dev server
2. Clear browser cache
3. Check CSS syntax errors in terminal

### "Module not found" errors

1. Check import paths in `resources/js/main.js`
2. Ensure all component files exist
3. Run `npm install` to ensure dependencies are installed

## Next Steps

- **Phase 2**: Design System Foundation (colors, typography, spacing)
- **Phase 3**: Core Component Library (buttons, cards, forms, etc.)
- **Phase 4**: Template Redesign (modernize all pages)
- **Phase 5**: Replace jQuery with Alpine.js
- **Phase 6**: Polish & Enhancements
- **Phase 7**: Integration & Testing

## Resources

- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Alpine.js Documentation](https://alpinejs.dev/)
- [LCOJ UI Modernization Plan](./UI_MODERNIZATION_PLAN.md)
