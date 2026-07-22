-- ─────────────────────────────────────────────────────
-- seed_content_blocks.sql
-- Run in the Supabase SQL editor for a NEW client project
-- (after duplicating the template repo and before connecting
-- to Vercel). Seeds the content_blocks table with generic
-- starter copy — the client edits these later via admin.html.
--
-- Reconstructed from Tammy's live content_blocks table on
-- [today's date], since the original file wasn't in the repo.
-- Personal/bio content below is GENERIC PLACEHOLDER TEXT, not
-- Tammy's real content — product copy (hero, Why It Works,
-- hormone symptoms) is kept as real working defaults since
-- none of it is Tammy-specific.
--
-- TO REGENERATE THIS FILE from any project's current data
-- (e.g. after adding new content block keys), run in that
-- project's Supabase SQL editor:
--
--   select
--     '  (' || quote_literal(key) || ', ' || quote_literal(coalesce(label, key)) || ', ' || quote_literal(value) || '),' as line
--   from content_blocks
--   order by key;
--
-- Copy the output rows, wrap with the insert/on-conflict lines
-- below, then swap in generic placeholders for anything personal
-- to that client before saving as the template's version.
-- ─────────────────────────────────────────────────────

insert into content_blocks (key, label, value) values
  ('about_bio_paragraph_1', 'About Bio Paragraph 1', '[Paragraph 1 — the client''s background and what led them to this work]'),
  ('about_bio_paragraph_2', 'About Bio Paragraph 2', '[Paragraph 2 — the client''s mission or approach]'),
  ('about_bio_paragraph_3', 'About Bio Paragraph 3', '[Paragraph 3 — the client''s closing statement or call to connect]'),
  ('about_bio_quote', 'About Bio Quote', '[Add a short personal quote from the client here.]'),
  ('about_credentials', 'About Section Credentials', 'Add a credential or highlight
Add another credential or highlight
Add another credential or highlight'),
  ('about_intro_body', 'About Section Body', 'Add the client''s story here — what led them to this work, who they help, and why it matters to them. This shows up right on the homepage, so make it personal.'),
  ('about_page_intro', 'About Page Intro', '[Add a 1–2 sentence introduction here — who the client is and what they do]'),
  ('about_quote_text', 'About Section Quote', '[Add a short personal quote here.]'),
  ('about_title', 'About Section Title', 'Wellness. Faith. Purpose.'),
  ('cta_body', 'CTA Strip — Body Text', 'Slenderiix™ + Xceler8™ drops. Natural, plant-based, hormone-free. Includes diet guide, program booklet, and personal support. Free US shipping.'),
  ('cta_headline', 'CTA Strip — Headline', 'Start your transformation today.'),
  ('hero_body', 'Hero — Body Text', 'More energy. Better sleep. Balanced hormones. Real results — for women and men ready to reclaim their vitality in the second half of life.'),
  ('hero_eyebrow', 'Hero — Eyebrow Text', 'Partner.Co Wellness'),
  ('hero_headline', 'Hero — Headline', 'Feel like
*yourself* again.'),
  ('hormone_cortisol_symptoms', 'Hormones — Cortisol Symptoms', 'High blood pressure, poor sleep, belly fat, inability to control stress, anxiety'),
  ('hormone_estrogen_symptoms', 'Hormones — Estrogen Symptoms', 'Fatigue, hot flashes, dryness, weight gain, irregular periods, PCOS'),
  ('hormone_insulin_symptoms', 'Hormones — Insulin Symptoms', 'Blood sugar spikes, increased thirst, poor circulation, slow wound healing, energy crashes'),
  ('hormone_melatonin_symptoms', 'Hormones — Melatonin Symptoms', 'Sleep imbalance, insomnia, active brain at night, fatigue during the day'),
  ('hormone_testosterone_symptoms', 'Hormones — Testosterone Symptoms', 'Bone health, sexual dysfunction, muscle mass loss, fatigue, libido, belly fat'),
  ('hormone_thyroid_symptoms', 'Hormones — Thyroid Symptoms', 'Hot/cold regulation, constipation, dry skin, excess weight gain or loss, hair loss, fatigue'),
  ('letter_body', 'Welcome Letter — Body', 'Every person reaches a moment where they feel the quiet pull toward more: more health, more clarity, more purpose. Not out of striving, but out of a quiet knowing.

You were designed to grow. You were made to rise.

[Add 2-3 more paragraphs here in the client''s own voice — their mission, what brought them to this work, and what they want visitors to feel.]

Let''s step into it together.'),
  ('letter_greeting', 'Welcome Letter — Greeting', 'Hello Beautiful One,'),
  ('why_01_body', 'Why It Works — Benefit 1 Body', 'Addresses the root cause of stubborn weight — hormone imbalance — rather than just counting calories.'),
  ('why_01_title', 'Why It Works — Benefit 1 Title', 'Balances Hormones'),
  ('why_02_body', 'Why It Works — Benefit 2 Body', 'Homeopathic ingredients target appetite control and food addiction patterns at the source.'),
  ('why_02_title', 'Why It Works — Benefit 2 Title', 'Curbs Cravings'),
  ('why_03_body', 'Why It Works — Benefit 3 Body', 'Supports thyroid and adrenal function so you feel genuinely energized — not artificially stimulated.'),
  ('why_03_title', 'Why It Works — Benefit 3 Title', 'Increases Energy'),
  ('why_04_body', 'Why It Works — Benefit 4 Body', 'Raises metabolic rate naturally so your body burns more efficiently throughout the day.'),
  ('why_04_title', 'Why It Works — Benefit 4 Title', 'Boosts Metabolism'),
  ('why_05_body', 'Why It Works — Benefit 5 Body', 'Ingredients like B-12 and Ashwagandha support mental clarity, reduce anxiety, and lift your overall outlook.'),
  ('why_05_title', 'Why It Works — Benefit 5 Title', 'Boosts Mood'),
  ('why_06_body', 'Why It Works — Benefit 6 Body', 'Thyroidinum and Fucus Vesiculosus directly support thyroid function — a key driver of weight and energy.'),
  ('why_06_title', 'Why It Works — Benefit 6 Title', 'Supports Thyroid'),
  ('why_07_body', 'Why It Works — Benefit 7 Body', 'Rhodiola Rosea and specific homeopathic ingredients target excess fat and lower cortisol — the belly fat hormone.'),
  ('why_07_title', 'Why It Works — Benefit 7 Title', 'Targets Belly Fat'),
  ('why_08_body', 'Why It Works — Benefit 8 Body', 'Chronic stress raises cortisol which stores fat. The drops help regulate this cycle naturally.'),
  ('why_08_title', 'Why It Works — Benefit 8 Title', 'Lowers Cortisol')
on conflict (key) do update set value = excluded.value;
