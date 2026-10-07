import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-charcoal/60 overflow-x-auto py-2.5 ${className}`}>
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li>
          <Link
            to="/"
            className="flex items-center hover:text-terracotta transition-colors"
            title="Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="w-3 h-3 text-stone-300" />
              </li>
              <li>
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="hover:text-terracotta transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-medium text-charcoal truncate max-w-[200px] inline-block align-bottom">
                    {item.label}
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
