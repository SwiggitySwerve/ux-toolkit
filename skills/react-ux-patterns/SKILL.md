---
name: react-ux-patterns
description: React and Next.js specific UX patterns including state management, data fetching, and component patterns
license: MIT
---

# React UX Best Practices

## Loading States

### Suspense Pattern
```tsx
import { Suspense } from 'react';

<Suspense fallback={<Skeleton />}>
  <DataComponent />
</Suspense>
```

### Query Hook Pattern
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: fetchItems,
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorState error={error} onRetry={refetch} />;
return <ItemList items={data} />;
```

### Deferred Loading
```tsx
import { useDeferredValue } from 'react';

function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;
  
  return (
    <div style={{ opacity: isStale ? 0.7 : 1 }}>
      <Results query={deferredQuery} />
    </div>
  );
}
```

## Form Patterns

### Controlled Form with Validation
```tsx
import { useForm } from 'react-hook-form';

function ContactForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        aria-invalid={errors.email ? 'true' : 'false'}
        aria-describedby={errors.email ? 'email-error' : undefined}
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
      />
      {errors.email && (
        <span id="email-error" role="alert">
          {errors.email.message}
        </span>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Validation Timing
| Event | Use Case |
|-------|----------|
| onChange | Real-time feedback (debounce 300ms+) |
| onBlur | Field-level validation on exit |
| onSubmit | Final validation before submission |

## Optimistic Updates

### With React Query
```tsx
const mutation = useMutation({
  mutationFn: updateItem,
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['items'] });
    const previous = queryClient.getQueryData(['items']);
    
    queryClient.setQueryData(['items'], (old) =>
      old.map((item) =>
        item.id === newData.id ? { ...item, ...newData } : item
      )
    );
    
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['items'], context.previous);
    toast.error('Failed to update');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

### Use Cases for Optimistic UI
- Toggle states (like, bookmark, follow)
- Simple text edits
- Reordering items
- Adding/removing from lists

### Avoid Optimistic UI When
- Complex server validation required
- Financial transactions
- Irreversible actions
- Multi-step processes

## Focus Management

### Modal Focus Trap
```tsx
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      modalRef.current?.focus();
    }
    return () => {
      previousFocus.current?.focus();
    };
  }, [isOpen]);

  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {children}
    </div>
  ) : null;
}
```

### Skip Link
```tsx
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
    >
      Skip to main content
    </a>
  );
}
```

## Announcements for Screen Readers

### Live Region Hook
```tsx
import { useState, useCallback } from 'react';

function useAnnounce() {
  const [message, setMessage] = useState('');

  const announce = useCallback((text, priority = 'polite') => {
    setMessage('');
    setTimeout(() => setMessage(text), 100);
  }, []);

  const Announcer = () => (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, Announcer };
}
```

## Error Boundaries

### Functional Error Boundary
```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => queryClient.clear()}
>
  <App />
</ErrorBoundary>
```

## Performance UX

### Code Splitting
```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Image Optimization (Next.js)
```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image description"
  width={1200}
  height={600}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL={blurPlaceholder}
/>
```

### Virtualization for Long Lists
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: virtualRow.start,
              height: virtualRow.size,
            }}
          >
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Reduced Motion Support

```tsx
function AnimatedComponent() {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)'
  );

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.3,
      }}
    />
  );
}
```

### CSS Approach
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
