'use client';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'dashboard' | 'minimal';
}

export default function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  const isMinimal = variant === 'minimal';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base Black Background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* Static Mesh Gradient - No Animation, No Blur */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(0, 255, 136, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(100, 255, 218, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 70%, rgba(0, 255, 136, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(50, 255, 170, 0.09) 0%, transparent 50%)
          `,
        }}
      />

      {/* Ultra-Light CSS Animated Blobs - No Framer Motion */}
      <div
        className="absolute animate-blob-slow"
        style={{
          width: '600px',
          height: '600px',
          top: '-5%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.06) 40%, transparent 70%)',
          filter: 'blur(40px)',
          borderRadius: '60% 40% 50% 70%',
        }}
      />

      <div
        className="absolute animate-blob-slower"
        style={{
          width: '550px',
          height: '550px',
          bottom: '-10%',
          left: '-10%',
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.12) 0%, rgba(50, 255, 170, 0.05) 40%, transparent 70%)',
          filter: 'blur(40px)',
          borderRadius: '50% 70% 40% 60%',
        }}
      />

      {!isMinimal && (
        <>
          {/* Single Subtle Accent Blob */}
          <div
            className="absolute animate-pulse-slow"
            style={{
              width: '400px',
              height: '400px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 60%)',
              filter: 'blur(35px)',
              borderRadius: '50%',
            }}
          />

          {/* Minimal Particles - Pure CSS, No JS Animation */}
          <div className="absolute inset-0">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float-slow"
                style={{
                  width: '8px',
                  height: '8px',
                  background: 'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%)',
                  left: `${20 + i * 25}%`,
                  top: `${30 + (i % 2) * 30}%`,
                  opacity: 0.3,
                  animationDelay: `${i * 2}s`,
                  animationDuration: `${20 + i * 3}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Subtle Grid - Ultra Minimal */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Vignette - Lighter */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 40%, rgba(0, 0, 0, 0.3) 100%)',
        }}
      />
    </div>
  );
}
