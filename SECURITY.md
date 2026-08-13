# Security and production deployment

## Deployment requirements

- Deploy through a Git-based static host or upload only public site files. Never publish `.git`, `.agents`, `.codex`, source artwork, local environment files, or editor metadata.
- The live domain currently uses Hostinger. The included `.htaccess` applies the security headers, HTTPS redirect, dotfile rules, compression, caching, and custom 404 response on that host.
- The included `_headers` file provides equivalent settings if the site is later moved to Netlify or Cloudflare Pages.
- Force HTTPS at the host and redirect all HTTP traffic to HTTPS.
- Verify that `https://appydesign.in/.git/HEAD` and other dotfile paths return `404` or `403`.
- Keep the Google Form destination access restricted to the intended Appy Design account and periodically review spam responses.

## Implemented browser protections

- Content Security Policy with explicit script, style, font, image, connection, frame, and form destinations.
- Clickjacking protection through `frame-ancestors 'none'` and `X-Frame-Options: DENY`.
- MIME sniffing prevention, a restrictive Permissions Policy, referrer controls, and one-year HSTS.
- No inline executable JavaScript or inline event handlers.
- Sandboxed hidden iframe for Google Form submission.
- Client-side validation, an anti-bot honeypot, and offline submission handling.
- Security contact metadata at `/.well-known/security.txt`.

## Important limitation

The inquiry form posts directly from the browser to Google Forms. Client-side anti-spam controls can reduce basic automated submissions but cannot provide strong rate limiting or bot verification. Strong protection requires a server-side form proxy or a managed challenge such as Cloudflare Turnstile.
