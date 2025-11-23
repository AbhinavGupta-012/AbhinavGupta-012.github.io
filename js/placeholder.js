// placeholder.js - Blackhole Timeline Placeholder Animation
(function() {
  'use strict';
  
  const canvas = document.getElementById('bhpCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let centerX, centerY;
  let animationId;
  
  // Resize handler
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);
    
    centerX = rect.width / 2;
    centerY = rect.height / 2;
    
    initParticles();
  }
  
  // Particle system
  function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 8000));
    
    for (let i = 0; i < count; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: 20 + Math.random() * Math.min(centerX, centerY) * 0.6,
        speed: 0.0005 + Math.random() * 0.001,
        size: 0.5 + Math.random() * 2,
        orbitWidth: 0.8 + Math.random() * 0.4,
        hue: 270 + Math.random() * 60
      });
    }
  }
  
  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw blackhole accretion disk
    drawAccretionDisk();
    
    // Update and draw particles
    particles.forEach(particle => {
      particle.angle += particle.speed;
      
      const x = centerX + Math.cos(particle.angle) * particle.distance;
      const y = centerY + Math.sin(particle.angle) * particle.distance * particle.orbitWidth;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${particle.hue}, 70%, 65%, ${0.3 + Math.sin(particle.angle) * 0.3})`;
      ctx.fill();
      
      // Draw particle trail
      const trailLength = 5;
      for (let i = 0; i < trailLength; i++) {
        const trailX = centerX + Math.cos(particle.angle - i * 0.1) * (particle.distance - i * 2);
        const trailY = centerY + Math.sin(particle.angle - i * 0.1) * (particle.distance - i * 2) * particle.orbitWidth;
        
        ctx.beginPath();
        ctx.arc(trailX, trailY, particle.size * (1 - i/trailLength), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue}, 70%, 65%, ${0.1 * (1 - i/trailLength)})`;
        ctx.fill();
      }
    });
    
    // Draw event horizon
    drawEventHorizon();
    
    animationId = requestAnimationFrame(animate);
  }
  
  function drawAccretionDisk() {
    const gradient = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, Math.min(centerX, centerY) * 0.7);
    gradient.addColorStop(0, 'rgba(197, 112, 255, 0.1)');
    gradient.addColorStop(0.5, 'rgba(255, 76, 163, 0.05)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, Math.min(centerX, centerY) * 0.7, Math.min(centerX, centerY) * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
  
  function drawEventHorizon() {
    // Inner glow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40);
    gradient.addColorStop(0, 'rgba(25, 25, 25, 0.9)');
    gradient.addColorStop(1, 'rgba(25, 25, 25, 0)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Central black circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 10, 0.95)';
    ctx.fill();
    
    // Pulsing core
    const pulseSize = 8 + Math.sin(Date.now() * 0.005) * 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
  }
  
  // Initialize
  function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();
    
    // Projects button interaction - uses your navigation system
    const projectsBtn = document.getElementById('bhpProjectsBtn');
    if (projectsBtn) {
      projectsBtn.addEventListener('click', function() {
        // Find and click the Projects nav button using your navigation system
        const projectsNavBtn = Array.from(document.querySelectorAll('#mainNav .button'))
          .find(btn => {
            const textEl = btn.querySelector('.actual-text');
            return textEl && textEl.textContent.trim() === 'Projects';
          });
        
        if (projectsNavBtn) {
          projectsNavBtn.click();
        }
      });
    }
  }
  
  // Cleanup function
  function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', resizeCanvas);
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Export cleanup for potential use
  window.bhpCleanup = cleanup;
})();