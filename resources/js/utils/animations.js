/**
 * Animation Utilities
 * Smooth transitions and micro-interactions
 */

import Alpine from 'alpinejs';

/**
 * Fade In Animation
 */
Alpine.directive('fade-in', (el, { expression, modifiers }, { evaluateLater, effect }) => {
    const duration = modifiers.find(m => !isNaN(m)) || 300;
    const delay = modifiers.includes('delay') ? 150 : 0;

    if (modifiers.includes('once')) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        el.style.transition = `opacity ${duration}ms ease-in-out`;
                        el.style.opacity = '1';
                    }, delay);
                    observer.disconnect();
                }
            });
        });

        el.style.opacity = '0';
        observer.observe(el);
    } else {
        el.style.transition = `opacity ${duration}ms ease-in-out`;
        setTimeout(() => {
            el.style.opacity = '1';
        }, delay);
    }
});

/**
 * Slide In Animation
 */
Alpine.directive('slide-in', (el, { expression, modifiers }) => {
    const direction = modifiers.find(m => ['left', 'right', 'up', 'down'].includes(m)) || 'up';
    const duration = modifiers.find(m => !isNaN(m)) || 300;
    const delay = modifiers.includes('delay') ? 150 : 0;

    const transforms = {
        up: 'translateY(20px)',
        down: 'translateY(-20px)',
        left: 'translateX(20px)',
        right: 'translateX(-20px)'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    el.style.transition = `all ${duration}ms ease-out`;
                    el.style.transform = 'translate(0, 0)';
                    el.style.opacity = '1';
                }, delay);

                if (modifiers.includes('once')) {
                    observer.disconnect();
                }
            } else if (!modifiers.includes('once')) {
                el.style.transform = transforms[direction];
                el.style.opacity = '0';
            }
        });
    });

    el.style.transform = transforms[direction];
    el.style.opacity = '0';
    observer.observe(el);
});

/**
 * Scale Animation
 */
Alpine.directive('scale-in', (el, { modifiers }) => {
    const duration = modifiers.find(m => !isNaN(m)) || 200;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                el.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
                el.style.transform = 'scale(1)';

                if (modifiers.includes('once')) {
                    observer.disconnect();
                }
            } else if (!modifiers.includes('once')) {
                el.style.transform = 'scale(0.95)';
            }
        });
    });

    el.style.transform = 'scale(0.95)';
    observer.observe(el);
});

/**
 * Hover Lift Effect
 */
Alpine.directive('hover-lift', (el) => {
    el.style.transition = 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0.4, 0, 0.2, 1)';

    el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
    });

    el.addEventListener('mouseleave', () => {
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '';
    });
});

/**
 * Stagger Children Animation
 */
Alpine.directive('stagger', (el, { expression }) => {
    const delay = expression || 50;
    const children = el.children;

    Array.from(children).forEach((child, index) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(10px)';
        child.style.transition = 'all 300ms ease-out';

        setTimeout(() => {
            child.style.opacity = '1';
            child.style.transform = 'translateY(0)';
        }, index * parseInt(delay));
    });
});

/**
 * Ripple Effect on Click
 */
Alpine.directive('ripple', (el) => {
    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    el.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 600ms ease-out;
            pointer-events: none;
        `;

        el.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * Smooth Scroll Animation
 */
Alpine.magic('smoothScroll', () => {
    return (selector, options = {}) => {
        const element = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: options.block || 'start',
                inline: options.inline || 'nearest'
            });
        }
    };
});

/**
 * Auto-animate (inspired by AutoAnimate)
 */
Alpine.directive('auto-animate', (el) => {
    let prevChildren = Array.from(el.children);

    const observer = new MutationObserver(() => {
        const currentChildren = Array.from(el.children);

        // Detect new children
        currentChildren.forEach((child, index) => {
            if (!prevChildren.includes(child)) {
                child.style.animation = 'fadeInScale 300ms ease-out';
            }
        });

        prevChildren = currentChildren;
    });

    observer.observe(el, { childList: true });
});

// Add auto-animate CSS
const autoAnimateStyle = document.createElement('style');
autoAnimateStyle.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(autoAnimateStyle);

export default Alpine;
