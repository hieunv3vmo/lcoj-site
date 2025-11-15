# LCOJ Design System

**Phase 2: Comprehensive Design Foundation**

This document provides a complete reference for the LCOJ design system, including color palettes, typography, spacing, and component styles.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Shadows & Elevation](#shadows--elevation)
5. [Border Radius](#border-radius)
6. [Transitions & Animations](#transitions--animations)
7. [Component Classes](#component-classes)
8. [Usage Guidelines](#usage-guidelines)

---

## Color System

### Brand Colors

#### Primary (Blue)
Used for primary actions, links, and brand identity.

```css
--color-primary-50   → oklch(0.97 0.013 250)  /* Lightest */
--color-primary-500  → oklch(0.56 0.210 250)  /* Base */
--color-primary-600  → oklch(0.47 0.195 250)  /* Hover */
--color-primary-950  → oklch(0.16 0.045 250)  /* Darkest */
```

**Usage:**
- Primary buttons: `bg-primary-600 hover:bg-primary-700`
- Links: `text-primary-600`
- Focus rings: `ring-primary-500`

#### Accent (Purple)
Used for highlights, special features, and innovation.

```css
--color-accent-500   → oklch(0.56 0.215 300)  /* Base */
--color-accent-600   → oklch(0.47 0.195 300)  /* Hover */
```

**Usage:**
- Accent buttons: `bg-accent-600`
- Special badges: `bg-accent-100 text-accent-800`

### Semantic Colors

#### Success (Green)
Indicates positive outcomes, accepted solutions.

```css
--color-success-500  → oklch(0.60 0.195 145)
```

**Usage:**
- Accepted submissions: `badge-status-ac`
- Success alerts: `alert-success`
- Checkmarks and positive indicators

#### Warning (Orange)
Indicates caution, time limits, medium priority.

```css
--color-warning-500  → oklch(0.65 0.195 75)
```

**Usage:**
- Time limit errors: `badge-status-tle`
- Warning alerts: `alert-warning`
- Medium difficulty: `badge-difficulty-medium`

#### Error (Red)
Indicates errors, wrong answers, failures.

```css
--color-error-500    → oklch(0.58 0.205 25)
```

**Usage:**
- Wrong answer: `badge-status-wa`
- Error alerts: `alert-error`
- Hard difficulty: `badge-difficulty-hard`

#### Info (Cyan)
Indicates information, running status, neutral state.

```css
--color-info-500     → oklch(0.58 0.185 210)
```

**Usage:**
- Info alerts: `alert-info`
- Running submissions: `badge-info`

### Specialized Colors

#### Problem Difficulty

```css
--color-difficulty-easy        /* Green */
--color-difficulty-medium      /* Orange */
--color-difficulty-hard        /* Red */
```

**Usage:**
```html
<span class="badge-difficulty-easy">Easy</span>
<span class="badge-difficulty-medium">Medium</span>
<span class="badge-difficulty-hard">Hard</span>
```

#### User Ranks (Codeforces-style)

```css
--color-rank-newbie           /* Gray - < 1200 */
--color-rank-pupil            /* Green - 1200-1399 */
--color-rank-specialist       /* Cyan - 1400-1599 */
--color-rank-expert           /* Blue - 1600-1899 */
--color-rank-master           /* Purple - 1900-2199 */
--color-rank-grandmaster      /* Red - 2200-2999 */
--color-rank-legendary        /* Dark Red - 3000+ */
```

#### Submission Status

```css
--color-status-ac       /* Accepted - Green */
--color-status-wa       /* Wrong Answer - Red */
--color-status-tle      /* Time Limit - Orange */
--color-status-mle      /* Memory Limit - Blue */
--color-status-re       /* Runtime Error - Purple */
--color-status-ce       /* Compile Error - Brown */
--color-status-pending  /* Pending - Gray-Blue */
--color-status-judging  /* Judging - Yellow */
```

**Usage:**
```html
<span class="badge-status-ac">Accepted</span>
<span class="badge-status-wa">Wrong Answer</span>
<span class="badge-status-tle">Time Limit</span>
```

---

## Typography

### Font Families

```css
--font-sans: 'Inter', system-ui, ...           /* Body text */
--font-serif: Georgia, Cambria, ...            /* Rarely used */
--font-mono: 'JetBrains Mono', 'Fira Code'...  /* Code */
--font-display: 'Lexend', 'Inter'...           /* Headings */
```

### Font Sizes

Follows a modular scale for visual harmony:

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `text-xs` | 0.75rem | 12px | Tiny labels, badges |
| `text-sm` | 0.875rem | 14px | Small text, captions |
| `text-base` | 1rem | 16px | Body text (default) |
| `text-lg` | 1.125rem | 18px | Emphasized text |
| `text-xl` | 1.25rem | 20px | Small headings |
| `text-2xl` | 1.5rem | 24px | Headings |
| `text-3xl` | 1.875rem | 30px | Section titles |
| `text-4xl` | 2.25rem | 36px | Page titles |
| `text-5xl` | 3rem | 48px | Hero text |

### Font Weights

| Class | Weight | Usage |
|-------|--------|-------|
| `font-light` | 300 | Subtle text |
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasized |
| `font-semibold` | 600 | Subheadings |
| `font-bold` | 700 | Headings |

### Line Heights

| Class | Value | Usage |
|-------|-------|-------|
| `leading-tight` | 1.25 | Headings |
| `leading-snug` | 1.375 | Tight text |
| `leading-normal` | 1.5 | Body text |
| `leading-relaxed` | 1.625 | Comfortable reading |

### Letter Spacing

| Class | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | -0.025em | Large headings |
| `tracking-normal` | 0 | Body text |
| `tracking-wide` | 0.025em | Uppercase text |

---

## Spacing & Layout

### Spacing Scale

Uses rem-based spacing for consistency:

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `p-1` | 0.25rem | 4px | Minimal padding |
| `p-2` | 0.5rem | 8px | Small spacing |
| `p-3` | 0.75rem | 12px | Compact |
| `p-4` | 1rem | 16px | **Default** |
| `p-6` | 1.5rem | 24px | Comfortable |
| `p-8` | 2rem | 32px | Large spacing |
| `p-12` | 3rem | 48px | Section spacing |
| `p-16` | 4rem | 64px | Major sections |

### Container Widths

```css
--container-sm: 640px    /* Mobile landscape */
--container-md: 768px    /* Tablets */
--container-lg: 1024px   /* Desktop */
--container-xl: 1280px   /* Large desktop */
--container-2xl: 1536px  /* Extra large */
```

**Usage:**
```html
<div class="container mx-auto max-w-7xl px-4">
  <!-- Content -->
</div>
```

---

## Shadows & Elevation

### Shadow Scale

Creates depth and hierarchy:

| Class | Usage |
|-------|-------|
| `shadow-xs` | Minimal elevation |
| `shadow-sm` | Subtle lift |
| `shadow-md` | **Default card** |
| `shadow-lg` | Hover states |
| `shadow-xl` | Modals, dropdowns |
| `shadow-2xl` | Maximum elevation |

### Colored Shadows

For emphasis on interactive elements:

```css
--shadow-primary  /* Blue glow */
--shadow-success  /* Green glow */
--shadow-error    /* Red glow */
```

---

## Border Radius

### Radius Scale

| Class | Size | Pixels | Usage |
|-------|------|--------|-------|
| `rounded-sm` | 0.125rem | 2px | Minimal |
| `rounded` | 0.25rem | 4px | **Default** |
| `rounded-md` | 0.375rem | 6px | Cards |
| `rounded-lg` | 0.5rem | 8px | Buttons |
| `rounded-xl` | 0.75rem | 12px | Large cards |
| `rounded-2xl` | 1rem | 16px | Hero sections |
| `rounded-full` | 9999px | Circle | Badges, avatars |

---

## Transitions & Animations

### Duration

| Class | Duration | Usage |
|-------|----------|-------|
| `duration-75` | 75ms | Instant feedback |
| `duration-150` | 150ms | **Fast** (default) |
| `duration-200` | 200ms | **Base** |
| `duration-300` | 300ms | **Slow** |
| `duration-500` | 500ms | Dramatic |

### Easing Functions

| Easing | Usage |
|--------|-------|
| `ease-linear` | Constant speed |
| `ease-in` | Accelerate |
| `ease-out` | Decelerate |
| `ease-in-out` | **Default** smooth |

### Common Transitions

```html
<!-- Color transitions -->
<a class="transition-colors duration-200 hover:text-primary-600">

<!-- All properties -->
<button class="transition-all duration-300 hover:shadow-lg">

<!-- Transform -->
<div class="transition-transform duration-200 hover:scale-105">
```

---

## Component Classes

### Buttons

```html
<!-- Primary button -->
<button class="btn btn-primary">Submit</button>

<!-- Outline button -->
<button class="btn btn-outline">Cancel</button>

<!-- Ghost button -->
<button class="btn btn-ghost">Learn More</button>

<!-- Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>

<!-- States -->
<button class="btn btn-primary" disabled>Disabled</button>
```

### Cards

```html
<!-- Basic card -->
<div class="card">
  <h3 class="card-title">Problem Title</h3>
  <p class="card-subtitle">Easy • 1000 points</p>
</div>

<!-- Interactive card -->
<div class="card card-interactive">
  <!-- Hover effect -->
</div>

<!-- Bordered card -->
<div class="card card-bordered">
  <!-- Content -->
</div>
```

### Forms

```html
<!-- Input with label -->
<label class="label">Email</label>
<input type="email" class="input" placeholder="you@example.com">
<p class="form-help">We'll never share your email</p>

<!-- Error state -->
<input type="text" class="input input-error">
<p class="form-error">This field is required</p>

<!-- Checkbox -->
<input type="checkbox" class="checkbox">

<!-- Select -->
<select class="select">
  <option>Choose...</option>
</select>
```

### Badges

```html
<!-- Semantic badges -->
<span class="badge-success">Accepted</span>
<span class="badge-error">Error</span>
<span class="badge-warning">Warning</span>

<!-- Difficulty badges -->
<span class="badge-difficulty-easy">Easy</span>
<span class="badge-difficulty-medium">Medium</span>
<span class="badge-difficulty-hard">Hard</span>

<!-- Status badges -->
<span class="badge-status-ac">AC</span>
<span class="badge-status-wa">WA</span>
<span class="badge-status-tle">TLE</span>
```

### Alerts

```html
<div class="alert alert-success">
  <div class="alert-title">Success!</div>
  <div class="alert-description">Your solution was accepted.</div>
</div>

<div class="alert alert-error">
  <div class="alert-title">Error</div>
  <div class="alert-description">Something went wrong.</div>
</div>
```

### Tables

```html
<table class="table">
  <thead>
    <tr>
      <th>Problem</th>
      <th>Difficulty</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Two Sum</td>
      <td><span class="badge-difficulty-easy">Easy</span></td>
      <td><span class="badge-status-ac">Accepted</span></td>
    </tr>
  </tbody>
</table>

<!-- Striped table -->
<table class="table table-striped">
  <!-- ... -->
</table>
```

### Loading States

```html
<!-- Spinner -->
<div class="spinner"></div>

<!-- Skeleton -->
<div class="skeleton-title"></div>
<div class="skeleton-text"></div>
<div class="skeleton-text"></div>
```

### Tabs

```html
<div class="tabs">
  <button class="tab active">Description</button>
  <button class="tab">Submissions</button>
  <button class="tab">Editorial</button>
</div>
```

### Modals

```html
<!-- Modal backdrop -->
<div class="modal-backdrop"></div>

<!-- Modal -->
<div class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Confirm Action</h2>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to proceed?</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Progress Bars

```html
<div class="progress">
  <div class="progress-bar" style="width: 75%"></div>
</div>

<!-- Colored progress -->
<div class="progress">
  <div class="progress-bar progress-bar-success" style="width: 100%"></div>
</div>
```

---

## Usage Guidelines

### Color Usage

1. **Consistency**: Use the same semantic color for the same meaning
   - Success = Green (accepted, correct)
   - Error = Red (wrong, failed)
   - Warning = Orange (caution, time limit)
   - Info = Cyan (neutral, running)

2. **Contrast**: Ensure text is readable
   - Dark text on light backgrounds (900 on 50-100)
   - Light text on dark backgrounds (50-100 on 700-900)
   - Minimum contrast ratio: 4.5:1 for normal text

3. **Accessibility**: Don't rely solely on color
   - Use icons alongside colored badges
   - Provide text labels for status indicators

### Typography Best Practices

1. **Hierarchy**: Use size and weight to create clear hierarchy
   ```html
   <h1 class="text-4xl font-bold">Page Title</h1>
   <h2 class="text-2xl font-semibold">Section</h2>
   <p class="text-base leading-relaxed">Body text</p>
   ```

2. **Line Length**: Keep readable line length (45-75 characters)
   ```html
   <div class="max-w-2xl">
     <p>Comfortably readable paragraph...</p>
   </div>
   ```

3. **Spacing**: Add breathing room between sections
   ```html
   <section class="space-y-6">
     <!-- Content with consistent vertical spacing -->
   </section>
   ```

### Responsive Design

Use Tailwind's responsive prefixes:

```html
<!-- Mobile-first approach -->
<div class="text-base md:text-lg lg:text-xl">
  Scales with screen size
</div>

<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8">
  Comfortable spacing on all devices
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

### Dark Mode

Colors automatically adjust in dark mode via `@media (prefers-color-scheme: dark)`.

To manually toggle dark mode:
```html
<html class="dark">
  <!-- Dark mode activated -->
</html>
```

---

## Quick Reference

### Common Patterns

**Card with badge:**
```html
<div class="card">
  <div class="flex items-center justify-between mb-4">
    <h3 class="card-title">Two Sum</h3>
    <span class="badge-difficulty-easy">Easy</span>
  </div>
  <p class="text-gray-600">Find two numbers that add up to target.</p>
</div>
```

**Button group:**
```html
<div class="flex gap-2">
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-outline">Cancel</button>
</div>
```

**Form with validation:**
```html
<div>
  <label class="label">Username</label>
  <input type="text" class="input input-error">
  <p class="form-error">Username is required</p>
</div>
```

---

## Resources

- **Color Contrast Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- **Tailwind CSS Docs**: [https://tailwindcss.com/](https://tailwindcss.com/)
- **OKLCH Color Space**: [oklch.com](https://oklch.com/)
- **Typography Scale**: [Type Scale](https://typescale.com/)

---

## Changelog

### Phase 2 (Current)
- ✅ Comprehensive color system with semantic colors
- ✅ Typography scale with modular sizes
- ✅ Extended spacing and layout tokens
- ✅ Shadow and elevation system
- ✅ Component class library
- ✅ Dark mode support
- ✅ Responsive design utilities

### Phase 1
- ✅ Initial Tailwind v4 setup
- ✅ Basic color palette
- ✅ Simple component styles

---

**Last Updated**: Phase 2 - Design System Foundation
**Version**: 2.0
**Maintained by**: Claude AI
