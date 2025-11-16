/**
 * Modern Select Component (Select2 replacement)
 * Powered by Alpine.js
 */

import Alpine from 'alpinejs';

Alpine.data('modernSelect', (config = {}) => ({
    // State
    open: false,
    search: '',
    selected: config.multiple ? (config.value || []) : (config.value || null),
    options: config.options || [],
    loading: false,
    focused: false,

    // Configuration
    placeholder: config.placeholder || 'Select an option...',
    searchPlaceholder: config.searchPlaceholder || 'Search...',
    multiple: config.multiple || false,
    closeOnSelect: config.closeOnSelect !== false,
    ajax: config.ajax || null,
    minimumInputLength: config.minimumInputLength || 0,
    allowClear: config.allowClear !== false,
    disabled: config.disabled || false,

    // Callbacks
    onChange: config.onChange || null,
    onOpen: config.onOpen || null,
    onClose: config.onClose || null,

    // Lifecycle
    init() {
        // Load initial options
        if (this.ajax && !this.options.length) {
            this.loadOptions();
        }

        // Listen for external changes
        this.$watch('selected', (value) => {
            this.onChange && this.onChange(value);
            this.$dispatch('select-change', { value });
        });

        // Click outside to close
        this.$el.addEventListener('click-outside', () => {
            if (this.open) {
                this.close();
            }
        });
    },

    // Computed properties
    get filteredOptions() {
        if (!this.search || this.search.length < this.minimumInputLength) {
            return this.options;
        }

        const searchLower = this.search.toLowerCase();
        return this.options.filter(option => {
            const text = this.getOptionText(option).toLowerCase();
            return text.includes(searchLower);
        });
    },

    get selectedText() {
        if (this.multiple) {
            const count = this.selected.length;
            if (count === 0) return this.placeholder;
            if (count === 1) {
                const option = this.findOption(this.selected[0]);
                return this.getOptionText(option);
            }
            return `${count} selected`;
        }

        if (!this.selected) return this.placeholder;

        const option = this.findOption(this.selected);
        return option ? this.getOptionText(option) : this.placeholder;
    },

    get hasSelection() {
        if (this.multiple) {
            return this.selected.length > 0;
        }
        return this.selected !== null && this.selected !== '';
    },

    // Methods
    toggle() {
        if (this.disabled) return;

        if (this.open) {
            this.close();
        } else {
            this.openDropdown();
        }
    },

    openDropdown() {
        if (this.disabled) return;

        this.open = true;
        this.onOpen && this.onOpen();

        // Focus search input
        this.$nextTick(() => {
            const searchInput = this.$el.querySelector('[data-search-input]');
            if (searchInput) {
                searchInput.focus();
            }
        });
    },

    close() {
        this.open = false;
        this.search = '';
        this.onClose && this.onClose();
    },

    select(option) {
        const value = this.getOptionValue(option);

        if (this.multiple) {
            const index = this.selected.indexOf(value);
            if (index > -1) {
                this.selected.splice(index, 1);
            } else {
                this.selected.push(value);
            }
        } else {
            this.selected = value;
            if (this.closeOnSelect) {
                this.close();
            }
        }
    },

    clear() {
        if (this.multiple) {
            this.selected = [];
        } else {
            this.selected = null;
        }
    },

    isSelected(option) {
        const value = this.getOptionValue(option);

        if (this.multiple) {
            return this.selected.includes(value);
        }

        return this.selected === value;
    },

    async loadOptions(searchTerm = '') {
        if (!this.ajax) return;

        this.loading = true;

        try {
            const url = typeof this.ajax.url === 'function'
                ? this.ajax.url(searchTerm)
                : this.ajax.url;

            const params = new URLSearchParams({
                ...(this.ajax.data || {}),
                ...(searchTerm ? { q: searchTerm } : {})
            });

            const response = await fetch(`${url}?${params}`);
            const data = await response.json();

            this.options = this.ajax.processResults
                ? this.ajax.processResults(data)
                : (data.results || data);
        } catch (error) {
            console.error('Failed to load options:', error);
        } finally {
            this.loading = false;
        }
    },

    async onSearchInput() {
        if (this.ajax && this.search.length >= this.minimumInputLength) {
            await this.loadOptions(this.search);
        }
    },

    // Helper methods
    findOption(value) {
        return this.options.find(option => this.getOptionValue(option) === value);
    },

    getOptionValue(option) {
        if (!option) return null;
        return option.id !== undefined ? option.id : option.value !== undefined ? option.value : option;
    },

    getOptionText(option) {
        if (!option) return '';
        return option.text || option.name || option.label || option.toString();
    },

    getOptionHtml(option) {
        if (this.ajax && this.ajax.templateResult) {
            return this.ajax.templateResult(option);
        }
        return this.getOptionText(option);
    },

    // Keyboard navigation
    onKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                this.close();
                break;
            case 'Enter':
                if (!this.open) {
                    this.openDropdown();
                }
                break;
            case 'ArrowDown':
                if (!this.open) {
                    this.openDropdown();
                }
                event.preventDefault();
                break;
            case 'ArrowUp':
                event.preventDefault();
                break;
        }
    }
}));

// Export for use in templates
export default Alpine;
