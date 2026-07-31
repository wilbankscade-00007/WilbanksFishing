import React, { useRef, useEffect } from 'react';

// Wraps a section in a 3D plane: a gentle mouse-tracked perspective tilt.
// Uses a requestAnimationFrame easing loop so the motion is buttery smooth
// (eases toward the cursor with inertia, eases back to flat on leave) and
// self-stops when settled to avoid wasted frames.
export default function TiltSection({ children, className = '', intensity = 4, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // skip touch devices

    const target = { rx: 0, ry: 0 };
    const current = { rx: 0, ry: 0 };
    let raf = 0;

    // Ease current toward target; settle and STOP the loop once they match so
    // we don't burn frames while the cursor is stationary or off the element.
    const tick = () => {
      const dx = target.rx - current.rx;
      const dy = target.ry - current.ry;
      if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        current.rx = target.rx;
        current.ry = target.ry;
        if (current.rx === 0 && current.ry === 0) el.style.transform = '';
        raf = 0;
        return;
      }
      current.rx += dx * 0.10; // ease factor — smooth follow
      current.ry += dy * 0.10;
      el.style.transform = `perspective(1400px) rotateX(${current.rx.toFixed(3)}deg) rotateY(${current.ry.toFixed(3)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      target.rx = (0.5 - py) * intensity;
      target.ry = (px - 0.5) * intensity;
      start();
    };
    const onLeave = () => {
      target.rx = 0;
      target.ry = 0;
      start(); // ease back to flat, then stop
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [intensity]);

  return (
    <div
      ref={ref}
      className={`tilt-section ${className}`}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      {...rest}
    >
      {children}
    </div>
  );
}