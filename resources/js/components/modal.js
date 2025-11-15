/**
 * Alpine.js Modal Component
 * Reusable modal/dialog functionality
 */

import Alpine from 'alpinejs';

Alpine.data('modal', (initialOpen = false) => ({
  open: initialOpen,

  show() {
    this.open = true;
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  },

  hide() {
    this.open = false;
    // Restore body scroll
    document.body.style.overflow = '';
  },

  // Close on escape key
  handleEscape(event) {
    if (event.key === 'Escape') {
      this.hide();
    }
  },

  // Close on backdrop click
  handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      this.hide();
    }
  }
}));
