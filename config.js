// ─────────────────────────────────────────────────────
// SITE CONFIGURATION
// Edit this file to customize the site for each client.
// All pages read from this file automatically.
// ─────────────────────────────────────────────────────

var SITE_CONFIG = {

  // ── BRAND ──────────────────────────────────────────
  brand: {
    name:       'Tammy Maltby Melchisedeck',    // Full name shown in nav and footer
    shortName:  'Tammy',                         // First name used in personal copy
    tagline:    'Wellness. Faith. Purpose.',      // Shown in footer under name
    email:      'tammymelchisedeck@gmail.com',   // Contact email
    venmo:      '@tammy-melchisedeck',           // Venmo handle for payments
  },

  // ── COLORS ─────────────────────────────────────────
  // Change these to instantly rebrand the entire site
  colors: {
    cream:      '#FAF7F2',   // Page background
    linen:      '#F2EDE4',   // Section backgrounds
    sand:       '#E8DFD0',   // Borders and dividers
    gold:       '#B89A6A',   // Primary accent color
    goldLight:  '#D4B896',   // Light accent
    ink:        '#2C2520',   // Dark backgrounds and text
    inkMid:     '#5C4F44',   // Body text
    inkLight:   '#8C7E72',   // Subtle text
    sage:       '#7A8C72',   // Secondary accent (success states)
  },

  // ── FONTS ──────────────────────────────────────────
  fonts: {
    serif:      'Cormorant Garamond',   // Headlines and display text
    sans:       'DM Sans',              // Body text and UI
    // Google Fonts URL — update if changing fonts
    googleUrl:  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap',
  },

  // ── SOCIAL MEDIA ───────────────────────────────────
  social: {
    facebook:   'https://www.facebook.com/share/1Js62grMD4/?mibextid=wwXIfr',
    instagram:  'https://www.instagram.com/tammymmelchisedeck?igsh=dGQxcjQyMmEzbDcx',
    tiktok:     'https://www.tiktok.com/@tammymmelchisedec?_r=1&_t=ZT-9297iK4kplv',
  },

  // ── IMAGES ─────────────────────────────────────────
  images: {
    hero:       'images/TammyJulieWEB-6432.webp',       // Homepage hero
    about:      'images/RedDressArmsneedretouch.webp',  // About page photo
    dropsFeature: 'images/tmpv33k6gwn.webp',            // Drops section feature image
    partnerLogo: 'images/unnamed.webp',                 // Partner.Co logo in footer
    favicon:    'images/favicon.png',                   // Browser tab icon
    loginBg:    'images/VirtualBackground01.jpg',       // Admin login background
  },

  // ── HERO SECTION ───────────────────────────────────
  hero: {
    eyebrow:    'Partner.Co Wellness',
    headline:   'Feel like\n*yourself*\nagain.',
    body:       'More energy. Better sleep. Balanced hormones. Real results — for women and men ready to reclaim their vitality in the second half of life.',
    imgPosition: '45%',   // Vertical position of hero image (0% = top, 100% = bottom)
  },

  // ── SUPABASE ───────────────────────────────────────
  supabase: {
    url:    'https://nzqdmsbxwghkqowajmvs.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cWRtc2J4d2doa3Fvd2FqbXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3Njk0MjQsImV4cCI6MjA5NjM0NTQyNH0.aqdvA_ytnkeSvg4hmLqC1zces0aIFZcxkHrrN7k7atk',
  },

  // ── FORMSPREE ──────────────────────────────────────
  formspree: {
    newsletter: 'YOUR_NEWSLETTER_FORM_ID',   // Footer email signup
    chat:       'YOUR_CHAT_FORM_ID',         // Chat bubble contact form
    order:      'YOUR_ORDER_FORM_ID',        // Order form submission
  },

  // ── NAVIGATION ─────────────────────────────────────
  nav: {
    links: [
      { label: 'The Drops',    href: '#drops' },
      { label: 'Results',      href: '#results' },
      { label: 'Testimonials', href: '#testimonials' },
      { label: 'About',        href: 'about.html' },
    ],
  },

  // ── TRUST BAR ──────────────────────────────────────
  trustBar: [
    '100% Natural & Plant-Based',
    'Hormone-Free Formula',
    'Free US Shipping',
    'Up to ¾ lb Lost Per Day',
  ],

  // ── RESULTS STATS ──────────────────────────────────
  results: [
    { stat: '½ lb',  label: 'Lost Per Day — Women', desc: 'Consistent, daily fat loss that adds up fast — without starvation or extreme restriction.' },
    { stat: '¾ lb',  label: 'Lost Per Day — Men',   desc: 'Men on the program see even faster results, with drops designed to support male metabolism.' },
    { stat: '3×',    label: 'Daily Doses',           desc: 'Simple routine: drops under the tongue before each meal. No injections. No prescriptions. No fuss.' },
  ],

  // ── CTA STRIP ──────────────────────────────────────
  cta: {
    headline: 'Start your transformation today.',
    body:     'Slenderiix™ + Xceler8™ drops. Natural, plant-based, hormone-free. Includes diet guide, program booklet, and personal support. Free US shipping.',
  },

  // ── FOOTER ─────────────────────────────────────────
  footer: {
    disclaimer: 'These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease. Applicable to U.S. only.',
  },

};
