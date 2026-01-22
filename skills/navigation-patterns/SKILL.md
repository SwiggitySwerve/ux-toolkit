---
name: navigation-patterns
description: Sidebar navigation, mobile drawers, breadcrumbs, and app shell patterns for React/Next.js applications
license: MIT
---

# Navigation Design Patterns

## Collapsible Sidebar

### Desktop Sidebar with Collapse Toggle
```tsx
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();

  const isPathActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        bg-surface-deep border-r border-border
        fixed inset-y-0 left-0 z-30
        flex flex-col
        ${isCollapsed ? 'w-16' : 'w-56'}
        transition-[width] duration-300 ease-in-out
      `}
    >
      {/* Header / Brand */}
      <div className={`
        flex items-center h-14 border-b border-border
        ${isCollapsed ? 'justify-center px-2' : 'px-4 gap-3'}
      `}>
        <Logo className="w-8 h-8 flex-shrink-0" />
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <span className="text-base font-bold">AppName</span>
            <span className="block text-xs text-text-muted">Subtitle</span>
          </div>
        )}
        
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-surface-raised"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <NavSection title="Browse" isCollapsed={isCollapsed}>
          <NavItem href="/items" icon={<ItemsIcon />} label="Items" isCollapsed={isCollapsed} isActive={isPathActive('/items')} />
          <NavItem href="/catalog" icon={<CatalogIcon />} label="Catalog" isCollapsed={isCollapsed} isActive={isPathActive('/catalog')} />
        </NavSection>

        <NavSection title="Tools" isCollapsed={isCollapsed}>
          <NavItem href="/editor" icon={<EditorIcon />} label="Editor" isCollapsed={isCollapsed} isActive={isPathActive('/editor')} />
        </NavSection>
      </nav>

      {/* Footer */}
      <div className={`border-t border-border py-3 ${isCollapsed ? 'px-2 text-center' : 'px-4'}`}>
        {isCollapsed ? (
          <span className="text-xs text-text-muted">v1.0</span>
        ) : (
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>v1.0.0</span>
            <a href="https://github.com" className="hover:text-accent">
              <GithubIcon />
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
```

### Navigation Item Component
```tsx
interface NavItemProps {
  href: string;
  icon: ReactElement;
  label: string;
  isCollapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isCollapsed, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        onClick={onClick}
        className={`
          relative flex items-center px-3 py-2.5 mx-2 rounded-lg
          transition-all duration-150 group
          ${isCollapsed ? 'justify-center' : 'gap-3'}
          ${isActive
            ? 'bg-accent/15 text-accent'
            : 'text-text-secondary hover:text-white hover:bg-surface-raised/50'
          }
        `}
      >
        {/* Active indicator - left border */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
        )}
        
        {/* Icon */}
        <span className={`flex-shrink-0 ${isActive ? 'text-accent' : ''}`}>
          {icon}
        </span>
        
        {/* Label */}
        {!isCollapsed && (
          <span className="text-sm font-medium truncate">{label}</span>
        )}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-surface-base text-white text-sm rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 whitespace-nowrap border border-border">
            {label}
          </div>
        )}
      </a>
    </Link>
  );
}
```

### Navigation Section Component
```tsx
function NavSection({ title, children, isCollapsed }: { title?: string; children: React.ReactNode; isCollapsed: boolean }) {
  return (
    <div className="mb-2">
      {title && !isCollapsed && (
        <div className="px-3 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {title}
          </span>
        </div>
      )}
      {!isCollapsed && title && <div className="mx-4 border-t border-border mb-4" />}
      <div className="space-y-0.5">
        {children}
      </div>
    </div>
  );
}
```

## Mobile Sidebar Drawer

### Mobile Sidebar with Overlay
```tsx
// Store for mobile sidebar state (Zustand example)
const useMobileSidebarStore = create((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

function MobileSidebar({ children }) {
  const { isOpen, close } = useMobileSidebarStore();

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-surface-deep border-r border-border
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:hidden
        `}
      >
        {children}
      </aside>
    </>
  );
}
```

### Mobile Header with Menu Button
```tsx
function MobileHeader({ title }) {
  const openMobileSidebar = useMobileSidebarStore((s) => s.open);

  return (
    <header className="lg:hidden flex items-center justify-between h-12 px-3 bg-surface-base border-b border-border">
      <span className="text-sm font-semibold text-white truncate">
        {title}
      </span>
      <button
        onClick={openMobileSidebar}
        className="p-2 -mr-2 rounded-lg text-text-secondary hover:text-white hover:bg-surface-raised/50"
        aria-label="Open navigation menu"
      >
        <HamburgerIcon />
      </button>
    </header>
  );
}
```

### Auto-Close on Navigation
```tsx
// In _app.tsx or layout
function App({ Component, pageProps }) {
  const router = useRouter();
  const closeMobileSidebar = useMobileSidebarStore((s) => s.close);

  // Close mobile drawer on route change
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        closeMobileSidebar();
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events, closeMobileSidebar]);

  return <Component {...pageProps} />;
}
```

## App Shell Layout

### Responsive Layout with Sidebar
```tsx
interface LayoutProps {
  children: ReactNode;
  title?: string;
  sidebarComponent?: ReactNode;
  isSidebarCollapsed?: boolean;
}

function Layout({ children, title, sidebarComponent, isSidebarCollapsed }: LayoutProps) {
  // Calculate main content margin based on sidebar state
  const hasSidebar = !!sidebarComponent;
  const contentMargin = hasSidebar
    ? (isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56')
    : '';

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <div className="flex flex-col h-screen bg-surface-deep overflow-hidden">
        {/* Mobile header - only on mobile */}
        {hasSidebar && <MobileHeader title={title} />}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - fixed position */}
          {sidebarComponent}

          {/* Main content */}
          <main className={`flex-1 overflow-auto ${contentMargin} transition-all duration-300`}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
```

## Breadcrumbs

### Breadcrumb Component
```tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRightIcon className="w-4 h-4 text-text-muted" />
              )}
              
              {isLast || !item.href ? (
                <span className={isLast ? 'text-white font-medium' : 'text-text-secondary'}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href}>
                  <a className="text-text-secondary hover:text-accent transition-colors">
                    {item.label}
                  </a>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Usage
<Breadcrumbs items={[
  { label: 'Home', href: '/' },
  { label: 'Campaigns', href: '/campaigns' },
  { label: 'Operation Serpent' }  // Current page, no href
]} />
```

## Quick Navigation Tags

### Settings-Style Quick Nav
```tsx
interface QuickNavProps {
  sections: { id: string; title: string; icon: ReactNode }[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

function QuickNavigation({ sections, activeSection, onNavigate }: QuickNavProps) {
  return (
    <div className="sticky top-0 z-10 bg-surface-deep/95 backdrop-blur-sm border-b border-border -mx-4 px-4 py-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-text-muted mr-1">Jump to:</span>
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md
                transition-all duration-150
                ${isActive
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-surface-raised/50 text-text-secondary border border-border hover:bg-surface-raised hover:text-white'
                }
              `}
            >
              {section.icon}
              {section.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Scrolling to Section with URL Hash
```tsx
function useHashNavigation(sections: string[]) {
  const [activeSection, setActiveSection] = useState(sections[0]);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Parse hash on mount
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && sections.includes(hash)) {
      setActiveSection(hash);
      setTimeout(() => {
        sectionRefs.current[hash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }

    const onHashChange = () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && sections.includes(newHash)) {
        setActiveSection(newHash);
        sectionRefs.current[newHash]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [sections]);

  const navigateToSection = useCallback((sectionId: string) => {
    window.history.pushState(null, '', `#${sectionId}`);
    setActiveSection(sectionId);
    setTimeout(() => {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const createSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  return { activeSection, navigateToSection, createSectionRef };
}
```

## Sidebar Navigation Best Practices

### Do's
- Use clear, recognizable icons
- Show tooltips when collapsed
- Indicate active state clearly (color + left border)
- Auto-close mobile drawer on navigation
- Persist collapsed state to localStorage
- Use section dividers for grouping

### Don'ts
- Don't nest more than 2 levels deep
- Don't hide important navigation in submenus
- Don't forget mobile experience
- Don't animate width changes too slowly (>300ms feels sluggish)
- Don't use horizontal scrolling in sidebar

### Accessibility
- Use `aria-label` on collapse/expand buttons
- Ensure focus is visible in all states
- Support keyboard navigation (Tab, Enter, Escape)
- Announce state changes to screen readers
- Use semantic HTML (nav, ul, li)
