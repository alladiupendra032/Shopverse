# 🎨 E-Commerce Web Application — Design System

> **Stack:** React.js · Node.js · Supabase  
> **Theme:** Dark Glassmorphism · Neon Accents · Premium Feel

---

## 1. Design Philosophy

| Principle | Description |
|-----------|-------------|
| **Glassmorphism** | Frosted-glass cards with blur, transparency, and subtle borders |
| **Dark-First** | Deep dark background with luminous accents — premium & focused |
| **Micro-Animations** | Hover lifts, fade-ins, shimmer loaders, smooth transitions |
| **Hierarchy** | Clear visual weight — headline → subheading → body → caption |
| **Accessibility** | WCAG AA contrast ratios maintained despite dark aesthetics |

---

## 2. Color System

### 2.1 Base Palette

```css
:root {
  /* ── Backgrounds ── */
  --bg-base:        #0a0c14;   /* Deep space black */
  --bg-surface:     #10121e;   /* Card / panel base */
  --bg-elevated:    #181b2e;   /* Modals, dropdowns */

  /* ── Glassmorphism ── */
  --glass-bg:       rgba(255, 255, 255, 0.05);
  --glass-border:   rgba(255, 255, 255, 0.10);
  --glass-shadow:   rgba(0, 0, 0, 0.40);
  --glass-blur:     16px;

  /* ── Primary Accent — Electric Violet ── */
  --primary-400:    #a78bfa;
  --primary-500:    #8b5cf6;
  --primary-600:    #7c3aed;
  --primary-glow:   rgba(139, 92, 246, 0.35);

  /* ── Secondary Accent — Cyan ── */
  --secondary-400:  #67e8f9;
  --secondary-500:  #06b6d4;
  --secondary-glow: rgba(6, 182, 212, 0.30);

  /* ── Success / Warning / Error ── */
  --success:        #34d399;
  --warning:        #fbbf24;
  --error:          #f87171;

  /* ── Text ── */
  --text-primary:   #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted:     #475569;

  /* ── Borders ── */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.12);
  --border-strong:  rgba(139, 92, 246, 0.40);
}
```

### 2.2 Gradient Presets

```css
/* Hero gradient mesh */
--gradient-hero: radial-gradient(ellipse at 20% 50%, rgba(139,92,246,0.25) 0%, transparent 60%),
                 radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.20) 0%, transparent 55%),
                 #0a0c14;

/* Card shimmer on hover */
--gradient-card-hover: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.08));

/* CTA button */
--gradient-btn: linear-gradient(135deg, #7c3aed, #06b6d4);

/* Price badge */
--gradient-price: linear-gradient(90deg, #8b5cf6, #a78bfa);

/* Admin sidebar */
--gradient-sidebar: linear-gradient(180deg, #10121e 0%, #0a0c14 100%);
```

---

## 3. Typography

```css
/* Import in index.html */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Outfit', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Type Scale

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `--text-xs`  | 11px | 400 | Labels, badges |
| `--text-sm`  | 13px | 400 | Captions, helper text |
| `--text-base`| 15px | 400 | Body copy |
| `--text-md`  | 17px | 500 | Card titles |
| `--text-lg`  | 20px | 600 | Section headers |
| `--text-xl`  | 28px | 700 | Page headings |
| `--text-2xl` | 40px | 800 | Hero headline |
| `--text-3xl` | 56px | 800 | Landing hero |

---

## 4. Glassmorphism System

### Core Glass Mixin

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(180%);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow:
    0 8px 32px var(--glass-shadow),
    inset 0 1px 0 rgba(255,255,255,0.08);
}

/* Elevated glass — modals, overlays */
.glass-elevated {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    0 20px 60px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.12);
}

/* Accent glass — highlighted panels */
.glass-accent {
  background: rgba(139, 92, 246, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 92, 246, 0.25);
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.15);
}
```

### Glow Effects

```css
.glow-primary   { box-shadow: 0 0 20px var(--primary-glow), 0 0 60px rgba(139,92,246,0.15); }
.glow-secondary { box-shadow: 0 0 20px var(--secondary-glow); }
.text-glow      { text-shadow: 0 0 20px rgba(139, 92, 246, 0.6); }
```

---

## 5. Spacing & Layout

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  --container-max: 1280px;
  --container-pad: clamp(16px, 4vw, 48px);
}
```

### Responsive Breakpoints

| Name | Width | Target |
|------|-------|--------|
| `xs` | 360px | Small phones |
| `sm` | 480px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl`| 1536px | Large screens |

---

## 6. Component Designs

### 6.1 Navbar

**Layout:**
```
[Logo ✦]   Home  Products  Deals    [Search 🔍]  [Cart 🛒 (3)]  [Login]
```

**Styles:**
- `position: sticky; top: 0; z-index: 100`
- Background: `rgba(10, 12, 20, 0.80)` + `backdrop-filter: blur(20px)`
- Bottom border: `1px solid var(--border-subtle)`
- Logo: Gradient text using `--gradient-btn`, `font-weight: 800`
- Nav links: `--text-secondary` → `--text-primary` on hover with underline scale
- Cart badge: `--primary-500` pill, count animates on add
- Login button: `--gradient-btn` pill with pulse glow

---

### 6.2 Hero Section (Home Page)

**Layout:**
```
[✦ New Collection 2026]

Shop the Future,                      [Floating Product Image]
Delivered Today.

Discover premium products with
next-gen shopping experience.

[Explore Now →]   [View Deals]

──── 12K+ Products  ·  50K+ Customers ────
```

**Styles:**
- Background: `--gradient-hero` mesh
- Headline: `--text-3xl`, gradient clipped text (`background-clip: text`)
- Sub-text: `--text-secondary`
- Floating product image: `border-radius: 20px`, glow shadow, `animate-float`
- Stats row: Glass pill chips

---

### 6.3 Product Card

**Layout:**
```
┌──────────────────────┐
│     Product Image    │
│  [Category Badge]    │
│  Product Name        │
│  ★★★★☆  (128)        │
│  $89.99  ~~$120~~    │
│  [Add to Cart ＋]    │
└──────────────────────┘
```

**Styles:**
- Container: `.glass`, `border-radius: var(--radius-lg)`
- Hover: `transform: translateY(-6px)`, stronger shadow, `--border-strong` glow
- Image: `border-radius: var(--radius-md)`, `object-fit: cover`, height `220px`
- Category badge: `.glass-accent` pill, `--primary-400` text, uppercase `--text-xs`
- Price: Current bold `--text-primary`; original strike `--text-muted`
- Add to Cart: Full-width pill, `--gradient-btn`, hover scale + glow

---

### 6.4 Product Listing Page

**Layout:**
```
[Filters Sidebar 260px]  |  [Product Grid — auto-fill 260px min]
  Category checkboxes       Card  Card  Card
  Price range slider        Card  Card  Card
  Rating filter             [Load More]
```

**Styles:**
- Filter sidebar: `.glass`, sticky, custom checkbox with `--primary-500`
- Range slider: Gradient track, `--primary-500` thumb
- Grid: `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`
- Skeleton loaders: Animated shimmer gradient while fetching
- Sort dropdown: `.glass-elevated` with blur

---

### 6.5 Product Detail Page

**Layout:**
```
[Main Image]   [Thumbnail] [Thumbnail] [Thumbnail]

                   Product Name
                   ★★★★☆  128 reviews
                   $89.99   In Stock ✓
                   Qty: [─ 1 +]
                   [Add to Cart]  [Buy Now]

[Description Tab]  [Specs Tab]  [Reviews Tab]
─────────────────────────────────────────────
Content here...
```

**Styles:**
- Image gallery: Main with glass border; thumbnails as `.glass` chips
- Right panel: `.glass` card
- Stock badge: Green `--success` / Red `--error` pill
- Qty stepper: Glass buttons with hover glow
- Primary CTA: `--gradient-btn`, full-width, large
- Secondary CTA: Ghost outlined `--border-strong`
- Tabs: Underline with `--primary-500` active + slide animation

---

### 6.6 Cart Page

**Layout:**
```
Cart (3 items)

[Cart Items List]              [Order Summary Card]
  img  Name  Qty  $89            Subtotal: $134
  img  Name  Qty  $45            Shipping: Free
  img  Name  Qty  $60            Total:    $134
                                 [Checkout →]
```

**Styles:**
- Cart rows: `.glass` cards, fade-out animation on remove
- Qty controls: Compact stepper, `--primary-500`
- Remove icon: `--error` on hover
- Summary card: `.glass-elevated`, sticky on desktop
- Checkout button: `--gradient-btn` with arrow icon + slide animation

---

### 6.7 Checkout Page

**Layout:**
```
Step: [1. Address] ──► [2. Payment] ──► [3. Review]

[Shipping Form]               [Order Summary]
  Name, Address                 Items + prices
  City / ZIP                    Total: $134
  [Continue →]
```

**Styles:**
- Step indicator: Horizontal nodes, `--primary-500` active, connecting line
- Inputs: `.glass` style, focus border `--primary-500` with ring glow
- Labels: `--text-secondary`, uppercase, `--text-xs`
- Error state: `--error` border + helper text below
- Summary: `.glass` sticky panel

---

### 6.8 Login / Register Page

**Layout:**
```
[Full viewport — gradient background]

          [Logo]

     ┌──────────────────────────┐
     │  Welcome Back 👋          │
     │                          │
     │  Email ________________  │
     │  Password ______________  │
     │                          │
     │  [Sign In]               │
     │  ─────── or ─────────    │
     │  [Continue with Google]  │
     │  Don't have an account?  │
     └──────────────────────────┘
```

**Styles:**
- Page: Full viewport centered, `--gradient-hero`
- Card: `.glass-elevated`, `max-width: 440px`, `border-radius: 24px`
- Inputs: Glass style with animated focus glow
- Primary button: `--gradient-btn`, full-width, `--radius-full`
- Google button: Glass outlined + icon
- Login/Register toggle: Pill switcher with slide animation

---

### 6.9 Profile Page

**Layout:**
```
[Avatar 80px]  John Doe · john@email.com · Member since 2024

[Profile Tab]  [Orders Tab]  [Addresses Tab]  [Settings Tab]
──────────────────────────────────────────────────────────────
Order #1234   $89    Delivered ✓
Order #1233   $134   Processing ⏳
```

**Styles:**
- Avatar: `80px` circle, `--primary-500` ring with glow
- Tab bar: Glass pill switcher
- Order rows: `.glass` cards, color-coded status badge
- Status: `--success` Delivered · `--warning` Processing · `--error` Cancelled

---

### 6.10 Admin Panel

#### Sidebar
```
✦ AdminPanel

📊 Dashboard
📦 Products
📋 Orders
👤 Users
⚙️  Settings

[Logout]
```
- Width `260px`, `--gradient-sidebar` background
- Active item: `.glass-accent`, `--primary-400` text, left `3px` border `--primary-500`
- Collapsed to `64px` icons-only on `< lg`

#### Dashboard Stats Cards
```
[📦 Products 1,248 ▲+12%]  [📋 Orders 342 ▲+5%]  [👤 Users 8,920 ▲+8%]  [💰 $48,290 ▲+18%]
```
- Cards: `.glass` with colored icon glow (violet / cyan / green / amber)
- Number: `--text-2xl`, bold; Trend: `--success` / `--error`

#### Data Tables
- Container: `.glass`, `overflow-x: auto`
- Header: `rgba(255,255,255,0.04)`
- Row hover: `rgba(139,92,246,0.06)`
- Actions: Icon-only buttons with tooltip

---

## 7. Buttons

```css
.btn-primary {
  background: var(--gradient-btn);
  color: #fff;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--primary-glow);
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border-strong);
  color: var(--primary-400);
  border-radius: var(--radius-full);
  padding: 12px 28px;
}
.btn-ghost:hover { background: rgba(139,92,246,0.10); }

.btn-danger {
  background: rgba(248,113,113,0.12);
  border: 1px solid rgba(248,113,113,0.30);
  color: var(--error);
  border-radius: var(--radius-md);
  padding: 8px 16px;
}
```

---

## 8. Form Inputs

```css
.input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-glow);
}
.input::placeholder { color: var(--text-muted); }
```

---

## 9. Animations

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fadeInUp 0.5s ease forwards; }

@keyframes shimmer {
  from { background-position: -200% 0; }
  to   { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
  border-radius: var(--radius-md);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
.animate-float { animation: float 4s ease-in-out infinite; }

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px var(--primary-glow); }
  50%       { box-shadow: 0 0 40px var(--primary-glow), 0 0 80px rgba(139,92,246,0.20); }
}
.animate-glow-pulse { animation: pulseGlow 2.5s ease-in-out infinite; }
```

---

## 10. Icons — Lucide React

```bash
npm install lucide-react
```

| UI Element | Icon Name |
|------------|-----------|
| Cart | `ShoppingCart` |
| Search | `Search` |
| User / Profile | `User` |
| Orders | `Package` |
| Dashboard | `LayoutDashboard` |
| Products | `Box` |
| Delete | `Trash2` |
| Edit | `Pencil` |
| Star | `Star` |
| Navigation | `ChevronRight` |
| Settings | `Settings` |
| Logout | `LogOut` |

Sizes: `18px` inline · `20px` buttons · `24px` sidebar

---

## 11. Page Animation Strategy

| Page | Animation |
|------|-----------|
| Home | Hero fades up, product cards stagger 80ms each |
| Product Listing | Skeleton → cards staggered fade |
| Product Detail | Split layout slides from both sides |
| Cart | Items fade-down on remove, total count-up |
| Checkout | Steps slide left/right on transition |
| Login/Register | Card fades in with scale from 0.95 |
| Admin | Sidebar slides from left, stat cards stagger |

---

## 12. Status Badge System

```css
.badge {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}
.badge-success { background: rgba(52,211,153,0.15); color: var(--success); border: 1px solid rgba(52,211,153,0.30); }
.badge-warning { background: rgba(251,191,36,0.15); color: var(--warning); border: 1px solid rgba(251,191,36,0.30); }
.badge-error   { background: rgba(248,113,113,0.15); color: var(--error);   border: 1px solid rgba(248,113,113,0.30); }
.badge-primary { background: rgba(139,92,246,0.15); color: var(--primary-400); border: 1px solid rgba(139,92,246,0.30); }
```

---

## 13. Folder Structure (Frontend)

```
src/
├── assets/
├── components/
│   ├── ui/          # Button, Input, Badge, Card, Modal, Skeleton
│   ├── layout/      # Navbar, Footer, Sidebar
│   └── shared/      # ProductCard, CartItem, OrderRow
├── pages/
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Profile.jsx
│   └── admin/
│       ├── Dashboard.jsx
│       ├── ManageProducts.jsx
│       ├── ManageOrders.jsx
│       └── ManageUsers.jsx
├── context/         # CartContext, AuthContext
├── hooks/           # useCart, useAuth, useProducts
├── services/        # api.js, auth.js, products.js
├── styles/
│   ├── index.css
│   ├── glass.css
│   └── animations.css
└── App.jsx
```

---

## 14. Global CSS Reset & Base

```css
/* styles/index.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  background: var(--bg-base);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

img { max-width: 100%; display: block; }
a   { color: inherit; text-decoration: none; }

::-webkit-scrollbar       { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg-surface); }
::-webkit-scrollbar-thumb { background: var(--primary-600); border-radius: 3px; }
```

---

> **Summary:** This design system produces a premium dark glassmorphic e-commerce UI using **Electric Violet** (`#8b5cf6`) + **Cyan** (`#06b6d4`) accents on a **deep space** (`#0a0c14`) background. Every component uses glass utilities, consistent spacing tokens, Outfit typography, and micro-animations to deliver a polished, production-ready storefront.
