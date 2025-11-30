# Simplify Public Navigation & Migrate to Bun

**Type**: Enhancement
**Priority**: High
**Created**: 2025-11-30

## Overview

Simplify OpenRebuildLK to have a clear separation between public and authenticated experiences:

1. **Public-facing site** (no login required):
   - View map of verified damage reports
   - Submit new damage reports
   - View list of submitted reports

2. **Role-based navigation**:
   - Additional menu items visible only after login, based on user role
   - Clean, minimal public interface focused on citizen engagement

3. **Tooling migration**:
   - Replace all `npm` usage with `bun` throughout the project

---

## Problem Statement

Currently, all navigation items (Dashboard, Projects, Admin) are visible to everyone regardless of authentication state. This creates confusion for public users who see menu items they cannot access, and doesn't provide a clear distinction between the public reporting interface and internal management tools.

Additionally, the project uses `npm` but should use `bun` for faster installs and better developer experience.

---

## Proposed Solution

### Navigation Visibility Matrix

| Route | Anonymous | Citizen | Field Officer | Planner | Admin | Stakeholder |
|-------|-----------|---------|---------------|---------|-------|-------------|
| `/` (Home) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/map` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/submit` | ✓ | ✓ | ✓ | - | - | - |
| `/reports` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/dashboard` | - | - | ✓ | ✓ | ✓ | ✓ |
| `/projects` | - | - | - | ✓ | ✓ | ✓ |
| `/admin/*` | - | - | - | - | ✓ | - |

**Notes**:
- Planners/Admins don't need "Submit Report" (they verify, not submit)
- Stakeholders get read-only access to Dashboard and Projects
- Field Officers can submit reports (they're in the field)

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AuthProvider (Zustand)                  │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │              BrowserRouter                   │    │    │
│  │  │  ┌───────────────────────────────────────┐  │    │    │
│  │  │  │     Layout (Header + Sidebar)         │  │    │    │
│  │  │  │     - Reads auth state                │  │    │    │
│  │  │  │     - Filters nav items by role       │  │    │    │
│  │  │  │  ┌─────────────────────────────────┐  │  │    │    │
│  │  │  │  │          Routes                  │  │  │    │    │
│  │  │  │  │  - Public routes (no guard)      │  │  │    │    │
│  │  │  │  │  - Protected routes (with guard) │  │  │    │    │
│  │  │  │  └─────────────────────────────────┘  │  │    │    │
│  │  │  └───────────────────────────────────────┘  │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Approach

### Phase 1: Auth State Management

Create a Zustand store for authentication state that persists to localStorage.

#### 1.1 Create Auth Store

**File**: `src/react-app/stores/auth.ts`

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  provinceScope?: string;
  districtScope?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) throw new Error("Invalid credentials");
          const data = await res.json();
          set({ user: data.user, token: data.token, isLoading: false });
        } catch (err) {
          set({ error: err.message, isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // ... other actions
    }),
    { name: "auth-storage" }
  )
);
```

#### 1.2 Install Zustand

```bash
bun add zustand
```

### Phase 2: Navigation Updates

#### 2.1 Update Sidebar Navigation

**File**: `src/react-app/components/layout/Sidebar.tsx`

```typescript
import { useAuthStore } from "@/stores/auth";

// Define menu items with role requirements
const navItems = [
  { href: "/", icon: Home, label: "Home", roles: null }, // null = public
  { href: "/map", icon: Map, label: "Map", roles: null },
  { href: "/submit", icon: FileText, label: "Submit Report", roles: ["public", "citizen", "field_officer"] },
  { href: "/reports", icon: ClipboardList, label: "Reports", roles: null },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["field_officer", "planner", "admin", "super_admin", "stakeholder"] },
  { href: "/projects", icon: Building2, label: "Projects", roles: ["planner", "admin", "super_admin", "stakeholder"] },
];

const adminItems = [
  { href: "/admin/users", icon: Users, label: "Users", roles: ["admin", "super_admin"] },
  { href: "/admin/settings", icon: Settings, label: "Settings", roles: ["admin", "super_admin"] },
];

export function Sidebar({ isOpen, onClose, currentPath }: SidebarProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "public";

  // Filter items based on role
  const visibleNav = navItems.filter(
    (item) => item.roles === null || item.roles.includes(userRole)
  );

  const visibleAdmin = adminItems.filter(
    (item) => item.roles.includes(userRole)
  );

  // ... render filtered items
}
```

#### 2.2 Update Header with Auth UI

**File**: `src/react-app/components/layout/Header.tsx`

Add login/logout buttons and user display:

```typescript
import { useAuthStore } from "@/stores/auth";
import { Link } from "react-router-dom";

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuthStore();

  return (
    <header>
      {/* ... existing content ... */}

      <div className="flex items-center gap-2">
        {user ? (
          <>
            <span className="text-sm">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <Button asChild size="sm">
            <Link to="/login">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
```

### Phase 3: Route Protection

#### 3.1 Create Protected Route Component

**File**: `src/react-app/components/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

#### 3.2 Update App.tsx Routes

**File**: `src/react-app/App.tsx`

```typescript
import { ProtectedRoute } from "@/components/ProtectedRoute";

function AppContent() {
  return (
    <Layout currentPath={location.pathname}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/submit" element={<SubmitReport />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["field_officer", "planner", "admin", "super_admin", "stakeholder"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute allowedRoles={["planner", "admin", "super_admin", "stakeholder"]}>
              <Projects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
```

### Phase 4: Auth Pages

#### 4.1 Create Login Page

**File**: `src/react-app/pages/Login.tsx`

```typescript
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to OpenRebuildLK</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 4.2 Create Register Page

**File**: `src/react-app/pages/Register.tsx`

Similar structure to Login with additional fields (name, phone).

#### 4.3 Create Submit Report Page

**File**: `src/react-app/pages/SubmitReport.tsx`

Dedicated page for submitting damage reports (currently embedded in Reports page).

### Phase 5: Bun Migration

#### 5.1 Update package.json Scripts

**File**: `package.json`

```json
{
  "scripts": {
    "build": "tsc -b && vite build",
    "cf-typegen": "wrangler types",
    "check": "tsc && vite build && wrangler deploy --dry-run",
    "deploy": "wrangler deploy",
    "dev": "vite",
    "lint": "eslint .",
    "preview": "bun run build && vite preview",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply rda-status-db --local",
    "db:studio": "drizzle-kit studio"
  }
}
```

#### 5.2 Remove npm Lockfile

```bash
rm package-lock.json
# bun.lock already exists
```

#### 5.3 Update README

Replace all `npm` references with `bun`:

```markdown
## Quick Start

# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun run build

# Deploy to Cloudflare
bun run deploy
```

#### 5.4 Create bunfig.toml (Optional)

**File**: `bunfig.toml`

```toml
[install]
# Save text lockfile (default in Bun 1.2+)
saveTextLockfile = true
```

---

## Acceptance Criteria

### Functional Requirements

- [ ] Anonymous users see only: Home, Map, Submit Report, Reports in navigation
- [ ] Login/Register pages exist and work correctly
- [ ] After login, navigation updates to show role-appropriate items
- [ ] Protected routes redirect to login when accessed without auth
- [ ] Protected routes redirect to home when accessed with insufficient role
- [ ] Logout clears auth state and reverts navigation to public items
- [ ] Auth state persists across page refreshes (localStorage)
- [ ] All `npm` commands replaced with `bun`
- [ ] `package-lock.json` removed, `bun.lock` committed

### Non-Functional Requirements

- [ ] No flash of wrong navigation on page load
- [ ] Login/logout transitions feel instant
- [ ] Build succeeds with `bun run build`
- [ ] All existing functionality continues to work

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/react-app/stores/auth.ts` | Zustand auth store |
| `src/react-app/components/ProtectedRoute.tsx` | Route guard component |
| `src/react-app/pages/Login.tsx` | Login page |
| `src/react-app/pages/Register.tsx` | Registration page |
| `src/react-app/pages/SubmitReport.tsx` | Dedicated report submission page |
| `bunfig.toml` | Bun configuration (optional) |

## Files to Modify

| File | Changes |
|------|---------|
| `src/react-app/App.tsx` | Add protected routes, auth pages |
| `src/react-app/pages/index.ts` | Export new pages |
| `src/react-app/components/layout/Sidebar.tsx` | Role-based nav filtering |
| `src/react-app/components/layout/Header.tsx` | Add login/logout UI |
| `package.json` | Update scripts for bun |
| `README.md` | Replace npm with bun |

## Files to Delete

| File | Reason |
|------|--------|
| `package-lock.json` | Replaced by bun.lock |

---

## Implementation Order

1. **Install Zustand** - `bun add zustand`
2. **Create auth store** - `stores/auth.ts`
3. **Create ProtectedRoute** - Route guard component
4. **Update Sidebar** - Role-based filtering
5. **Update Header** - Login/logout UI
6. **Create Login page** - Authentication form
7. **Create Register page** - Registration form
8. **Update App.tsx** - Wire up routes
9. **Create SubmitReport page** - Extract from Reports
10. **Migrate to bun** - Update scripts, remove npm lock
11. **Test all flows** - Anonymous, citizen, field_officer, planner, admin
12. **Build verification** - `bun run build`

---

## Edge Cases Addressed

1. **Token expiration**: Auth store handles 401 responses by clearing state
2. **Direct URL access**: ProtectedRoute redirects appropriately
3. **Role changes**: User must re-login to see updated permissions
4. **Multi-tab sync**: Zustand persist handles localStorage sync
5. **Page refresh**: Auth state persists via localStorage

---

## Dependencies

```bash
bun add zustand
```

No other new dependencies required.

---

## References

### Internal Files
- `src/react-app/components/layout/Sidebar.tsx:27-54` - Current nav structure
- `src/worker/middleware/auth.ts:129-143` - Backend role middleware
- `src/shared/types.ts:1-11` - Role definitions

### External Documentation
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)
- [React Router Protected Routes](https://reactrouter.com/en/main/start/tutorial#pathless-routes)
- [Bun Package Manager](https://bun.sh/docs/cli/install)
