# IBOOKEE Website Renewal - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Magazine + Social Platform Hybrid)
- Primary inspiration: Airbnb (warm, human-centric spaces) + Medium (editorial content) + Instagram (community feed)
- Rationale: This is an experience-focused platform showcasing "living spaces with people" that needs to communicate warmth, credibility, and active community life

**Core Design Principles:**
1. **Human-First Visual Language:** Every section prioritizes people over buildings
2. **Editorial Flow:** Magazine-like content presentation with strong visual hierarchy
3. **Social Proof Integration:** Community activity is front and center, not buried

---

## Typography System

**Font Stack:**
- Primary: 'Pretendard' (Korean), 'Inter' (Latin) - Modern, highly readable
- Display/Headers: 'Pretendard' Bold/Semibold
- Body: 'Pretendard' Regular (16px base size for readability)

**Hierarchy:**
- Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold, leading-tight
- Section Titles: text-3xl md:text-4xl lg:text-5xl, font-semibold
- Subsection Headers: text-xl md:text-2xl, font-semibold
- Body Text: text-base md:text-lg, leading-relaxed (1.75 line height)
- Captions/Metadata: text-sm, font-medium

---

## Layout & Spacing System

**Spacing Primitives:** Use Tailwind units of 4, 8, 12, 16, 20, 24
- Component padding: p-4, p-8, p-12
- Section vertical spacing: py-16 md:py-20 lg:py-24
- Container max-widths: max-w-7xl (main content), max-w-prose (long-form text)

**Grid Strategy:**
- Project Gallery: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-8
- Instagram Feed: Masonry-style grid-cols-2 md:grid-cols-3 lg:grid-cols-4, gap-4
- Business Solutions: grid-cols-1 lg:grid-cols-3, gap-12
- Mobile-first: All grids collapse to single column on mobile

---

## Page-Specific Layouts

### Homepage
1. **Hero Section** (h-[85vh]): Full-width image with residents engaging in community activities, centered headline overlay with blurred backdrop button
2. **Mission Statement**: Single-column, max-w-4xl, centered, generous py-20
3. **Featured Projects**: 3-column grid with hover-triggered project details
4. **Community Feed Preview**: 4-column Instagram-style grid with "View More" CTA
5. **Impact Statistics**: Horizontal scrolling cards on mobile, 4-column grid on desktop
6. **CTA Section**: Split layout - left text, right form (입주 대기 신청)

### About Us
- **CEO Message**: Two-column layout - left: portrait photo (sticky), right: long-form text
- **History Timeline**: Vertical timeline with milestone cards, alternating left/right
- **Partners**: Logo grid, grid-cols-3 md:grid-cols-5 lg:grid-cols-6

### Business (B2B/B2G Focus)
- **Overview**: Hero with infographic showing "Public + Profitable" Venn diagram
- **Solution Cards**: Large cards with before/after imagery, case study callouts
- **ESG Performance**: Dashboard-style metrics layout with icons and numbers

### Space (Projects)
- **Filter Bar**: Sticky horizontal pill navigation (Youth, Single, Social Mix, Local Anchor)
- **Map/Gallery Toggle**: Switch between map view and card grid
- **Project Detail Modal**: Full-screen overlay with image carousel + details sidebar

### Community
- **Social Stream**: Pinterest-like masonry grid, infinite scroll
- **Support Programs**: Card-based layout with application forms in expandable drawers
- **Events Calendar**: Month view with event cards

### Insight
- **Articles Grid**: Magazine-style with featured article (2-column span), smaller articles (1-column)
- **Article Page**: Single-column max-w-prose, large pull quotes, inline images

### Contact
- **Three-Column Layout**: 입주 대기 | Business 제휴 | Recruit
- Each column has dedicated form with icon header

---

## Component Library

**Navigation:**
- Desktop: Horizontal menu with dropdowns, sticky on scroll
- Mobile: Hamburger → full-screen overlay menu

**Cards:**
- Project Cards: Aspect ratio 4:3, image + overlay gradient with title/location
- Instagram Cards: Square aspect ratio, hover shows caption overlay
- Solution Cards: Horizontal layout (image left, content right) on desktop

**Forms:**
- Input fields: Rounded-lg, border, focus ring, px-4 py-3
- Buttons: Rounded-full, px-8 py-3, font-semibold
- Textareas: Min-h-32

**Feed Components:**
- Instagram Tile: Square with overlay showing likes/comments on hover
- Article Preview: Thumbnail + headline + excerpt + date

**Interactive Elements:**
- Tabs: Underline indicator, smooth transition
- Accordions: For FAQ/program details
- Modals: Centered, max-w-4xl, backdrop blur

---

## Images

**Hero Images:**
- **Homepage Hero:** Large lifestyle shot of diverse residents cooking together in shared kitchen or gathering in communal lounge. Warm evening lighting, authentic candid moment. Size: Full-width, h-[85vh]
- **About Us Hero:** CEO portrait in IBOOKEE property with residents in background. Professional yet approachable. Size: 50% width on desktop, full-width mobile
- **Business Page Hero:** Aerial view of IBOOKEE property in urban context showing integration with neighborhood. Size: Full-width, h-[60vh]

**Section Images:**
- **Project Gallery:** Exterior/interior shots emphasizing human scale and community spaces. Each project needs 3-5 high-quality photos
- **Community Feed:** Direct pull from Instagram API - authentic resident photos
- **History Timeline:** Historical photos from each major milestone
- **Partners Section:** Official partner logos (국토부, LH, HUG, 서울시)

**Content Images:**
- **Solution Cards:** Before/after comparison shots for each development type
- **Team Section:** Professional headshots on transparent/blurred background
- **Article Thumbnails:** 16:9 ratio, minimum 1200px width

---

## Animations (Minimal, Purposeful)

- **Scroll-triggered fade-in:** For section entries only
- **Image zoom on hover:** Project cards and Instagram feed
- **Smooth scrolling:** For anchor links
- **NO auto-playing carousels or distracting parallax effects**

---

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- Form inputs have visible labels and error states
- Skip to main content link
- Semantic HTML5 structure (header, nav, main, section, article, footer)
- Alt text for all images (descriptive for content, decorative marked as such)

---

## Responsive Breakpoints

- Mobile: < 768px (single column, stacked navigation)
- Tablet: 768px - 1024px (2-column grids, simplified layouts)
- Desktop: > 1024px (full multi-column grids, expanded navigation)