# Portfolio interface audit

Reviewed October 28, 2026 using the locally installed Jakub Krehel better-interface domain skills and better-typography. Repository reference: https://github.com/jakubkrehel/skills.

## Scope and coverage

Detailed source review of the homepage, shared header, project cards, skills carousel, music exchange, and global CSS. Browser inspection of the homepage at the default desktop viewport and 320px width, including computed heading styles, search input size, footer contrast, and the loaded pinboard accessibility tree. About and Loadout received limited source inspection only. Games, the 404 flow, full backend behavior, and every API response were excluded.

Stack: Next.js App Router, React, TypeScript, custom CSS and CSS modules, Lucide icons, Fontsource. Project conventions found in README.md and PORTFOLIO_PERSONALITY.md. No AGENTS.md was found. The existing editorial and terminal visual direction is treated as intentional.

| Domain | Evidence inspected | Result |
| --- | --- | --- |
| Accessibility | Header, homepage controls, carousels, music forms, reduced-motion guards, browser accessibility tree | Findings; full keyboard and screen-reader walks not verified |
| Layout | Global breakpoints, mobile navigation, 320px homepage, carousel structure | Limited coverage; zoom and RTL not verified |
| Writing | Homepage labels, music loading/empty/error strings, search and pin API error strings | Findings |
| Typography | Global CSS, font imports and face declarations, computed heading/input/clock styles; About CSS source | Findings |
| Colors | Global tokens and computed footer foreground/background | One measured failure; full palette not verified |
| UI | Hover/transition declarations, carousel behavior, tilt/reveal/canvas source | Findings; slow-motion replay not verified |

## Practices already followed

- Native links and buttons support ordinary navigation and activation. Icon navigation controls have accessible names. The project archive exposes its expanded state and has a visible disclosure control.
- The homepage uses a coherent h1/h2/h3 outline. At desktop, the hero is 82px, the work heading 58px, and its featured project title 52px. The inspected hierarchy descends.
- Declared line heights are unitless. Descriptive paragraphs generally use 1.6 to 1.7. No thin weights below 18px were found in the inspected source.
- Fonts have fallback stacks. Fontsource faces use font-display: swap. The existing variable Garamond face covers weights 400 to 800.
- Layout uses minmax(0, 1fr), min-width: 0, responsive wrapping, and multiple content breakpoints. Mobile navigation contains its overscroll.
- Tilt cards check reduced motion and coarse pointers. The canvas checks reduced motion. CSS disables most animation under reduced motion. Music auto-scroll checks the preference on mount.
- Music status text uses polite live regions, and name/note fields have wrapping labels. Duplicate outer music rails remove their links from the tab order.
- Selection stays enabled except during dragging. Brand selection colors are defined. Hover transitions name their properties rather than using transition: all.

## Original findings

One row per root cause. Locations are relative to F:/Github/portfoliowebsite. This table records the original implementation. The resolution section below supersedes these open findings.

| Severity | Domain | Location | Before | After | Why |
| --- | --- | --- | --- | --- | --- |
| HIGH | Accessibility | components/portfolio-home.tsx:106 | Skills scrollLeft advances every 24ms without a motion preference check | Disable autoplay under reduced motion and react to preference changes | Reduced-motion requirement: CSS cannot stop JavaScript scrolling |
| HIGH | Accessibility | components/portfolio-home.tsx:106; components/music-exchange.tsx:233 | Both carousels scroll indefinitely; dragging pauses only temporarily | Add a persistent Pause/Resume button, and pause while focus is within the carousel | WCAG 2.2.2: users need control over nonessential moving content lasting over five seconds |
| HIGH | Colors | app/globals.css:227 | Footer text #707a80 on #090b0d measures 4.4912:1 | Adjust the footer text token to reach at least 4.5:1, then remeasure | WCAG 1.4.3: the 9px footer text narrowly fails normal-text contrast |
| HIGH | Writing | components/music-exchange.tsx:320,400,635; app/api/music/search/route.ts:67 | Error strings such as Search is unavailable and The board is taking a quiet minute give no recovery instruction; board failure also displays No songs pinned yet | Name the failure, retain entered content, and provide retry instructions or an explicit Retry action; distinguish load failure from an empty board | Errors must explain recovery; a failed request does not establish that the board is empty. Error branches confirmed in source; not induced in the browser |
| MEDIUM | Typography | app/globals.css:181,190 | Search is 13px; name and note use 11px, with no mobile override | Use a 16px mobile input size, either directly or through the skill's scaled rendering recipe | Inputs at 16px on mobile: smaller text triggers iOS Safari focus zoom. Search size confirmed at 320px; iOS device behavior not tested |
| MEDIUM | Typography | app/layout.tsx:3; app/globals.css:42,53,54,136,164 | Only IBM Plex Mono 400 is loaded; mono UI requests 500, 600, 650 and 700 | Load the used static weights and map unsupported intermediate weights to shipped faces, or use the loaded 400 weight | Load the faces the design uses: synthetic bolding changes the intended glyph shapes |
| MEDIUM | Typography | app/globals.css:14,106,127,165,181,183,190,196,227 | Global type uses px, with 8 to 9px labels/status text and 11 to 13px form and descriptive text | Define a small rem scale; bring ordinary body descriptions toward 1rem, controls toward 0.875rem, and captions toward 0.8125rem; reserve smaller values for justified exceptions | Size floors and type scale: important text is unusually small, and px does not follow the browser's default font-size preference |
| MEDIUM | Accessibility | components/music-exchange.tsx:173,627 | The middle rail repeats records to fill the loop; runtime showed 174 accessible song links for 29 unique songs | Expose each record once to keyboard and assistive technology; make every additional visual repeat inert | Repeated focus stops make keyboard navigation unnecessarily long. Hiding only the two outer rails does not remove duplicates within the middle rail |
| MEDIUM | Accessibility | components/music-exchange.tsx:361,551 | Custom note validation changes a live message without aria-invalid, an error association, or focus on the field | Associate the error with the textarea, set aria-invalid when invalid, and focus the failing field on submit | Form error identification should connect the failure with its field rather than relying on an untied announcement |
| LOW | Typography | app/globals.css:54,191; components/site-header.tsx:84 | Changing clock and character-count values have no numeric variant | Apply font-variant-numeric: tabular-nums to changing numeric values | Tabular numbers explicitly preserve digit width. IBM Plex Mono already has fixed-width glyphs, so the clock's current layout risk is small |
| LOW | UI | app/globals.css:26,33,195 | Hover movement is generally outside a hover-capability query; only selected project effects have coarse-pointer overrides | Gate hover-only movement with @media (hover: hover) | Hover effects should apply only to hover-capable pointers. A stuck touch hover state was not reproduced |

## Verification

- npm run lint passed with exit code 0.
- npm run dev -- --hostname 127.0.0.1 started successfully after retry. The homepage loaded with live pinboard content and a random Spotify song.
- Desktop screenshot and computed styles inspected. Main heading sizes descend in the sampled sections.
- At a 320px viewport, the search input still computed to 13px. The document did not show page-level horizontal overflow in the measured state. This is not a complete clipping audit.
- Footer contrast calculated from computed RGB foreground and solid background, using sRGB relative luminance. Result: 4.4912074393:1, below 4.5:1.
- The public rail exposed 174 song links for 29 unique Spotify destinations. Duplicate outer rails were excluded from that count.
- Browser viewport override reset. Audit preview server stopped. Next.js's generated next-env.d.ts route-import change was reverted.
- Not verified: full 200% zoom, iOS focus behavior, screen-reader announcements, every keyboard stop/focus ring, forced colors, pseudo-localization, RTL, all contrast pairs, exact rendered font face selection, 60 to 75 character measures throughout, long-string truncation recovery throughout, induced network errors, music submission, About/Loadout runtime behavior, games and 404.

## Resolution

The requested fixes were implemented on October 28, 2026.

| Finding | Resolution | Verification |
| --- | --- | --- |
| Reduced motion | Both carousel timers check the current preference before advancing, including changes after mount; skills keyboard scrolling also respects it | Source inspected; preference emulation not run |
| Pause controls | Both carousels have persistent Pause/Resume buttons, and pause during focus within or while the page is hidden | Skills Pause toggled in browser; scroll position stayed at 2656 across observations |
| Footer contrast | Footer foreground changed to #879198 | Computed contrast is now 6.1333:1 |
| Error recovery | Search and submission errors give retry guidance; board errors have their own heading and Retry button | Source inspected; network failures not induced |
| Mobile inputs | Music search, name and note use 1rem | Search computed to 16px at 320px width |
| Font faces | Plex Mono 500, 600 and 700 imported; intermediate mono requests normalized to shipped weights | Imports and declarations inspected; TypeScript passed |
| Text size system | Global font sizes converted to rem, tiny text raised to at least 12px, shared captions to 13px, descriptive body roles to 16px; smoothing moved to root | Desktop and 320px rendered checks; all sampled h1/h2 scroll widths equal client widths |
| Duplicate links | Only the first instance of each pin remains accessible and keyboard reachable, including repeats inside the middle rail | 29 keyboard links and 29 unique destinations in browser |
| Note validation | Short-note validation focuses the textarea and exposes aria-invalid and an associated error; visible character requirements added | Source inspected; no public note submitted |
| Numeric stability | Clock and character count use tabular-nums | CSS inspected |
| Touch hover | Hover selectors are gated behind hover-capable media queries; focus selectors remain outside those queries | CSS inspected; real touch-device behavior not tested |

Follow-up checks: npm run lint and npx tsc --noEmit passed. The development preview compiled and loaded. At 320px, the document had no measured page-level horizontal overflow and search was 16px. This does not establish complete WCAG conformance or cover every game layout affected by shared typography.

## Verdict

Approve for the source fixes to the reported findings and the sampled homepage browser checks. Full screen-reader testing, 200% zoom, reduced-motion emulation, real iOS input focus, error-state runtime tests, and About/Loadout/game runtime review remain Not verified.
