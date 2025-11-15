/**
 * Main JavaScript Entry Point
 * Alpine.js and custom JavaScript setup
 */

import Alpine from 'alpinejs';

// Import Alpine.js components
import './components/dropdown';
import './components/modal';
import './components/tabs';

// Import utilities
import './utils/helpers';

// Initialize Alpine.js
window.Alpine = Alpine;
Alpine.start();

// Log initialization
console.log('LCOJ Modern UI initialized with Alpine.js', Alpine.version);
