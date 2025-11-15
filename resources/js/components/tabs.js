/**
 * Alpine.js Tabs Component
 * Reusable tabbed interface functionality
 */

import Alpine from 'alpinejs';

Alpine.data('tabs', (initialTab = 0) => ({
  activeTab: initialTab,

  setTab(index) {
    this.activeTab = index;
  },

  isActive(index) {
    return this.activeTab === index;
  }
}));
