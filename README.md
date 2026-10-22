# Abhishek Kumar Shah — Portfolio

Personal portfolio of Abhishek Kumar Shah, AI/ML & Backend Engineer (Kathmandu, Nepal).

**Live:** https://abhishekkumarshah.com.np/

## Stack

Hand-written HTML, CSS and vanilla JavaScript. No build step, no frameworks, no trackers.

```
index.html                 # single page: hero, highlights, about, experience, projects, skills, credentials, contact
assets/css/style.css       # design tokens (dark + light), layout, components, reduced-motion + print rules
assets/js/main.js          # theme toggle, scroll-spy, reveal-on-scroll, rotating role line, filters, modal + lightbox
assets/Abhishek_Kumar_Shah_Resume.pdf
assets/img/                # logos and certificate images (see below)
profile.jpg
CNAME                      # custom domain for GitHub Pages - keep this file
```

## Images the page expects in `assets/img/`

| File | Used for |
|---|---|
| `drop-logo.png` | Drop logo (from dropit.club): hero tag and the Drop project card |
| `fusemachines.svg`, `fusemachines-mark.png` | Official Fusemachines logo: hero tag, ShopAssist card, Credentials card |
| `prixa.png` | Prixa logo: hero tag and Credentials card |
| `techfest.png` | Techfest IIT Bombay logo: Credentials card |
| `ran.png` | Robotics Association of Nepal logo: Credentials card |
| `acem.png` | ACEM logo: Education entry |
| `cert-protobytes-2.jpg` | Protobytes Hackathon 2.0 certificate (not yet added): Credentials card + lightbox |

If a file is missing the page falls back to an emoji icon, so nothing breaks. To add another
certificate, copy one `<article class="cred">` block in `index.html`, set `data-img` and the
`<img src>` to the new file, and drop the image in `assets/img/`.

## Resume

The site serves `assets/Abhishek_Kumar_Shah_Resume.pdf`. Its LaTeX source is kept locally
(git-ignored, not published). To update it, rebuild the PDF, save it over
`assets/Abhishek_Kumar_Shah_Resume.pdf` keeping that exact filename, then commit and push.

## Run the site locally

Any static server works:

```
npx serve .
# or
python -m http.server 8080
```

## Updating content

- **Projects:** each `<article class="project">` in `index.html` holds its card text plus a hidden
  `.project__details` block that the modal renders. Tags for the filter buttons live in `data-tags`.
- **Rotating role line:** edit the `data-roles` JSON on `#roleText` in `index.html`.
- **Theme colours:** edit the tokens at the top of `assets/css/style.css`.
