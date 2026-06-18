# Plan — Replace Contact Form with an Obfuscated Email (Frontend-Only)

> **Date:** 2026-06-18
> **Branch:** `original-site`
> **Related:** [2026-06-18-code-review-and-hardening.md](./2026-06-18-code-review-and-hardening.md)
> **Status:** ✅ **Implemented 2026-06-18** — option A (literal hint); tooltip positioned **below** the email per follow-up.

## 1. Objective

Replace the contact-**form** section (`#contact-page-section`) with a static, scrape-resistant **email display + tooltip**, and remove the frontend's dependency on the Express/MySQL backend. The portfolio becomes a **pure static frontend**.

## 2. Current state

- The contact section ([frontend/public/index.html:442-470](../../frontend/public/index.html#L442)) is a `<form id="contactForm">` with name/email/company/phone/message inputs.
- Submission is handled in [frontend/public/script.js:245-281](../../frontend/public/script.js#L245) by a `fetch("http://localhost:8000/submit-form")` to the backend.
- This is the **only** dynamic feature; everything else on the page is static.

## 3. Target UX

- The section heading **"Get in touch"** stays.
- It shows: **`Email: *****@gmail.com`** — the local part is masked.
- On **hover** (mouse), **keyboard focus** (Tab), or **tap/click** (mobile), a **tooltip appears below** the address with the text: **"My first name followed by my last name"**.
- Nothing leaves the browser; no network request.

## 4. Design decisions & assumptions

- **Tooltip text is taken literally** from the request — `"My first name followed by my last name"`. It acts as a hint: a human combines it with the name shown elsewhere on the site to reconstruct the address. *(If you'd prefer the tooltip to show your actual name, e.g. "Amrita Vidhate", or the full real address, that's a one-line change — see §8.)*
- **Email stays masked** as `*****@gmail.com`. The real address is **never** placed in the HTML source, so **no `mailto:` link** (a `mailto:` would re-expose it to scrapers — defeating the purpose).
- The reveal target is a **`<button>`** so it is natively focusable, keyboard-operable, and tappable.
- Hover + keyboard focus are handled in **CSS** (`:hover`, `:focus-visible`); tap/click persistence is handled by a tiny JS class toggle (`.show-tooltip`) with outside-click dismiss.

## 5. Implementation steps

1. **`index.html`** — replace the `<form>` (keep `<hr id="contact-page-section">` and the `<h1>` heading so the nav anchor still works) with the email + tooltip markup.
2. **`style.css`** — delete the now-dead form styles (`.contact-form`, `.form-field`, `.input-text`, `.label`, `.submit-btn`, …); add `.email-line` / `.email-reveal` / `.email-tooltip` (tooltip positioned below, with a pointer arrow; shown on `:hover`, `:focus-visible`, and `.show-tooltip`).
3. **`script.js`** — remove the backend `fetch` submit handler; add a small tap/click toggle + outside-click dismiss.

## 6. Accessibility

- `<button>` is keyboard-focusable; tooltip is associated via `aria-describedby`.
- Reveal works on hover, focus, and tap; dismiss on outside tap / blur.

## 7. Impact on the backend

After this change, **no frontend code calls the backend.** The `backend/` Express service and its MySQL table become **unused** and can be retired in a follow-up. By elimination, this resolves several review-doc findings (hardcoded `localhost`, mixed content, open CORS, no rate-limiting/validation on the form). The review doc is updated to reflect this.

## 8. Test checklist

**Implemented & code-verified:**
- [x] Nav "Contact" still scrolls to the section (anchor `#contact-page-section` retained).
- [x] No backend `fetch` remains — **no network request** on interaction (grep-verified).
- [x] No leftover form markup / CSS / JS references (grep-verified).

**Recommended manual browser check:**
- [ ] Desktop: hover shows tooltip **below** the address; mouse-out hides it.
- [ ] Keyboard: Tab to the address shows the tooltip; blur hides it.
- [ ] Mobile/tap: tap shows; tap elsewhere hides.

## 9. Follow-ups

- [x] Tooltip content confirmed — **option A (literal hint)** chosen.
- [ ] Optionally delete `backend/` and update `Readme.md` + the review doc to "frontend-only". *(Not done this pass — `backend/` left intact pending your go-ahead.)*
