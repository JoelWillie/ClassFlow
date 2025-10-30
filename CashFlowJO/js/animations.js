const Animations = (function() {
    
    function celebrateCompletion(element) {
        element.classList.add('celebrate');
        setTimeout(() => {
            element.classList.remove('celebrate');
        }, 600);
        
        createConfetti(element);
    }

    function createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
        
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = rect.left + rect.width / 2 + 'px';
            confetti.style.top = rect.top + rect.height / 2 + 'px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            
            const angle = (Math.PI * 2 * i) / 15;
            const velocity = 50 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity - 100;
            
            document.body.appendChild(confetti);
            
            animateConfetti(confetti, vx, vy);
        }
    }

    function animateConfetti(element, vx, vy) {
        let x = 0;
        let y = 0;
        let opacity = 1;
        let rotation = 0;
        const gravity = 3;
        
        function update() {
            x += vx * 0.1;
            y += vy * 0.1;
            vy += gravity;
            rotation += 10;
            opacity -= 0.02;
            
            element.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
            element.style.opacity = opacity;
            
            if (opacity > 0) {
                requestAnimationFrame(update);
            } else {
                element.remove();
            }
        }
        
        requestAnimationFrame(update);
    }

    function shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }

    function pulseElement(element) {
        element.style.animation = 'pulse 0.6s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    function rippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple-effect');
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    function addRippleStyles() {
        if (document.getElementById('ripple-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function initRippleButtons() {
        addRippleStyles();
        
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn, .card-btn, .nav-btn');
            if (button && button.style.position !== 'relative') {
                button.style.position = 'relative';
                button.style.overflow = 'hidden';
            }
        });
    }

    function fadeOutAndRemove(element, callback) {
        element.style.transition = 'all 0.3s ease-out';
        element.style.opacity = '0';
        element.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            element.remove();
            if (callback) callback();
        }, 300);
    }

    function slideInElement(element, direction = 'bottom') {
        const animations = {
            top: 'slideInFromTop',
            bottom: 'slideInFromBottom',
            left: 'slideInFromLeft',
            right: 'slideInFromRight'
        };
        
        element.style.animation = `${animations[direction]} 0.4s ease-out`;
    }

    function addLoadingAnimation(element) {
        element.classList.add('loading');
    }

    function removeLoadingAnimation(element) {
        element.classList.remove('loading');
    }

    function smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function createToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: notification-slide 0.4s ease-out;
            font-weight: 500;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'notification-slide 0.4s ease-out reverse';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    function highlightElement(element, duration = 2000) {
        const originalBackground = element.style.background;
        element.style.transition = 'background 0.3s ease';
        element.style.background = 'rgba(59, 130, 246, 0.1)';
        
        setTimeout(() => {
            element.style.background = originalBackground;
        }, duration);
    }

    function bounceElement(element) {
        element.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    function countUp(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }

    function morphElement(element, targetClass) {
        element.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        element.classList.add(targetClass);
    }

    function init() {
        initRippleButtons();
        
        document.querySelectorAll('[data-animate]').forEach(el => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const animation = el.getAttribute('data-animate');
                        el.style.animation = `${animation} 0.6s ease-out`;
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(el);
        });
    }

    return {
        celebrateCompletion,
        shakeElement,
        pulseElement,
        rippleEffect,
        fadeOutAndRemove,
        slideInElement,
        addLoadingAnimation,
        removeLoadingAnimation,
        smoothScrollTo,
        createToast,
        highlightElement,
        bounceElement,
        countUp,
        morphElement,
        init
    };
})();
