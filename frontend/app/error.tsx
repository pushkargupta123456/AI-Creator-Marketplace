'use client';

import { Button } from '@/components/Button';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Route-level error boundary. Without this, a render error anywhere in a page
 * blanks the whole screen with Next's default fallback.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface it for whatever error reporting gets wired up later.
    console.error(error);
  }, [error]);

  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 pb-16 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-raise text-warn">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        This page hit an unexpected error. Trying again usually clears it.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-subtle">Reference: {error.digest}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
}
