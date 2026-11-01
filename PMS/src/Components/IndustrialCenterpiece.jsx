import React, { useState, useEffect, useRef } from 'react';
import '../Styles/IndustrialCenterpiece.css';

export default function IndustrialCenterpiece({
  graffitiText = 'YOUR FUTURE STARTS HERE',
}) {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, shiftX: 0, shiftY: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(hasTouch);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => motionQuery.removeEventListener('change', handleMotionChange);
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || prefersReducedMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    const clampedX = Math.max(-1, Math.min(1, deltaX));
    const clampedY = Math.max(-1, Math.min(1, deltaY));

    setTilt({
      rotY: clampedX * 5.5,
      rotX: -clampedY * 5.5,
      shiftX: clampedX * 6,
      shiftY: clampedY * 6,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rotX: 0, rotY: 0, shiftX: 0, shiftY: 0 });
  };

  const transformStyle = prefersReducedMotion || isTouchDevice
    ? {}
    : {
        transform: `perspective(1100px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg) translate3d(${tilt.shiftX}px, ${tilt.shiftY}px, 0)`,
        transition: isHovered
          ? 'transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)'
          : 'transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1)',
      };

  return (
    <div
      className="industrial-centerpiece-container"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Hanging Industrial Ring Centerpiece"
    >
      {/* Radiant Orange Ambient Spotlight Behind Ring */}
      <div className="centerpiece-ambient-glow" aria-hidden="true" />

      {/* 3D Tilted Hanging Assembly */}
      <div className="hanging-ring-assembly" style={transformStyle}>
        {/* Ring Image and SVG Overlay matching 1446x1685 coordinate space */}
        <div className="ring-image-frame">
          <img
            src="/images/industrial-ring.webp"
            alt="Massive rusted steel circular ring hanging by heavy chains"
            className="hanging-ring-img"
            loading="eager"
          />

          {/* 1:1 Vector Overlay mapped to exact 1446 x 1685 image coordinates */}
          <svg
            viewBox="0 0 1446 1685"
            className="ring-front-plate-svg"
            aria-label={graffitiText}
          >
            <defs>
              {/* Street Graffiti Neon Orange Spray Glow */}
              <filter id="frontPlateGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Exact center arc of the front metallic collar rim plate (y ≈ 1210 to 1275) */}
              <path
                id="frontCollarArc"
                d="M 230,1215 Q 723,1285 1216,1215"
                fill="none"
              />
            </defs>

            {/* Hand-painted Graffiti Text painted on the FRONT side of the ring plate */}
            <text
              className="front-rim-graffiti-text"
              filter="url(#frontPlateGlow)"
            >
              <textPath href="#frontCollarArc" startOffset="50%" textAnchor="middle">
                {graffitiText}
              </textPath>
            </text>

            {/* Subtle spray paint drip accents on the front plate */}
            <path
              d="M 520,1275 Q 522,1295 520,1305"
              stroke="#ff5e1a"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <circle cx="520" cy="1309" r="1.5" fill="#ff5e1a" opacity="0.75" />
            <path
              d="M 860,1260 Q 862,1280 861,1292"
              stroke="#ff5e1a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
