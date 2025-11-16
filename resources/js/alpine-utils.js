/**
 * Alpine.js Utilities for LCOJ
 * Replaces jQuery functionality with modern Alpine.js components
 */

import Alpine from 'alpinejs';
import collapse from '@alpinejs/collapse';

// Register Alpine plugins
Alpine.plugin(collapse);

/**
 * Fetch API wrapper with CSRF token support
 */
window.fetchAPI = {
    async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    async post(url, data = {}, options = {}) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                       || getCookie('csrftoken');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'Accept': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(data),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    async postForm(url, formData, options = {}) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value
                       || getCookie('csrftoken');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    ...options.headers
                },
                body: formData,
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }
};

/**
 * Get cookie by name (for CSRF token)
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Dropdown Component (Select2 replacement)
 */
Alpine.data('dropdown', (options = {}) => ({
    open: false,
    search: '',
    selected: options.multiple ? [] : null,
    options: options.options || [],
    placeholder: options.placeholder || 'Select...',
    multiple: options.multiple || false,

    init() {
        // Load options from URL if provided
        if (options.ajax) {
            this.loadOptions(options.ajax.url);
        }
    },

    async loadOptions(url) {
        try {
            const data = await fetchAPI.get(url);
            this.options = data.results || data;
        } catch (error) {
            console.error('Failed to load options:', error);
        }
    },

    get filteredOptions() {
        if (!this.search) return this.options;

        return this.options.filter(option => {
            const text = option.text || option.name || option.toString();
            return text.toLowerCase().includes(this.search.toLowerCase());
        });
    },

    get selectedText() {
        if (this.multiple) {
            return this.selected.length > 0
                ? `${this.selected.length} selected`
                : this.placeholder;
        }

        const option = this.options.find(o => o.id === this.selected);
        return option ? (option.text || option.name) : this.placeholder;
    },

    toggle() {
        this.open = !this.open;
    },

    select(option) {
        if (this.multiple) {
            const index = this.selected.indexOf(option.id);
            if (index > -1) {
                this.selected.splice(index, 1);
            } else {
                this.selected.push(option.id);
            }
        } else {
            this.selected = option.id;
            this.open = false;
        }

        this.$dispatch('change', { value: this.selected });
    },

    isSelected(option) {
        if (this.multiple) {
            return this.selected.includes(option.id);
        }
        return this.selected === option.id;
    }
}));

/**
 * Auto-reload component for dynamic content
 */
Alpine.data('autoReload', (config = {}) => ({
    interval: config.interval || 10000,
    url: config.url || window.location.href,
    selector: config.selector || '#content',
    paused: false,
    timer: null,

    init() {
        this.startReload();

        // Pause when window is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    },

    startReload() {
        this.timer = setInterval(() => this.reload(), this.interval);
    },

    async reload() {
        if (this.paused || document.hidden) return;

        try {
            const response = await fetch(this.url + (this.url.includes('?') ? '&' : '?') + 'raw');
            const html = await response.text();

            const element = document.querySelector(this.selector);
            if (element) {
                element.innerHTML = html;
                this.$dispatch('reloaded');
            }
        } catch (error) {
            console.error('Reload failed:', error);
        }
    },

    pause() {
        this.paused = true;
    },

    resume() {
        this.paused = false;
        this.reload();
    },

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}));

/**
 * Form validation component
 */
Alpine.data('form', (config = {}) => ({
    submitting: false,
    errors: {},

    async submit(event) {
        event.preventDefault();

        if (this.submitting) return;

        this.submitting = true;
        this.errors = {};

        const formData = new FormData(event.target);

        try {
            const response = await fetchAPI.postForm(event.target.action, formData);

            if (response.success) {
                if (config.onSuccess) {
                    config.onSuccess(response);
                } else if (response.redirect) {
                    window.location.href = response.redirect;
                }
            } else {
                this.errors = response.errors || {};
            }
        } catch (error) {
            console.error('Form submission failed:', error);
            this.errors = { __all__: 'An error occurred. Please try again.' };
        } finally {
            this.submitting = false;
        }
    },

    hasError(field) {
        return !!this.errors[field];
    },

    getError(field) {
        return this.errors[field];
    }
}));

/**
 * Alert/notification component
 */
Alpine.data('alert', (config = {}) => ({
    visible: true,
    storageKey: config.storageKey || null,

    init() {
        if (this.storageKey && localStorage.getItem(this.storageKey) === 'hidden') {
            this.visible = false;
        }
    },

    dismiss() {
        this.visible = false;

        if (this.storageKey) {
            localStorage.setItem(this.storageKey, 'hidden');
        }
    }
}));

/**
 * Countdown timer component
 */
Alpine.data('countdown', (endTime) => ({
    remaining: 0,

    init() {
        this.update();
        setInterval(() => this.update(), 1000);
    },

    update() {
        const now = Math.floor(Date.now() / 1000);
        const end = typeof endTime === 'number' ? endTime : new Date(endTime).getTime() / 1000;
        this.remaining = Math.max(0, end - now);
    },

    get formatted() {
        const seconds = this.remaining;
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    get isExpired() {
        return this.remaining === 0;
    }
}));

/**
 * Filter component
 */
Alpine.data('filter', (config = {}) => ({
    filters: config.initial || {},

    apply() {
        const params = new URLSearchParams();

        for (const [key, value] of Object.entries(this.filters)) {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    params.set(key, value.join(','));
                }
            } else if (value) {
                params.set(key, value);
            }
        }

        window.location.href = `${window.location.pathname}?${params.toString()}`;
    },

    clear() {
        this.filters = {};
        this.apply();
    },

    set(key, value) {
        this.filters[key] = value;
    },

    toggle(key, value) {
        if (!this.filters[key]) {
            this.filters[key] = [];
        }

        const index = this.filters[key].indexOf(value);
        if (index > -1) {
            this.filters[key].splice(index, 1);
        } else {
            this.filters[key].push(value);
        }
    }
}));

/**
 * Infinite scroll / Load More component
 */
Alpine.data('loadMore', (config = {}) => ({
    loading: false,
    hasMore: config.hasMore || true,
    page: config.initialPage || 1,
    url: config.url,

    async load() {
        if (this.loading || !this.hasMore) return;

        this.loading = true;

        try {
            const data = await fetchAPI.get(`${this.url}?page=${this.page + 1}`);

            if (data.html) {
                const container = this.$el.querySelector('[data-container]');
                if (container) {
                    container.insertAdjacentHTML('beforeend', data.html);
                }
            }

            this.hasMore = data.has_more || false;
            this.page++;
        } catch (error) {
            console.error('Load more failed:', error);
        } finally {
            this.loading = false;
        }
    }
}));

/**
 * Local storage persistence
 */
Alpine.data('persist', (key, defaultValue = null) => ({
    value: null,

    init() {
        const stored = localStorage.getItem(key);
        this.value = stored ? JSON.parse(stored) : defaultValue;

        this.$watch('value', value => {
            localStorage.setItem(key, JSON.stringify(value));
        });
    }
}));

/**
 * Clipboard copy component
 */
Alpine.data('clipboard', () => ({
    copied: false,

    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.copied = true;

            setTimeout(() => {
                this.copied = false;
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    }
}));

// Initialize Alpine
window.Alpine = Alpine;
Alpine.start();

// Export for use in other modules
export default Alpine;
