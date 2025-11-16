/**
 * Toast Notification System
 * Modern, accessible toast notifications
 */

import Alpine from 'alpinejs';

/**
 * Toast Manager (Global)
 */
Alpine.store('toasts', {
    items: [],
    counter: 0,

    add(options) {
        const id = ++this.counter;
        const toast = {
            id,
            type: options.type || 'info', // success, error, warning, info
            title: options.title || '',
            message: options.message || '',
            duration: options.duration !== undefined ? options.duration : 5000,
            dismissible: options.dismissible !== false,
            action: options.action || null,
            icon: options.icon || this.getDefaultIcon(options.type),
            timestamp: Date.now()
        };

        this.items.push(toast);

        // Auto-dismiss
        if (toast.duration > 0) {
            setTimeout(() => {
                this.remove(id);
            }, toast.duration);
        }

        return id;
    },

    remove(id) {
        const index = this.items.findIndex(t => t.id === id);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    },

    clear() {
        this.items = [];
    },

    success(message, title = 'Success') {
        return this.add({ type: 'success', message, title });
    },

    error(message, title = 'Error') {
        return this.add({ type: 'error', message, title, duration: 7000 });
    },

    warning(message, title = 'Warning') {
        return this.add({ type: 'warning', message, title });
    },

    info(message, title = 'Info') {
        return this.add({ type: 'info', message, title });
    },

    getDefaultIcon(type) {
        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>`
        };
        return icons[type] || icons.info;
    }
});

/**
 * Toast Component
 */
Alpine.data('toast', (toast) => ({
    toast,
    progress: 100,
    paused: false,
    startTime: Date.now(),
    pauseTime: 0,

    init() {
        if (this.toast.duration > 0) {
            this.startProgress();
        }
    },

    startProgress() {
        const updateProgress = () => {
            if (this.paused) return;

            const elapsed = Date.now() - this.startTime;
            const remaining = Math.max(0, this.toast.duration - elapsed);
            this.progress = (remaining / this.toast.duration) * 100;

            if (remaining > 0) {
                requestAnimationFrame(updateProgress);
            }
        };

        updateProgress();
    },

    pause() {
        this.paused = true;
        this.pauseTime = Date.now();
    },

    resume() {
        if (this.paused) {
            const pauseDuration = Date.now() - this.pauseTime;
            this.startTime += pauseDuration;
            this.paused = false;
            this.startProgress();
        }
    },

    dismiss() {
        this.$store.toasts.remove(this.toast.id);
    },

    get typeClasses() {
        const classes = {
            success: {
                bg: 'bg-success-50',
                border: 'border-success-200',
                text: 'text-success-800',
                icon: 'text-success-600',
                progress: 'bg-success-600'
            },
            error: {
                bg: 'bg-error-50',
                border: 'border-error-200',
                text: 'text-error-800',
                icon: 'text-error-600',
                progress: 'bg-error-600'
            },
            warning: {
                bg: 'bg-warning-50',
                border: 'border-warning-200',
                text: 'text-warning-800',
                icon: 'text-warning-600',
                progress: 'bg-warning-600'
            },
            info: {
                bg: 'bg-info-50',
                border: 'border-info-200',
                text: 'text-info-800',
                icon: 'text-info-600',
                progress: 'bg-info-600'
            }
        };
        return classes[this.toast.type] || classes.info;
    }
}));

// Global toast helper functions
window.toast = {
    success: (message, title) => Alpine.store('toasts').success(message, title),
    error: (message, title) => Alpine.store('toasts').error(message, title),
    warning: (message, title) => Alpine.store('toasts').warning(message, title),
    info: (message, title) => Alpine.store('toasts').info(message, title)
};

export default Alpine;
