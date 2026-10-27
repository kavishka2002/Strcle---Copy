# PaperBloom Stationery & Creative Studio

A local-first Next.js app for creating Sri Lankan school name stickers and notebook cover labels. Sign-in accounts and each bookshop's designs, templates, and uploaded images stay in separate local browser storage; no cloud service is used.

## Start on Windows

Use Node.js 20.9 or later. In PowerShell from the project folder:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Keep the local development server running while using the app. For a production build:

```powershell
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

## Windows desktop (local testing)

The desktop wrapper runs the production Next.js standalone server on a loopback-only local address and opens it in a secure Electron window. It does not use `next dev`, static export, or the hosted website to load the main application. The standalone setting is enabled only for desktop builds; the existing website build configuration remains the default. The existing bookshop SVG is converted to a multi-size Windows icon during desktop preparation. The chosen local port is saved in the LittlePaper user-data folder so IndexedDB and localStorage keep the same browser origin across restarts. User data is kept in Electron's per-user application data, not in the installation folder.

From PowerShell in the copied project folder, run:

```powershell
npm install
npm run desktop:dev
```

The first desktop build stages the complete `public` folder (about 965 MB in this copy) alongside Next.js's standalone server so the existing APIs that scan `public` continue to work. This requires additional build disk space and means the initial Windows installer will be large. The installer includes the assets once; do not remove PDFs or artwork to reduce its size unless the affected features are intentionally changed and tested.

Local papers, artwork, fonts, and saved work are available without internet after installation. Searching the Department of Examinations catalog and downloading newly published papers, as well as opening official external links, require internet access. The service worker is not registered in the Electron window to avoid caching stale application responses; the website's browser behavior is unchanged.

The **Sinhala Hodiya** section is available from the Production navigation. It includes the Sinhala vowels, consonants, and vowel-sign combinations, with optional Sinhala numerals, English letters, and English numbers. One font-size and tile-shape setting applies uniformly to every worksheet letter. Choose individual characters with their checkboxes and select **Print selected** to print only those letters (including just one), or choose **Print full Sinhala Hodiya** to print all Sinhala vowel, consonant, and combination sections without English or numerals. Each letter can also have its own bundled Unicode font and text/tile colours. Adjust the A4 grid, tile size, and spacing, then print using the desktop PDF preview.

Build a local Windows x64 NSIS installer with `npm run desktop:installer`. This creates an installer in `release/` without publishing it. Packaged Windows builds check GitHub Releases at startup and every six hours. Update downloads require a connection; choosing **Later** keeps the current app running and suppresses repeat notifications for that version. Updates are downloaded only after the user chooses the download button, and installed only after **Install and Restart**. Development builds do not check for releases.

## Publishing desktop updates

The configured release feed is the GitHub Releases page for `kavishka2002/Strcle---Copy`. Pushing source code alone does not publish an installer. The `Publish Windows desktop release` workflow runs only for semantic version tags such as `v1.0.1`, verifies that the tag matches `package.json`, builds the existing standalone desktop app and NSIS installer, then publishes the installer and Electron Builder update metadata (`latest.yml` and blockmap files). The existing application ID and per-user application data location are preserved; updating does not replace customer-created designs or local account data.

For the first production release, verify that `package.json` still says `1.0.0` and that the `v1.0.0` tag is not already in use. Commit and push the source first, then push the matching tag:

```powershell
npm ci
npm run desktop:installer
git status --short
git add -A
git commit -m "Prepare PaperBloom desktop auto-updates"
git push -u origin main
git tag v1.0.0
git push origin v1.0.0
```

The installer command above is a local build check; the tag push is what starts the publishing workflow. If `v1.0.0` is already used, increment the package version and use that matching unused tag instead.

For a subsequent patch release, start from a clean working tree and increment the package version first (this also updates the lockfile). Then make the source changes, review the working tree, and push a matching tag:

```powershell
npm version patch --no-git-tag-version
# Make the source changes for this release.
git status --short
git add -A
git commit -m "Release PaperBloom v1.0.1"
git push origin main
git tag v1.0.1
git push origin v1.0.1
```

Replace `v1.0.1` in the commit and tag commands with the actual new version. Review `git status --short` before `git add -A` so unrelated local files are not included. Do not reuse a release tag.

Before tagging, ensure GitHub Actions are enabled for the repository and open **Settings → Actions → General → Workflow permissions**. Allow **Read and write permissions** so the workflow's `GITHUB_TOKEN` can create and upload a GitHub Release. The workflow declares the narrower `contents: write` permission; no personal access token or manually configured secret is needed. A version-to-version test requires the older version to have been installed from a published release and the newer version to have its own published release.

## Offline bookshop accounts

With no provisioned administrator seed, the first run creates a local demo administrator `P321 / 1234`; the first sign-in requires a new password of 10–128 characters. The included shared `P321` seed currently uses `1234` as requested. This is a very weak password and is not recommended for a publicly accessible deployment; anyone who knows it can sign in. The seed stores a salted PBKDF2-SHA-256 hash, never the plaintext password. Once signed in, the app has no password change or reset control. To change it, generate a new source seed and deploy; on initialization the source seed updates the existing matching administrator while keeping its local workspace ID.

Customer accounts are provisioned **only in source code**; the application has no account-creation, account-import, or password-reset action. To create the shared administrator seed or a customer seed:

1. Run `node scripts/generate-local-account-seed.mjs` from an interactive terminal. For the shared account, enter ID `admin-p321`, username `P321`, your bookshop name, and role `admin`. Enter a password of 10–128 characters in the hidden prompt. Do not send or commit the password.
2. Add the generated record to `provisionedAccountSeeds` in [`src/data/local-account-seeds.ts`](./src/data/local-account-seeds.ts). The record contains a salted hash and salt, not the plaintext password.
3. Run `npm run build`, then import/connect this GitHub repository in Vercel and deploy it as a Next.js project. Vercel supports the app's Next.js API routes; GitHub Pages does not. The same source-seeded `P321` credentials will then be initialized on localhost and Vercel in their separate browser profiles. Local user data is still not shared between them.

The source also provisions a free trial account `T123 / 1234`. Trial users can create and edit name stickers for preview, but cannot print or access the Past Paper Finder. Other paid actions remain restricted. The dashboard displays the Rs. 1,499 full-access price and WhatsApp contact `0767660922`. This account is added alongside existing accounts; it does not replace them. Since accounts and trial restrictions are enforced in the browser, they are not a server-side licensing boundary; the trial password is intentionally simple, so do not use the trial account for private data.

The source also provisions the `Danu` shop account for `Danu communication`. It has the standard shop workspace access; account management remains administrator-only.

The seed format is:

```ts
{
  id: "shop-322",
  username: "P322",
  shopName: "Example Bookshop",
  ownerContact: "",
  passwordHash: "<32-byte PBKDF2-SHA-256-310000 hash, base64>",
  salt: "<16-byte random salt, base64>",
  active: true,
  createdAt: 1735689600000,
  role: "admin",
  mustChangePassword: false
}
```

After signing in, an administrator can open **Account management** to view locally known accounts, change shop names/usernames, activate or deactivate customer accounts, and export account metadata. The application does not allow account users or administrators to change/reset passwords. Exported JSON contains salted password hashes (never plaintext passwords), so treat it as sensitive. It is a backup/report only; the app does not import it or create accounts from it.

Each account gets its own IndexedDB workspace for sticker designs, templates, assets, print orders, CV drafts, and saved past papers. On the first administrator sign-in, existing workspace records are copied to the administrator's new workspace; the original database is left in place. Existing local recent lists and preferences are copied as well. New bookshop accounts start with empty workspaces. Account data is specific to the browser profile and does not synchronize to other devices.

The production app registers a service worker that caches the app shell and loaded application assets for offline reopening after the first online load. Sign-in and locally saved work continue offline after the app has loaded and initialized. Use the production build over HTTPS (or localhost) to install the PWA; the development server does not register the service worker. Online source searches and uncached remote content still require internet access.

This is browser-local authentication, not a server security boundary. Someone with full access to the computer, browser profile, or developer tools can alter local storage or bypass the UI. The demo account and local password hashes do not provide commercial licensing, centralized identity, cross-device synchronization, or secure recovery. Those require a trusted backend and should be designed separately before commercial deployment.

## Language and dialogs

The app starts in Sinhala. Use the language control in the top bar to switch between Sinhala and English; the choice is saved in this browser and remains selected after reloading. Use the theme control in the login screen, top bar, or Settings to switch between light and dark mode; the preference is saved per bookshop in this browser. The shared interface translations cover navigation, common actions, sticker editing and print controls, and the main colouring and past-paper library workflows. User-created text, saved filenames, source metadata, and some detailed technical guidance remain unchanged.

Rename, delete, and clear-order actions use an in-app accessible dialog rather than the browser's plain prompt/confirmation pop-up. Cancel or Escape leaves the saved item or print order unchanged.

## Create and edit

1. Choose **Create sticker** or **Create cover label**.
2. Enter a student name. Grade, subject, and school are optional. The colorful **Tiger Trail** artwork is the default; choose **Browse all** to see the illustration-based template gallery.
3. Select one or more subjects if needed. Each selected subject is generated as a separate sticker variant while sharing the student name, grade, school, and design.
4. Select text on the canvas to change its content, font, size, colour, alignment, spacing, wrapping, box dimensions, and position. Long names and school names automatically scale and wrap to fit; the editor warns when a label would still be too small or too long. Drag text or uploaded illustrations to place them.
5. Use **Add field** in the editor for up to three optional details such as Student ID, Class, School Year, or Teacher. Edit each field's label and value, hide it, or remove it. Empty custom fields are not printed.
6. Adjust border, background, sticker size, corner shape, and cutting outline in the editor. Changes are saved locally as you work; **Save design** also confirms the save.
7. Use **Save as template** to keep the current style for future designs. In the template gallery, favourites can be toggled and user-created templates can be deleted.

Built-in artwork templates use a prominent student name followed by a readable school name, grade, and subject. The gallery previews use sample student and school text so the hierarchy is visible before selecting a style. Font fitting and wrapping are shared between the editor preview and A4 print output.

The text editor provides independent English and Sinhala font selectors for each field. English fonts include Poppins, Nunito, Inter, Lato, Montserrat, Quicksand, Playfair Display, Fredoka, Baloo 2, and Roboto; Sinhala choices include Noto Sans Sinhala, Noto Serif Sinhala, and Abhaya Libre. The font files are bundled locally under the SIL Open Font License; each package's copyright notice and license are included in `public/font-licenses`. Noto Sans Sinhala is the final script fallback. The editor loads the selected font faces before printing.

Choose **English**, **Sinhala Keyboard**, or **Singlish to Sinhala** as the text input mode. Sinhala Keyboard mode leaves operating-system keyboard/IME input, pasted text, and Unicode sequences untouched. Singlish conversion updates live while typing in a name, school, or custom-subject field; it does not rewrite a school or student name just because Sinhala is the subject display language. To correct an ambiguous transliteration, switch to Sinhala Keyboard or English mode and edit the resulting text normally.

In Singlish mode, uppercase `T`, `D`, `N`, `L`, and `Sh` choose the corresponding Sinhala retroflex consonants (for example, `Ta` → `ට`). Common conjunct sequences such as `sri`, `kri`, and `ksha` are rendered with Sinhala joiners. When Sinhala is the subject display language, the grade printed on the sticker is localized as `5 ශ්‍රේණිය`; the English and bilingual display choices remain available.

The template gallery keeps the original built-in and saved templates under **Existing templates**. The separate **New Designs** collection includes eleven original styles, **Custom Size Sticker**, twenty-seven image-led sticker designs, and twenty new CSS/SVG-only name-tag templates in four categories: Professional, IT & Technology, Simple & Minimal, and Decorative & Creative. The vector-only label designs use no image assets and are bundled for offline use. The Creative Circle Buddy is a 72 mm round sticker with editable name/school/grade/subject text and a decorative double-ring frame. Each artwork style has its own palette, decorative frame, text placement, and illustration layout. The new illustrations are bundled in `public/custom-art`; the apple-and-pencil asset remains in `public/starter-art`. The supplied Spider-Man image was not included because permission to redistribute it could not be established. The supplied artwork's licenses have not been independently verified. The custom-size option lets you choose another sticker style without changing its source template, or enter decimal width and height values in inches or centimeters. Custom dimensions are converted to millimeters internally and remain physically unchanged when switching units. Supported dimensions are 20–200 mm wide and 15–280 mm high. Existing templates and artwork are not replaced or modified.

Designs and templates are stored in IndexedDB. The **Recent designs** page keeps the latest 10 references in localStorage; older designs remain available under **Saved designs**. Use the JSON export/import controls to make a portable backup of an individual design.

## Import your PNG artwork

The app includes nine supplied transparent PNG illustrations in `public/starter-art` (tiger, rose, Santa, bunny, penguin, fairy, mermaid, princess pig, and elf), plus the apple-and-pencil illustration for the Scholar’s Apple style. Twenty-six image-led designs use artwork in `public/custom-art`. Each bundled image is copied into the local IndexedDB asset library on first launch, so template images appear in the gallery, editor, and print output and can be reused. The supplied blank-looking rose file and duplicate tiger image were not added as separate options.

Open **PNG assets** and choose **Upload artwork** to add more files. PNG, JPG/JPEG, and WebP images up to 12 MB are accepted and their original file blobs are retained in IndexedDB. Transparent PNGs are not flattened. Select **Add to sticker** to use the default placement or one of the placement chips for a specific position. Select **Set background** to use artwork as the sticker background. In the editor, use the illustration controls to resize, rotate, duplicate, replace, reorder, or remove a decorative image. Bundled starter artwork is protected from deletion; user-uploaded assets remain manageable in the library.

## A4 print

Enter the copy quantity in the creation form or adjust **Copies per subject** in A4 print studio. Each selected subject is printed on its own sticker, with the student name, grade, school, and design repeated. Subjects are laid out in order and cycle until each has the requested quantity (for example, Sinhala → Mathematics → Science → Sinhala → Mathematics → Science for 2 copies each). The default A4 safe margin is 4 mm and the default cutting gap is 2.5 mm; both are adjustable. Cards retain their chosen physical dimensions. The sheet preview reports rows/columns, total stickers, and total pages, and provides page navigation. **Print A4 sheet** waits for local fonts and images before opening the browser print dialog. Select A4 paper, 100%/Actual Size, and disable browser headers and footers. To save a PDF, choose **Microsoft Print to PDF** or **Save as PDF** in the browser print dialog. Print and measure a test page first because printer margins and driver settings can change physical output.

For **Custom Size Sticker**, the editor and print summary show the exact dimensions in the selected unit and millimeters. Stickers are placed at that physical size; the layout adds pages rather than shrinking them to fit. For reliable sizing, use A4 paper, set scaling to 100% or **Actual size** (not **Fit to page**), turn off headers and footers, and verify a test sticker with a ruler before printing a customer order.

## CV Builder

Open **CV Builder** from the sidebar to create a CV using 24 layouts, including six new designs: Modern Navy Professional, Minimal Professional, Modern Developer, Elegant Corporate, Modern Sidebar, and Premium Minimalist. The navy showcase design uses a real two-column document with a navy gradient sidebar, profile photo, editable contact details, and career sections. Search by template or career type, filter by category, and preview a template in the live document before selecting it. The form and live document preview share the same local draft; drafts, text styles, custom sections, and the optional photo are saved in IndexedDB in this browser. Select any displayed text in the preview to edit its content and independent typography in the **Edit Preview Text** panel. Use Advanced mode for exact font sizing, line height, letter spacing, width, spacing, indentation, wrapping, and optional background/border styling. The header controls adjust long-name width and fit behavior, photo position, dimensions, crop, and spacing. Custom text sections can be added, edited, and reordered without changing the built-in CV fields.

**Download PDF** opens the browser print dialog; choose **Save as PDF** there. The CV remains selectable text, and the app waits for its selected local fonts and photo to load before printing. Use A4 paper and verify the layout in print preview, especially for long or multi-page CVs. Local browser storage is not a backup and is not shared across browsers or devices.

## Custom Print Studio

Open **Custom Print Studio** in the sidebar to create number ranges, English or Sinhala letters, original mini illustrations, labels in several shapes, or reward stickers. Each maker opens its own saved design preview after generation. Print that design separately, or explicitly add it to the existing mixed A4 order; maker output and the mixed order remain separate until combined. Number Sticker Maker makes numeric ranges, while **Alphabet & Letter Maker** supports English A–Z, digits, mixed values, and Unicode Sinhala input. Shape text starts as editable “Your label”; clear it for plain colour shapes or enter multiple lines to create different labels. Uploaded artwork can be reused from the existing local PNG asset library. Designs and their A4 orientation, margin, gap, calibration-page, and cutting-guide settings are stored separately in IndexedDB; the latest 10 opened designs are also listed from localStorage.

The builder keeps sticker dimensions at their requested size and paginates when the current A4 sheet is full. It rejects items that cannot fit within the printable area instead of scaling them down. Text automatically fits and wraps within each label; a warning appears when the estimated print size falls below 8 pt. Optional cutting guides are dashed outlines. The optional 50 mm calibration square is printed on its own first page and included in the page count. Print using A4 and 100% / **Actual Size**, disable browser headers and footers, and check the calibration square with a ruler; printer margins and driver behavior vary.

## Sinhala Documents & Forms Library

Open **Documents & Forms** in the sidebar to search the nine categories and 30 Sinhala document templates. Select a template, complete its relevant fields, and edit the generated text before saving or previewing the A4 page. Saved drafts use the account's existing local IndexedDB workspace and are stored only when **මෙම උපාංගයේ සුරකින්න** is selected; they are not placed in URLs or sent to a server. The recent list shows the latest eight saved drafts, and each can be reopened or deleted.

**PDF and printing:** the export action opens the browser print dialog after loading the bundled Noto Sans Sinhala font. Choose **Save as PDF** in that dialog to download a selectable PDF, or choose a printer. The document uses A4 portrait with 20 mm margins and can flow onto additional pages. This uses the browser's print renderer rather than a server-side PDF generator; output depends on the browser and printer. A physical printer was not calibrated as part of this implementation.

**Official forms and legal use:** the forms directory links directly to verified official agency pages and records the last-check date; it does not copy or recreate government forms. Official links can change and should be rechecked before use. Generated letters are drafts and are not official certificates. Affidavit and agreement templates are explicitly marked as drafts; legal review, witnesses, notarization or other formalities may be required depending on the document. The library is informational and does not provide legal advice.

## Past Paper Finder

Open **Past Paper Finder** from the sidebar, select O/L, A/L, or Grade 5 Scholarship, and choose the year, subject, medium, and paper type. **Find & Download** queries the official Department of Examinations public paper catalog through a fixed Next.js server adapter. When the catalog explicitly identifies all selected metadata and provides a direct PDF, the app downloads that published URL, verifies the response type, size and `%PDF-` signature, then stores the bytes in IndexedDB. The server route accepts only catalog-listed HTTPS PDF links on `doenets.lk`, revalidates each candidate against the catalog, and checks every redirect destination. Downloads are limited to 50 MB and three redirects.

**Verified source support and limitations:** the Department catalog endpoint `https://doenets.lk/cms/api/resources?isEnabled=1&rowCount=0&type=PAPA` is publicly accessible and supplies real direct PDF URLs. A published PDF URL was verified to return HTTP 200 and `application/pdf`. However, the Department's current O/L/A/L records commonly contain only exam and year titles, language-specific links, and opaque filenames—not subject or marking-scheme metadata. For those records, the finder deliberately shows **Manual Download Required** instead of guessing a subject code. No Grade 5 record was found in the current catalog snapshot. The public e-Thaksalawa legacy course-search URL currently serves an informational page, so it is also marked manual-only. This implementation therefore downloads only an exact metadata match if one is published; it does not claim that every selected paper can be automatically matched. Sources that do not expose exact metadata remain available via their official homepage, with manual PDF import as a fallback.

The library supports searching, filtering, sorting, previewing, opening, printing, exporting, changing the display title, and deleting with confirmation. Exact source links and SHA-256 checksums are used to distinguish saved copies; a different version is retained separately and never silently overwrites an existing PDF. Saved blobs persist in this browser profile across reloads, separately from files exported to the computer. Browser storage is not a backup: clearing site data or changing browser/device can remove or separate the library. Use **Choose PDF to import** for permitted papers from manual-only sources; imports receive the same size and PDF-signature checks.

## Picture Colouring Library

Open **Picture Colouring Library** from the sidebar to browse the Grade 1 image sheets in `public/Grade 1/Title */` and the existing PDFs in `public/පින්තුර/පින්තුර`. Grade folders and their image files are discovered automatically; new grades can use the same `Grade N/Title N title/` layout. Grade 1 title numbers and Sinhala labels are defined in `src/lib/coloring-sheets.ts`, where Sinhala labels and title search terms for later grades can also be added. Search accepts Sinhala and the romanized Singlish names in the image filenames; title groups stay in curriculum order. Use the grade selector, category chips, or name sort to narrow results. Images have separate thumbnail and preview views and print on an A4 page, fitted without cropping; printer margins may vary by device. PDFs keep their PDF.js page preview and open in the browser viewer for printing or saving. Recent searches and recently opened/print-requested sheet IDs are stored in localStorage and can be cleared. The PDF.js Apache 2.0 notice is included with the other local notices in `public/font-licenses`.

## Language and offline notes

The bundled Singlish engine's WebAssembly file is served from `public/singlish_core_bg.wasm`; no external service is used. Ambiguous or uncommon transliterations may need manual correction after conversion. The text input mode does not switch the Windows keyboard layout: add/enable Sinhala under Windows **Settings → Time & language → Language & region**, then use **Win + Space** if you prefer the system keyboard. The main interface assets and data are local after installation, but this project does not register a service worker or package a standalone executable: the local Next.js server must be running to open the app.

Subjects can be searched by English or Sinhala names. Long combined subject lists are centered, wrapped, and given a smaller starting font size in the editor; the print sheet uses one subject label per sticker.

## Current limitations

- Uploaded asset blobs are local to the browser profile and are not embedded when exporting a design JSON; import artwork separately on another browser/device before importing a design that uses it.
- The bundled subject options and Sinhala names are editable suggestions, not a curriculum claim. Grade 12–13 streams are an editable selection plus subject suggestions; no school-specific curriculum rules are assumed.
- Subject suggestions can be edited by grade band; individual school curriculum rules and prescribed subject combinations are not modeled.
- Singlish conversion is explicit and dictionary-aware, but ambiguous transliterations and uncommon spellings may require manual editing.
- Text-box dimensions, wrapping, and styling are editable; long strings that cannot fit even at the minimum print size are flagged for correction. Undo/redo is not implemented.
- Asset categories can be assigned from the provided category list; creating/renaming category names is not implemented.
- Physical printer calibration has not been tested; measure a test print before production.
- Templates retain text formatting, border settings, and image references; referenced assets must remain in the local asset library.
#   p a p e r b o o m d e s k t o p v e r s i o n  
 