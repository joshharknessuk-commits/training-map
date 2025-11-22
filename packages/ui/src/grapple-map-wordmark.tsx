export interface GrappleMapWordmarkProps {
  className?: string;
  textClassName?: string;
  logoWrapperClassName?: string;
  logoAlt?: string;
  logoSrc?: string;
}

const baseTextClasses = 'flex items-center text-2xl font-semibold uppercase tracking-[0.2em] text-brand-700';
const baseLogoWrapperClasses = 'ml-[0.2em] relative';
const defaultLogoSizeClasses = 'h-[1.8em] w-[1.8em] sm:h-[2em] sm:w-[2em]';

const DEFAULT_LOGO_SRC = '/logo2.svg';

export function GrappleMapWordmark({
  className,
  textClassName,
  logoWrapperClassName,
  logoAlt = 'Grapple Map logo',
  logoSrc = DEFAULT_LOGO_SRC,
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
        <img
          src={logoSrc}
          alt={logoAlt}
          className="h-full w-full object-contain"
          style={{
            filter:
              'brightness(0) saturate(100%) invert(52%) sepia(98%) saturate(2476%) hue-rotate(183deg) brightness(101%) contrast(97%)',
          }}
          loading="eager"
        />
      </div>
    </div>
  );
}
