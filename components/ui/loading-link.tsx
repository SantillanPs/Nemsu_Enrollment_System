"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  loadingClassName?: string;
  loaderSize?: number;
  loaderClassName?: string;
  showLoaderOnClick?: boolean;
  isLoading?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  (
    {
      children,
      className,
      loadingClassName,
      loaderSize = 4,
      loaderClassName,
      showLoaderOnClick = true,
      href,
      isLoading: controlledIsLoading,
      onLoadingChange,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    // Use internal state if not controlled from outside
    const [internalIsLoading, setInternalIsLoading] = React.useState(false);

    // Determine if we're using controlled or uncontrolled loading state
    const isControlled = controlledIsLoading !== undefined;
    const isLoading = isControlled ? controlledIsLoading : internalIsLoading;

    // Function to update loading state
    const setIsLoading = (value: boolean) => {
      if (!isControlled) {
        setInternalIsLoading(value);
      }
      if (onLoadingChange) {
        onLoadingChange(value);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (props.onClick) {
        props.onClick(e);
      }

      if (!e.defaultPrevented && showLoaderOnClick) {
        setIsLoading(true);
      }
    };

    // Get the current pathname
    const pathname = usePathname();

    // Reset loading state when pathname changes (navigation completes)
    React.useEffect(() => {
      // When pathname changes, it means navigation has completed
      setIsLoading(false);
    }, [pathname]);

    // Add a timeout to reset loading state in case navigation takes too long
    React.useEffect(() => {
      let timeoutId: NodeJS.Timeout | null = null;

      if (isLoading) {
        // Reset loading state after 3 seconds as a fallback
        timeoutId = setTimeout(() => {
          setIsLoading(false);
        }, 3000);
      }

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [isLoading]);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isLoading && loadingClassName)}
        {...props}
        onClick={handleClick}
      >
        {isLoading ? (
          <div className="flex items-center">
            <Loader2
              className={cn(
                "mr-2 animate-spin",
                loaderSize === 3 && "h-3 w-3",
                loaderSize === 4 && "h-4 w-4",
                loaderSize === 5 && "h-5 w-5",
                loaderSize === 6 && "h-6 w-6",
                loaderClassName
              )}
            />
            {children}
          </div>
        ) : (
          children
        )}
      </Link>
    );
  }
);

LoadingLink.displayName = "LoadingLink";

export { LoadingLink };
