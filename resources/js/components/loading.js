/**
 * Loading States Component
 * Skeleton screens, spinners, and loading indicators
 */

import Alpine from 'alpinejs';

/**
 * Loading Spinner Component
 */
Alpine.data('spinner', (config = {}) => ({
    size: config.size || 'md', // sm, md, lg
    color: config.color || 'primary',
    fullscreen: config.fullscreen || false,

    get sizeClasses() {
        const sizes = {
            sm: 'w-4 h-4',
            md: 'w-8 h-8',
            lg: 'w-12 h-12',
            xl: 'w-16 h-16'
        };
        return sizes[this.size] || sizes.md;
    },

    get colorClasses() {
        const colors = {
            primary: 'text-primary-600',
            white: 'text-white',
            gray: 'text-gray-600',
            success: 'text-success-600',
            error: 'text-error-600'
        };
        return colors[this.color] || colors.primary;
    }
}));

/**
 * Skeleton Screen Component
 */
Alpine.data('skeleton', (config = {}) => ({
    lines: config.lines || 3,
    avatar: config.avatar || false,
    animate: config.animate !== false,

    get animateClasses() {
        return this.animate ? 'animate-pulse' : '';
    }
}));

/**
 * Loading Overlay Component
 */
Alpine.data('loadingOverlay', (config = {}) => ({
    visible: config.visible || false,
    message: config.message || 'Loading...',
    cancelable: config.cancelable || false,
    onCancel: config.onCancel || null,

    show(message = null) {
        if (message) this.message = message;
        this.visible = true;
    },

    hide() {
        this.visible = false;
    },

    cancel() {
        if (this.cancelable && this.onCancel) {
            this.onCancel();
        }
        this.hide();
    }
}));

/**
 * Progress Bar Component
 */
Alpine.data('progressBar', (config = {}) => ({
    progress: config.progress || 0,
    indeterminate: config.indeterminate || false,
    color: config.color || 'primary',
    size: config.size || 'md',

    get progressStyle() {
        return {
            width: `${Math.min(100, Math.max(0, this.progress))}%`
        };
    },

    get colorClasses() {
        const colors = {
            primary: 'bg-primary-600',
            success: 'bg-success-600',
            error: 'bg-error-600',
            warning: 'bg-warning-600'
        };
        return colors[this.color] || colors.primary;
    },

    get sizeClasses() {
        const sizes = {
            sm: 'h-1',
            md: 'h-2',
            lg: 'h-3'
        };
        return sizes[this.size] || sizes.md;
    },

    setProgress(value) {
        this.progress = value;
    },

    reset() {
        this.progress = 0;
    },

    complete() {
        this.progress = 100;
    }
}));

/**
 * Lazy Load Component
 */
Alpine.data('lazyLoad', (config = {}) => ({
    loaded: false,
    loading: false,
    error: false,
    src: config.src || '',
    threshold: config.threshold || 0.1,
    rootMargin: config.rootMargin || '50px',

    init() {
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.loaded && !this.loading) {
                        this.load();
                    }
                });
            },
            {
                threshold: this.threshold,
                rootMargin: this.rootMargin
            }
        );

        this.observer.observe(this.$el);
    },

    async load() {
        if (this.loading || this.loaded) return;

        this.loading = true;
        this.error = false;

        try {
            // For images
            if (this.$el.tagName === 'IMG') {
                await this.loadImage(this.src);
                this.$el.src = this.src;
            }
            // For other content
            else if (config.loader) {
                const content = await config.loader();
                this.$el.innerHTML = content;
            }

            this.loaded = true;
        } catch (err) {
            console.error('Lazy load failed:', err);
            this.error = true;
        } finally {
            this.loading = false;
        }
    },

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = src;
        });
    },

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}));

/**
 * Loading State Manager
 */
Alpine.data('loadingState', (config = {}) => ({
    states: {
        idle: 'idle',
        loading: 'loading',
        success: 'success',
        error: 'error'
    },
    currentState: config.initialState || 'idle',
    errorMessage: '',
    successMessage: '',

    get isIdle() {
        return this.currentState === this.states.idle;
    },

    get isLoading() {
        return this.currentState === this.states.loading;
    },

    get isSuccess() {
        return this.currentState === this.states.success;
    },

    get isError() {
        return this.currentState === this.states.error;
    },

    setIdle() {
        this.currentState = this.states.idle;
        this.errorMessage = '';
        this.successMessage = '';
    },

    setLoading() {
        this.currentState = this.states.loading;
        this.errorMessage = '';
        this.successMessage = '';
    },

    setSuccess(message = '') {
        this.currentState = this.states.success;
        this.successMessage = message;
        this.errorMessage = '';
    },

    setError(message = '') {
        this.currentState = this.states.error;
        this.errorMessage = message;
        this.successMessage = '';
    },

    async execute(asyncFunction) {
        this.setLoading();

        try {
            const result = await asyncFunction();
            this.setSuccess();
            return result;
        } catch (error) {
            this.setError(error.message || 'An error occurred');
            throw error;
        }
    }
}));

export default Alpine;
