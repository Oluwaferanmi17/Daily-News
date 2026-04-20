# Daily Brief — Mobile App Design

## Overview

**Daily Brief** is a calm, minimal "daily intelligence" app that delivers one smart news summary card every morning. Unlike overwhelming news feeds, Daily Brief feels intentional and curated—"if you only read one thing today, read this."

**Target User:** Professionals and informed citizens who want to stay updated without information overload, with a focus on Nigeria and global events.

**Core Philosophy:** Calm, minimal, intentional. One card per day. 30–60 seconds read time.

---

## Screen List

### 1. **Home Screen (Daily Card)**
- **Primary Content:** The day's smart card summary
  - Date header (e.g., "April 11 Brief")
  - 3–5 key stories (bullet points, 1–2 lines each)
  - "Why this matters" context line under each story
  - Optional "Tap to expand" for full details
- **Functionality:**
  - Swipe down to refresh (pull-to-refresh)
  - Tap story to see expanded view
  - Tap archive icon to view history
  - Tap settings icon to manage preferences
- **Visual:** Card-based design, clean typography, plenty of whitespace

### 2. **Story Detail Screen**
- **Primary Content:** Full story details
  - Headline
  - Summary (2–3 paragraphs)
  - "Why this matters" (full explanation)
  - Source / timestamp
  - Related category tag
- **Functionality:**
  - Back button to return to home
  - Share button
  - Save to favorites (future)

### 3. **Personalization / Categories Screen**
- **Primary Content:** Category selection toggles
  - Tech
  - Business
  - Politics
  - Sports
  - Local (Nigeria-focused)
  - Global (default)
- **Functionality:**
  - Toggle categories on/off
  - Save preferences
  - Preview how curation will change
- **Visual:** Simple toggle switches, minimal text

### 4. **Archive / History Screen**
- **Primary Content:** Timeline of past daily cards
  - Scrollable list of dates
  - Each date shows summary preview (3 stories)
  - Tap to view full card for that date
- **Functionality:**
  - Scroll through past weeks/months
  - Tap date to expand that day's card
  - Search by date or keyword (future)
- **Visual:** Timeline-like layout, chronological order (newest first)

### 5. **Settings Screen**
- **Primary Content:** App preferences
  - Notification time (morning, default 7 AM)
  - Dark/Light mode toggle
  - About / Help
  - Privacy & Terms
- **Functionality:**
  - Change notification time
  - Toggle dark mode
  - View app version
- **Visual:** Simple list, standard iOS settings style

---

## Primary Content & Functionality by Screen

### Home Screen (Daily Card)
**What appears:**
- Large, prominent card with today's date
- 3–5 news stories in bullet format
- Each story: headline (1 line) + "Why this matters" (1 line)
- Subtle background, clean typography
- Archive and Settings buttons in header

**What user can do:**
- Pull down to refresh (fetch today's card if not yet loaded)
- Tap a story to see full details
- Tap archive to browse past cards
- Tap settings to change preferences
- Tap notification bell to manage notification settings

### Story Detail Screen
**What appears:**
- Full headline
- 2–3 paragraph summary
- "Why this matters" section (full explanation)
- Source and timestamp
- Category badge (e.g., "Tech", "Nigeria")

**What user can do:**
- Read full story
- Tap back to return to home
- Share story (via system share sheet)
- Mark as read (visual indicator)

### Personalization Screen
**What appears:**
- List of 6 category toggles
- Brief description of each category
- "Save" button at bottom
- Preview of how selection affects curation

**What user can do:**
- Toggle categories on/off
- See real-time preview of which stories will be included
- Save changes
- Reset to defaults (future)

### Archive Screen
**What appears:**
- Scrollable timeline of past daily cards
- Each date shows 3-story preview
- Dates in reverse chronological order (newest first)
- Infinite scroll (load more as user scrolls)

**What user can do:**
- Scroll through past weeks
- Tap a date to expand and see full card for that day
- Tap a story to see full details
- Search by date (future)

### Settings Screen
**What appears:**
- Notification time picker (default 7 AM)
- Dark/Light mode toggle
- App version
- Links to Privacy, Terms, Help

**What user can do:**
- Change notification delivery time
- Toggle dark mode
- View app info
- Access help/support

---

## Key User Flows

### Flow 1: Morning Routine (Primary)
1. User wakes up, opens app
2. Home screen displays today's Daily Card
3. User reads 3–5 stories (30–60 seconds)
4. User taps one story to expand and read full details
5. User returns to home
6. User closes app (satisfied)

### Flow 2: Personalization Setup (Onboarding)
1. User opens app for first time
2. App shows onboarding: "Choose your interests"
3. User toggles categories (Tech, Business, Politics, Sports, Local, Global)
4. User taps "Save"
5. App returns to home with personalized card

### Flow 3: Archive Browsing
1. User opens app
2. User taps Archive button
3. Archive screen shows timeline of past cards
4. User scrolls to find a specific date
5. User taps a date to expand that day's card
6. User reads stories from that date
7. User returns to today's card

### Flow 4: Notification Engagement
1. User receives push notification at 7 AM: "Your Daily Brief is ready"
2. User taps notification
3. App opens to Home screen with today's card
4. User reads and engages

### Flow 5: Settings Management
1. User opens app
2. User taps Settings
3. User changes notification time to 8 AM
4. User toggles dark mode
5. User returns to home

---

## Color Choices

### Brand Colors (Calm, Minimal Palette)

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0a7ea4` | Accent, buttons, highlights |
| **Background** (Light) | `#ffffff` | Main background |
| **Background** (Dark) | `#151718` | Dark mode background |
| **Surface** (Light) | `#f5f5f5` | Card backgrounds, elevated surfaces |
| **Surface** (Dark) | `#1e2022` | Dark mode card backgrounds |
| **Foreground** (Light) | `#11181C` | Primary text (dark) |
| **Foreground** (Dark) | `#ECEDEE` | Primary text (light) |
| **Muted** (Light) | `#687076` | Secondary text, timestamps |
| **Muted** (Dark) | `#9BA1A6` | Dark mode secondary text |
| **Border** (Light) | `#E5E7EB` | Dividers, subtle borders |
| **Border** (Dark) | `#334155` | Dark mode borders |
| **Success** | `#22C55E` | Positive states, checkmarks |
| **Warning** | `#F59E0B` | Alerts, important notices |
| **Error** | `#EF4444` | Errors, destructive actions |

### Design Rationale
- **Primary Blue** (`#0a7ea4`): Professional, calm, trustworthy—ideal for news/intelligence
- **Neutral Palette:** Whites, grays, and dark grays create a clean, minimal feel
- **Dark Mode:** Reduces eye strain for evening reading; uses slightly warmer tones
- **Accent Colors:** Green for success, amber for warnings, red for errors—standard iOS conventions

---

## Typography

- **Headlines:** System font (SF Pro Display), 24–28pt, bold
- **Body Text:** System font (SF Pro Text), 16pt, regular
- **Secondary Text:** System font, 14pt, regular, muted color
- **Timestamps:** System font, 12pt, muted color

---

## Interaction Patterns

### Press Feedback
- **Primary Buttons:** Scale to 0.97 + light haptic
- **Cards/List Items:** Opacity 0.7 on press
- **Icons:** Opacity 0.6 on press

### Haptics
- **Button tap:** Light impact
- **Toggle:** Medium impact
- **Success:** Success notification
- **Error:** Error notification

### Animations (Subtle)
- **Card fade-in:** 250ms on load
- **Pull-to-refresh:** Gentle spinner
- **Story expand:** Smooth height transition (200ms)

---

## Accessibility

- **Text Contrast:** All text meets WCAG AA standards
- **Touch Targets:** Minimum 44pt × 44pt for interactive elements
- **Dark Mode:** Full support with high contrast
- **Screen Reader:** All interactive elements labeled
- **Haptics:** Optional, can be disabled in settings

---

## Future Enhancements

1. **Lockscreen Widget:** Show today's top 3 stories without opening app
2. **Favorites:** Save stories for later reading
3. **Search:** Find stories by keyword or date
4. **Share:** Share daily card as image or link
5. **Offline Mode:** Cache recent cards for offline reading
6. **Deep Linking:** Share individual stories via URL
7. **Trending:** Show most-read stories from community
8. **Digest Email:** Weekly digest sent via email

---

## Summary

Daily Brief is a **calm, minimal news intelligence app** designed for busy professionals who want to stay informed without overwhelm. The design prioritizes **clarity, intentionality, and ease of use**—one card per day, 30–60 seconds to read, with optional depth for those who want more.

The app feels like a **first-party iOS app**, following Apple's Human Interface Guidelines with clean typography, generous whitespace, and subtle interactions. Dark mode is fully supported, and the color palette is professional and trustworthy.
