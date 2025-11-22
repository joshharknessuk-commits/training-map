import * as React from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="border-b-2 border-neutral-200 bg-white pb-6">
      <div className="mx-auto max-w-7xl px-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-4 flex items-center space-x-2 text-sm font-medium text-neutral-700">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-neutral-400">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-blue-600 transition-colors duration-150"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-neutral-950 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-950 tracking-tight">{title}</h1>
            {description && (
              <p className="mt-2 text-lg font-medium text-neutral-700">{description}</p>
            )}
          </div>

          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

PageHeader.displayName = 'PageHeader';
