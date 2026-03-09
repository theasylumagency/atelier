# Design System: The Asylum Agency - Landing Page
**Project ID:** 15992028028702676888

## 1. Visual Theme & Atmosphere
The Asylum Agency Landing Page embodies a **Brutalist Luxury** and **Dark Modernism** aesthetic. It feels heavy, imposing, and uncompromisingly premium. The visual language favors absolute contrast and cinematic minimalism. The atmosphere is dense and mysterious but engineered with striking precision, feeling less like a traditional digital interface and more like a high-end digital control center or a stark architectural space.

## 2. Color Palette & Roles
* **Absolute Black (#000000):** The foundational base. Used for the global background and vast negative spaces to create depth and focus.
* **Stark Contrast White (#FFFFFF):** Used for primary typography, massive display headers, and definitive iconography. Ensures cutting legibility against the dark void.
* **Muted Zinc-Subtle (#A1A1AA / Tailwind zinc-400):** Used for secondary body typography and descriptive text, providing hierarchy without overpowering the brutalist headers.
* **Deep Charcoal Void (#050505):** Used as a secondary background layer or subtle contrast element to break up pure black sections, often utilized behind video overlays.
* **Whisper White Muted (#FFFFFF at 5% / 10% opacity):** Used for borders, subtle dividers, and hover states to create the faintest structural definition without adding solid lines.

## 3. Typography Rules
* **Primary Display Headers (Space Grotesk / Syne equivalent):** Unapologetically massive, often completely uppercase, and exceptionally bold. Used to command attention and dictate the hierarchy. Characterized by tight tracking (spacing) to form solid blocks of text.
* **Secondary / Body Text (Inter or system sans-serif):** Clean, utilitarian, and legible. Used for descriptions and technical details. Characterized by wide tracking (e.g., `tracking-[0.2em]`) and a lighter weight to provide a sharp textural contrast against the heavy headers.

## 4. Component Stylings
* **Buttons:** Stark and commanding. Often sharp, squared-off edges (Pill-shaped or completely sharp depending on exact variant). They rely heavily on solid black/white inversion on hover.
* **Cards/Containers:** Highly structured. Rely on very fine, low-opacity white borders (`border-white/5` to `border-white/10`) rather than solid backgrounds. Corners range from subtly rounded to sharp right angles.
* **Wireframes / Imagery Integrations:** Graphic elements have an architectural, Vienna modernism feel. They use thin strokes and negative space rather than filled shapes.

## 5. Layout Principles
* **Extreme Negative Space:** The design aggressively utilizes empty black space to isolate text and imagery, forcing the user's full attention onto singular elements.
* **Asymmetrical Tension:** Elements often play against standard grid alignment, using massive shifts in scale (huge text next to tiny text) to create visual interest.
* **Cinematic Reveal:** The layout expects elements to fade in gracefully (opacity shifts) and scale up from the void, ensuring the scrolling experience feels orchestrated and deliberate.
