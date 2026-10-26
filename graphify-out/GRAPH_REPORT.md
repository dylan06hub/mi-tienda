# Graph Report - mi-tienda  (2026-10-26)

## Corpus Check
- Corpus is ~4,145 words - fits in a single context window. You may not need a graph.

## Summary
- 129 nodes · 221 edges · 11 communities (8 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Project Dependencies and Config
- Cart State Management
- TypeScript Configuration
- Product Catalog and Cards
- Cart Page and Checkout Utils
- App Layout and Navigation
- NPM Scripts
- Next.js Setup Docs
- Next.js Agent Rules
- Graphify Command

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `next` - 13 edges
3. `getProducto()` - 11 edges
4. `CartProvider()` - 10 edges
5. `CartView()` - 10 edges
6. `useCart()` - 7 edges
7. `formatearPrecio()` - 7 edges
8. `ProductCard()` - 6 edges
9. `AddToCart()` - 5 edges
10. `guardar()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `CarritoPage()` --calls--> `CartView()`  [EXTRACTED]
  app/carrito/page.tsx → components/CartView.tsx
- `RootLayout()` --calls--> `CartProvider()`  [EXTRACTED]
  app/layout.tsx → components/CartProvider.tsx
- `Home()` --calls--> `ProductCard()`  [EXTRACTED]
  app/page.tsx → components/ProductCard.tsx
- `generateMetadata()` --calls--> `getProducto()`  [EXTRACTED]
  app/productos/[id]/page.tsx → lib/productos.ts
- `ProductosPage()` --calls--> `ProductCard()`  [EXTRACTED]
  app/productos/page.tsx → components/ProductCard.tsx

## Import Cycles
- None detected.

## Communities (11 total, 3 thin omitted)

### Community 0 - "Project Dependencies and Config"
Cohesion: 0.10
Nodes (27): eslintConfig, dependencies, next@16.4.3, react@19.3.0, react-dom@19.3.0, devDependencies, eslint@^9, eslint-config-next@16.4.3 (+19 more)

### Community 1 - "Cart State Management"
Cohesion: 0.17
Nodes (18): handleAgregar(), avisar(), CartContext, CartContextValue, CartProvider(), agregar(), cambiarCantidad(), quitar() (+10 more)

### Community 2 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 3 - "Product Catalog and Cards"
Cohesion: 0.21
Nodes (10): Home(), metadata, ProductosPage(), ProductCard(), productos, productosDestacados, nextConfig, next (+2 more)

### Community 4 - "Cart Page and Checkout Utils"
Cohesion: 0.24
Nodes (12): CarritoPage(), metadata, generateMetadata(), ProductoPage(), AddToCart(), CartView(), getProducto(), buscarVariante() (+4 more)

### Community 5 - "App Layout and Navigation"
Cohesion: 0.27
Nodes (7): geistMono, geistSans, metadata, RootLayout(), useCart(), Footer(), Header()

### Community 6 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 7 - "Next.js Setup Docs"
Cohesion: 0.40
Nodes (5): create-next-app, Geist Font, next/font, Next.js Project, Vercel Deployment

## Knowledge Gaps
- **6 isolated node(s):** `Graphify Command`, `Build or query knowledge graph`, `Next.js Agent Rules`, `create-next-app`, `Geist Font` (+1 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 49 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Product Catalog and Cards` to `Project Dependencies and Config`, `Cart Page and Checkout Utils`, `App Layout and Navigation`?**
  _High betweenness centrality (0.214) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `CartProvider()` (e.g. with `agregar()` and `cambiarCantidad()`) actually correct?**
  _`CartProvider()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Graphify Command`, `Build or query knowledge graph`, `Next.js Agent Rules` to the rest of the system?**
  _6 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Project Dependencies and Config` be split into smaller, more focused modules?**
  _Cohesion score 0.0960591133004926 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Project Dependencies and Config` to `Cart State Management`, `Product Catalog and Cards`, `Cart Page and Checkout Utils`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._