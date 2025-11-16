/**
 * Main JavaScript Entry Point
 * Alpine.js and custom JavaScript setup
 */

// Import Alpine utilities (includes all components and initialization)
import './alpine-utils';

// Import existing components (backward compatibility)
import './components/dropdown';
import './components/modal';
import './components/tabs';
import './components/select';
import './components/loading';
import './components/toast';

// Import utilities
import './utils/helpers';
import './utils/animations';

// Log initialization
console.log('LCOJ Modern UI initialized with Alpine.js');
