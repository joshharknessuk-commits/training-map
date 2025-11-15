import Image from 'next/image';

export interface GrappleMapWordmarkProps {
  className?: string;
  textClassName?: string;
  logoWrapperClassName?: string;
  priority?: boolean;
}

const baseTextClasses = 'flex items-center text-2xl font-semibold uppercase tracking-[0.2em] text-emerald-200';
const baseLogoWrapperClasses = 'ml-[0.2em] relative';
const defaultLogoSizeClasses = 'h-[1.8em] w-[1.8em] sm:h-[2em] sm:w-[2em]';

export function GrappleMapWordmark({
  className,
  textClassName,
  logoWrapperClassName,
  priority = false,
}: GrappleMapWordmarkProps = {}) {
  const containerClasses = ['flex items-center', className].filter(Boolean).join(' ');
  const wordmarkClasses = [baseTextClasses, textClassName].filter(Boolean).join(' ');
  const logoClasses = [
    baseLogoWrapperClasses,
    logoWrapperClassName ? undefined : defaultLogoSizeClasses,
    logoWrapperClassName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <p className={wordmarkClasses}>
        <span>Grapple</span>
        <span className="ml-[0.2em]">Map</span>
      </p>
      <div className={logoClasses}>
        <Image
          src="/logo2.svg"
          alt="Grapple Map logo"
          fill
          sizes="(min-width: 640px) 64px, 56px"
          className="object-contain"
          priority={priority}
          style={{
            filter:
              'brightness(0) saturate(100%) invert(86%) sepia(21%) saturate(1042%) hue-rotate(104deg) brightness(103%) contrast(101%)',
          }}
        />
      </div>
    </div>
  );
}
