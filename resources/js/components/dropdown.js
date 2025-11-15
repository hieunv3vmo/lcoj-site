/**
 * Alpine.js Dropdown Component
 * Reusable dropdown functionality
 */

import Alpine from 'alpinejs';

Alpine.data('dropdown', () => ({
  open: false,

  toggle() {
    this.open = !this.open;
  },

  close() {
    this.open = false;
  },

  // Close on escape key
  handleEscape(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}));
