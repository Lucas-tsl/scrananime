/**
 * 🎮 Gesture Manager - Gestion des gestes tactiles avancés
 */

class GestureManager {
    constructor() {
        this.isEnabled = true;
        this.currentGesture = null;
        
        // Configuration des gestes
        this.config = {
            swipeMinDistance: 50,
            swipeMaxTime: 300,
            pinchMinScale: 0.5,
            pinchMaxScale: 5,
            tapMaxTime: 200,
            tapMaxDistance: 10,
            doubleTapMaxTime: 400
        };
        
        // État des touches
        this.touches = new Map();
        this.lastTap = null;
        
        this.init();
    }
    
    init() {
        console.log('🎮 Gesture Manager: Initialisation');
        this.setupGestureEvents();
    }
    
    setupGestureEvents() {
        // Événements tactiles principaux
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleTouchCancel.bind(this));
        
        // Événements souris pour le développement desktop
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Empêcher le zoom natif du navigateur
        document.addEventListener('gesturestart', this.preventNativeGestures.bind(this));
        document.addEventListener('gesturechange', this.preventNativeGestures.bind(this));
        document.addEventListener('gestureend', this.preventNativeGestures.bind(this));
        
        console.log('✅ Gestes tactiles configurés');
    }
    
    handleTouchStart(e) {
        if (!this.isEnabled) return;
        
        // Enregistrer toutes les touches
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now(),
                element: e.target
            });
        });
        
        // Déterminer le type de geste
        this.detectGestureStart(e);
    }
    
    handleTouchMove(e) {
        if (!this.isEnabled || this.touches.size === 0) return;
        
        // Mettre à jour les positions
        Array.from(e.changedTouches).forEach(touch => {
            const touchData = this.touches.get(touch.identifier);
            if (touchData) {
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
            }
        });
        
        // Traiter le geste en cours
        this.processGestureMove(e);
    }
    
    handleTouchEnd(e) {
        if (!this.isEnabled) return;
        
        // Finaliser le geste
        this.processGestureEnd(e);
        
        // Nettoyer les touches terminées
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
        
        // Réinitialiser si plus de touches
        if (this.touches.size === 0) {
            this.currentGesture = null;
        }
    }
    
    handleTouchCancel(e) {
        this.touches.clear();
        this.currentGesture = null;
    }
    
    detectGestureStart(e) {
        const touchCount = this.touches.size;
        
        if (touchCount === 1) {
            this.currentGesture = 'potential_swipe_or_tap';
        } else if (touchCount === 2) {
            this.currentGesture = 'pinch';
            this.initializePinch();
        } else if (touchCount >= 3) {
            this.currentGesture = 'multi_touch';
        }
    }
    
    processGestureMove(e) {
        switch (this.currentGesture) {
            case 'potential_swipe_or_tap':
                this.processSwipe(e);
                break;
            case 'pinch':
                this.processPinch(e);
                break;
            case 'multi_touch':
                this.processMultiTouch(e);
                break;
        }
    }
    
    processGestureEnd(e) {
        switch (this.currentGesture) {
            case 'potential_swipe_or_tap':
                this.finalizeTapOrSwipe(e);
                break;
            case 'pinch':
                this.finalizePinch(e);
                break;
        }
    }
    
    processSwipe(e) {
        const touches = Array.from(this.touches.values());
        if (touches.length !== 1) return;
        
        const touch = touches[0];
        const deltaX = touch.currentX - touch.startX;
        const deltaY = touch.currentY - touch.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Si le mouvement est significatif, c'est un swipe
        if (distance > this.config.swipeMinDistance) {
            this.currentGesture = 'swipe';
            
            // Déterminer la direction
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            
            let direction;
            if (absX > absY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            this.emitGesture('swipe_move', {
                direction,
                deltaX,
                deltaY,
                distance,
                element: touch.element
            });
        }
    }
    
    finalizeTapOrSwipe(e) {
        const touches = Array.from(this.touches.values());
        if (touches.length !== 1) return;
        
        const touch = touches[0];
        const deltaX = touch.currentX - touch.startX;
        const deltaY = touch.currentY - touch.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - touch.startTime;
        
        if (this.currentGesture === 'swipe') {
            // Finaliser le swipe
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            let direction;
            
            if (absX > absY) {
                direction = deltaX > 0 ? 'right' : 'left';
            } else {
                direction = deltaY > 0 ? 'down' : 'up';
            }
            
            this.emitGesture('swipe', {
                direction,
                deltaX,
                deltaY,
                distance,
                duration,
                element: touch.element
            });
            
        } else if (distance < this.config.tapMaxDistance && duration < this.config.tapMaxTime) {
            // C'est un tap
            this.processTap(touch);
        }
    }
    
    processTap(touch) {
        const now = Date.now();
        
        if (this.lastTap && 
            (now - this.lastTap.time) < this.config.doubleTapMaxTime &&
            this.getDistance(touch, this.lastTap) < this.config.tapMaxDistance) {
            
            // Double tap
            this.emitGesture('double_tap', {
                x: touch.currentX,
                y: touch.currentY,
                element: touch.element
            });
            
            this.lastTap = null;
        } else {
            // Simple tap
            this.emitGesture('tap', {
                x: touch.currentX,
                y: touch.currentY,
                element: touch.element
            });
            
            this.lastTap = {
                x: touch.currentX,
                y: touch.currentY,
                time: now
            };
        }
    }
    
    initializePinch() {
        const touches = Array.from(this.touches.values());
        if (touches.length !== 2) return;
        
        this.pinchData = {
            initialDistance: this.getDistance(touches[0], touches[1]),
            initialScale: 1,
            centerX: (touches[0].startX + touches[1].startX) / 2,
            centerY: (touches[0].startY + touches[1].startY) / 2
        };
    }
    
    processPinch(e) {
        const touches = Array.from(this.touches.values());
        if (touches.length !== 2 || !this.pinchData) return;
        
        const currentDistance = this.getDistance(touches[0], touches[1]);
        const scale = currentDistance / this.pinchData.initialDistance;
        const centerX = (touches[0].currentX + touches[1].currentX) / 2;
        const centerY = (touches[0].currentY + touches[1].currentY) / 2;
        
        // Limiter le scale
        const clampedScale = Math.max(
            this.config.pinchMinScale,
            Math.min(this.config.pinchMaxScale, scale)
        );
        
        this.emitGesture('pinch', {
            scale: clampedScale,
            centerX,
            centerY,
            deltaScale: clampedScale - (this.lastPinchScale || 1)
        });
        
        this.lastPinchScale = clampedScale;
    }
    
    finalizePinch(e) {
        this.emitGesture('pinch_end', {
            finalScale: this.lastPinchScale || 1
        });
        
        this.pinchData = null;
        this.lastPinchScale = null;
    }
    
    processMultiTouch(e) {
        // Gestes à 3+ doigts (optionnel)
        this.emitGesture('multi_touch', {
            touchCount: this.touches.size
        });
    }
    
    getDistance(touch1, touch2) {
        const dx = touch1.currentX - touch2.currentX;
        const dy = touch1.currentY - touch2.currentY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    emitGesture(type, data) {
        const event = new CustomEvent('gesture', {
            detail: {
                type,
                data,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
        console.log('🎮 Geste détecté:', type, data);
    }
    
    // Support souris pour le développement
    handleMouseDown(e) {
        if (e.target.closest('.reader-page img') && e.button === 0) {
            this.mouseData = {
                startX: e.clientX,
                startY: e.clientY,
                startTime: Date.now(),
                element: e.target
            };
        }
    }
    
    handleMouseMove(e) {
        if (!this.mouseData) return;
        
        this.mouseData.currentX = e.clientX;
        this.mouseData.currentY = e.clientY;
    }
    
    handleMouseUp(e) {
        if (!this.mouseData) return;
        
        const deltaX = e.clientX - this.mouseData.startX;
        const deltaY = e.clientY - this.mouseData.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const duration = Date.now() - this.mouseData.startTime;
        
        if (distance < this.config.tapMaxDistance && duration < this.config.tapMaxTime) {
            this.emitGesture('tap', {
                x: e.clientX,
                y: e.clientY,
                element: this.mouseData.element
            });
        }
        
        this.mouseData = null;
    }
    
    preventNativeGestures(e) {
        e.preventDefault();
    }
    
    // API publique
    enable() {
        this.isEnabled = true;
        console.log('✅ Gestes tactiles activés');
    }
    
    disable() {
        this.isEnabled = false;
        this.touches.clear();
        this.currentGesture = null;
        console.log('❌ Gestes tactiles désactivés');
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Configuration gestes mise à jour:', this.config);
    }
}

// Initialiser le gestionnaire de gestes
let gestureManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        gestureManager = new GestureManager();
        window.gestureManager = gestureManager;
    });
} else {
    gestureManager = new GestureManager();
    window.gestureManager = gestureManager;
}
