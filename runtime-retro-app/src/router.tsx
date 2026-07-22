import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface RouteMatch {
  path: string;
  params: Record<string, string>;
}
interface RouterValue extends RouteMatch {
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function matchRoute(
  pattern: string,
  pathname: string,
): RouteMatch | null {
  const keys: string[] = [];
  const expression = pattern.replace(/:[^/]+/g, (token) => {
    keys.push(token.slice(1));
    return "([^/]+)";
  });
  const match = new RegExp(`^${expression}/?$`).exec(pathname);
  if (!match) return null;
  return {
    path: pathname,
    params: Object.fromEntries(
      keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]),
    ),
  };
}

export function Router({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const update = (): void => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return (): void => window.removeEventListener("popstate", update);
  }, []);
  const value = useMemo<RouterValue>(
    () => ({
      path,
      params: {},
      navigate(to: string): void {
        history.pushState({}, "", to);
        setPath(window.location.pathname);
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    }),
    [path],
  );
  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
}

export function useRouter(): RouterValue {
  const router = useContext(RouterContext);
  if (!router) throw new Error("useRouter must be used inside Router");
  return router;
}

export function Link({
  to,
  className = "",
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      className={className}
      onClick={(event) => {
        if (!event.metaKey && !event.ctrlKey && event.button === 0) {
          event.preventDefault();
          navigate(to);
        }
      }}
    >
      {children}
    </a>
  );
}

export function Route({
  path,
  children,
}: {
  path: string;
  children: (match: RouteMatch) => React.ReactNode;
}): React.JSX.Element | null {
  const router = useRouter();
  const match = matchRoute(path, router.path);
  return match ? <>{children(match)}</> : null;
}
