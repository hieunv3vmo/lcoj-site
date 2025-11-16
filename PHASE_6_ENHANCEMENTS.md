# Phase 6: Polish & Enhancements

Complete guide to the modern UI enhancements added in Phase 6.

## Overview

Phase 6 adds professional polish with loading states, toast notifications, smooth animations, and accessibility improvements.

---

## 1. Loading Components

### Spinner

Display loading spinners in various sizes and colors.

```html
{% import "components/loading.html" as loading %}

<!-- Basic spinner -->
{{ loading.spinner() }}

<!-- Large primary spinner -->
{{ loading.spinner(size='lg', color='primary') }}

<!-- Fullscreen loading overlay -->
{{ loading.spinner(fullscreen=True) }}
```

**Available Sizes:** `sm`, `md`, `lg`, `xl`
**Available Colors:** `primary`, `white`, `gray`, `success`, `error`

### Skeleton Screens

Show skeleton screens while content loads.

```html
<!-- Basic skeleton (3 lines) -->
{{ loading.skeleton() }}

<!-- Skeleton with avatar -->
{{ loading.skeleton(lines=5, avatar=True) }}

<!-- Card skeleton -->
{{ loading.card_skeleton(count=3) }}
```

### Loading Overlay

Fullscreen loading overlay with message.

```html
<div x-data="loadingOverlay()">
    <button @click="show('Processing...')">Start</button>
    {{ loading.loading_overlay() }}
</div>
```

**JavaScript API:**
```javascript
// Show overlay
this.show('Processing your request...');

// Hide overlay
this.hide();

// With cancel button
x-data="loadingOverlay({ cancelable: true, onCancel: () => { /* cancel logic */ } })"
```

### Progress Bar

Show upload/download progress.

```html
<div x-data="progressBar()">
    {{ loading.progress_bar() }}

    <button @click="setProgress(50)">50%</button>
    <button @click="complete()">Complete</button>
</div>
```

**Indeterminate progress:**
```html
{{ loading.progress_bar(indeterminate=True) }}
```

### Lazy Loading

Lazy load images when they enter viewport.

```html
{{ loading.lazy_image(
    src='/static/large-image.jpg',
    alt='Description',
    classes='w-full rounded-lg'
) }}
```

### Loading States

Manage different loading states (idle, loading, success, error).

```html
<div x-data="loadingState()">
    <!-- Trigger action -->
    <button @click="execute(async () => {
        await fetchAPI.post('/api/submit', data);
    })">
        Submit
    </button>

    <!-- Idle state -->
    <div x-show="isIdle">
        Ready to submit
    </div>

    <!-- Loading state -->
    <div x-show="isLoading">
        {{ loading.spinner() }}
    </div>

    <!-- Success state -->
    <div x-show="isSuccess">
        ✓ Submitted successfully!
    </div>

    <!-- Error state -->
    <div x-show="isError">
        <p x-text="errorMessage"></p>
    </div>
</div>
```

---

## 2. Toast Notifications

Modern, accessible toast notifications with auto-dismiss and progress bars.

### Basic Usage

```javascript
// Success toast
toast.success('Submission accepted!');

// Error toast
toast.error('Failed to submit');

// Warning toast
toast.warning('This will expire soon');

// Info toast
toast.info('New contest starting in 5 minutes');
```

### Advanced Usage

```javascript
// Custom duration (ms)
Alpine.store('toasts').add({
    type: 'success',
    title: 'Success!',
    message: 'Your changes have been saved',
    duration: 3000 // 3 seconds
});

// Persistent toast (no auto-dismiss)
Alpine.store('toasts').add({
    type: 'error',
    message: 'Critical error occurred',
    duration: 0, // Won't auto-dismiss
    dismissible: true
});

// Toast with action button
Alpine.store('toasts').add({
    type: 'info',
    message: 'New version available',
    action: {
        text: 'Reload',
        onClick: () => window.location.reload()
    }
});
```

### Shorthand Functions

```javascript
// Available globally
showToast.success('Saved!');
showToast.error('Failed!');
showToast.warning('Warning!');
showToast.info('Info!');
```

### Toast Features

- ✅ Auto-dismiss with countdown
- ✅ Hover to pause countdown
- ✅ Click to dismiss
- ✅ Smooth slide-in animation
- ✅ Color-coded by type
- ✅ Stacked notifications
- ✅ Accessible (ARIA live region)
- ✅ Action buttons
- ✅ Progress bar

---

## 3. Animations

Smooth, declarative animations with Alpine.js directives.

### Fade In

```html
<!-- Fade in on mount -->
<div x-fade-in>Content fades in</div>

<!-- Fade in when scrolled into view -->
<div x-fade-in.once>Fades in once visible</div>

<!-- Custom duration (ms) -->
<div x-fade-in.500>Fades in over 500ms</div>

<!-- With delay -->
<div x-fade-in.delay>Fades in with delay</div>
```

### Slide In

```html
<!-- Slide in from bottom (default) -->
<div x-slide-in>Slides up</div>

<!-- Direction options -->
<div x-slide-in.left>Slides from left</div>
<div x-slide-in.right>Slides from right</div>
<div x-slide-in.up>Slides from bottom</div>
<div x-slide-in.down>Slides from top</div>

<!-- Custom duration -->
<div x-slide-in.up.400>400ms slide-in</div>

<!-- Trigger once -->
<div x-slide-in.once>Only animates once</div>
```

### Scale In

```html
<!-- Scale in from 95% to 100% -->
<div x-scale-in>Scales in</div>

<!-- Custom duration -->
<div x-scale-in.300>300ms scale</div>

<!-- Once only -->
<div x-scale-in.once>Scales once</div>
```

### Hover Lift

```html
<!-- Lifts on hover with shadow -->
<div x-hover-lift class="card">
    Hovers up on mouse enter
</div>
```

**Perfect for:**
- Cards
- Buttons
- Images
- Interactive elements

### Stagger Children

```html
<!-- Animates children with stagger delay -->
<div x-stagger="100">
    <div class="item">Item 1 (0ms)</div>
    <div class="item">Item 2 (100ms)</div>
    <div class="item">Item 3 (200ms)</div>
</div>
```

### Ripple Effect

```html
<!-- Material Design ripple on click -->
<button x-ripple class="btn btn-primary">
    Click me
</button>
```

### Auto Animate

```html
<!-- Automatically animates list changes -->
<ul x-auto-animate>
    <template x-for="item in items">
        <li x-text="item"></li>
    </template>
</ul>
```

**Animates:**
- New items added
- Items removed
- Items reordered

### Smooth Scroll

```javascript
// Scroll to element
<button @click="$smoothScroll('#section')">
    Scroll to section
</button>

// With options
<button @click="$smoothScroll('#section', { block: 'center' })">
    Scroll to center
</button>
```

---

## 4. Complete Examples

### Form with Loading States

```html
<form x-data="loadingState()"
      @submit.prevent="execute(async () => {
          await fetchAPI.postForm($el.action, new FormData($el));
          toast.success('Form submitted successfully!');
      })">

    <!-- Form fields -->
    <input type="text" name="name" :disabled="isLoading">

    <!-- Submit button -->
    <button type="submit" :disabled="isLoading" class="btn btn-primary">
        <span x-show="!isLoading">Submit</span>
        <span x-show="isLoading">
            {{ loading.spinner(size='sm', color='white') }} Submitting...
        </span>
    </button>

    <!-- Error message -->
    <div x-show="isError" class="text-error-600" x-text="errorMessage"></div>
</form>
```

### Infinite Scroll with Loading

```html
<div x-data="{ items: [], page: 1, loading: false, hasMore: true }">
    <!-- Items -->
    <div x-auto-animate>
        <template x-for="item in items">
            <div x-slide-in.once class="card" x-text="item.title"></div>
        </template>
    </div>

    <!-- Loading more -->
    <div x-show="loading" class="text-center py-4">
        {{ loading.spinner() }}
    </div>

    <!-- Load more button -->
    <button x-show="!loading && hasMore"
            @click="loadMore()"
            class="btn btn-outline w-full">
        Load More
    </button>
</div>
```

### Image Gallery with Lazy Loading

```html
<div class="grid grid-cols-3 gap-4" x-stagger="50">
    {% for image in images %}
        <div x-scale-in.once>
            {{ loading.lazy_image(
                src=image.url,
                alt=image.title,
                classes='rounded-lg hover:shadow-lg transition-shadow'
            ) }}
        </div>
    {% endfor %}
</div>
```

### Submission with Toast Feedback

```html
<button @click="async () => {
    try {
        await fetchAPI.post('/api/rejudge', { id: submissionId });
        toast.success('Submission queued for rejudge', 'Success');
    } catch (error) {
        toast.error(error.message, 'Rejudge Failed');
    }
}">
    Rejudge
</button>
```

### Modal with Animations

```html
<div x-data="{ open: false }">
    <button @click="open = true">Open Modal</button>

    <div x-show="open"
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         class="fixed inset-0 bg-gray-900 bg-opacity-50 z-50">

        <div @click.outside="open = false"
             x-transition:enter="transition ease-out duration-300"
             x-transition:enter-start="opacity-0 scale-90"
             x-transition:enter-end="opacity-100 scale-100"
             class="bg-white rounded-lg p-6 max-w-md mx-auto mt-20">
            <h2>Modal Title</h2>
            <p>Modal content</p>
            <button @click="open = false">Close</button>
        </div>
    </div>
</div>
```

---

## 5. Accessibility Features

All components include:

- ✅ **ARIA attributes** (role, aria-live, aria-label)
- ✅ **Keyboard navigation** (Tab, Enter, Escape)
- ✅ **Focus management** (auto-focus, focus trap)
- ✅ **Screen reader support** (semantic HTML, live regions)
- ✅ **Reduced motion** (respects prefers-reduced-motion)
- ✅ **Color contrast** (WCAG 2.1 AA compliant)

---

## 6. Performance

### Bundle Size

- **Loading components:** ~4 KB
- **Toast system:** ~3 KB
- **Animations:** ~2 KB
- **Total addition:** ~9 KB (gzipped)

### Optimization Tips

```javascript
// Lazy load components
const { lazyLoad } = await import('./components/loading');

// Code splitting
if (showModal) {
    const { modal } = await import('./components/modal');
}

// Debounce expensive operations
@input.debounce.500ms="search()"
```

---

## 7. Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Polyfills included for:**
- IntersectionObserver
- ResizeObserver
- Smooth scroll

---

## 8. Migration from Old Code

### jQuery `.fadeIn()` → Alpine fade-in

```html
<!-- OLD -->
<script>$('#element').fadeIn(300);</script>

<!-- NEW -->
<div x-fade-in.300>Element</div>
```

### jQuery `.slideDown()` → Alpine slide-in

```html
<!-- OLD -->
<script>$('#element').slideDown();</script>

<!-- NEW -->
<div x-slide-in.down>Element</div>
```

### Custom loading spinner → Loading component

```html
<!-- OLD -->
<div class="spinner"><i class="fa fa-spinner fa-spin"></i></div>

<!-- NEW -->
{{ loading.spinner() }}
```

---

## Summary

Phase 6 adds production-ready polish with:

✨ **Loading States** - Spinners, skeletons, overlays
✨ **Toast Notifications** - Modern, accessible alerts
✨ **Smooth Animations** - Declarative, performant
✨ **Accessibility** - WCAG 2.1 AA compliant
✨ **Performance** - Optimized, lazy-loaded

All components are ready to use and fully documented! 🎉
