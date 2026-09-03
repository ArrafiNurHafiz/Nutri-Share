# PRD NUTRI-SHARE — UI/UX Design System

---

## 11.1 Color Palette

### Brand Colors

```
Primary:   #2D7A4F  (Hijau)
Light:     #52C77F  (Hijau Muda)
Dark:      #1a5a3e  (Hijau Gelap)
Accent:    #1565C0  (Biru)
Warning:   #F5A623  (Oranye)
Danger:    #E53935  (Merah)
```

### Neutral Colors

```
Background: #F7F4EE (Krem)
Card:       #FFFFFF (Putih)
Text:       #2C2C2C (Dark Gray)
Border:     #E5E7EB (Gray-200)
Text Sec:   #6B7280 (Gray-500)
```

### Dark Mode

```
Background: #0F172A (Slate-900)
Card:       #1E293B (Slate-800)
Text:       #F1F5F9 (Slate-100)
Border:     #334155 (Slate-700)
```

## 11.2 Typography

| Font              | Weight        | Usage               |
| ----------------- | ------------- | ------------------- |
| Inter             | 400, 500, 600 | Body, button, input |
| Plus Jakarta Sans | 700, 800      | Heading (h1-h6)     |
| JetBrains Mono    | 400, 500, 700 | Angka statistik     |

## 11.3 Component Patterns

| Component       | CSS Classes                                                                          |
| --------------- | ------------------------------------------------------------------------------------ |
| Card            | `bg-white rounded-2xl shadow-sm border border-gray-100`                              |
| Card Hover      | `card-hover`: `translateY(-2px)` + shadow increase                                   |
| Button Primary  | `bg-[#2D7A4F] text-white py-3 rounded-xl font-bold shadow-md`                        |
| Button Outline  | `border border-gray-300 text-gray-700 py-2 rounded-xl font-bold`                     |
| Input           | `border border-gray-200 p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#52C77F]` |
| Badge           | `text-xs font-bold px-3 py-1 rounded-full`                                           |
| Hero            | `bg-gradient-to-br from-[#2D7A4F]/10 via-transparent to-[#1565C0]/10`                |
| CTA Section     | `bg-[#2D7A4F] py-16 text-white text-center`                                          |
| Divider Section | `bg-white py-16 border-y border-gray-100`                                            |

## 11.4 Layout

| Element         | Width/Padding                       |
| --------------- | ----------------------------------- |
| Hero content    | `max-w-4xl mx-auto px-6`            |
| Section content | `max-w-5xl mx-auto px-6`            |
| Full width      | `max-w-7xl mx-auto px-6`            |
| Section padding | `py-16` (desktop), `py-12` (mobile) |

## 11.5 Animations

| Element     | Transition                  | Duration      |
| ----------- | --------------------------- | ------------- |
| Page enter  | `fade + translateY(8px)`    | 200ms         |
| Card hover  | `translateY(-2px)` + shadow | 300ms ease    |
| Navbar hide | `translateY(-100%)`         | 300ms         |
| Skeleton    | `shimmer`                   | 1.5s infinite |
| Pulse dot   | `opacity 1→0.5→1`           | 2s infinite   |
| Mobile menu | slide from right            | spring        |

## 11.6 Dark Mode Implementation

CSS variables in `:root` dan override via `html.dark` selector:

```css
:root {
  --bg-primary: #f7f4ee;
  --bg-secondary: #ffffff;
  --text-primary: #2c2c2c;
}
html.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
}
```
