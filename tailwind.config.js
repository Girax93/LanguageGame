/** @type {import('tailwindcss').Config} */

// ── Theme tokens ───────────────────────────────────────────────────────────
// Calm, warm, minimal (light mode). Tweak the palette here and the whole app
// follows. Solid fills only — no gradients/glows.
const colors = {
  page: '#f1e9da', // warm cream page background
  sand: '#e8dcc6', // inset surfaces: keyboard keys, progress track, chips
  card: '#fbf6ec', // cards / panels
  cream: '#fbf6ec', // text on brown
  line: '#e4d8c4', // soft 1px borders
  brown: {
    DEFAULT: '#7b5d44', // primary (buttons, accents, active)
    light: '#a07f60',
    dark: '#6b5038', // hover
  },
  espresso: '#3b2f26', // primary text
  taupe: '#9d8c79', // muted text
  sage: '#6f8a5f', // success (muted)
  terracotta: '#b15a4a', // error (muted)
  ochre: '#c08f43', // focus / energy accent
  given: '#bcab94', // given / disabled brown
};

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Refined serif for display (headings, the big word, letter tiles).
        serif: ['Fraunces', '"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.1rem',
        '3xl': '1.4rem',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '60%': { transform: 'scale(1.01)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'focus-drop': {
          '0%': { transform: 'translateY(-6px) scale(1.35)', opacity: '1' },
          '55%': { transform: 'translateY(3px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(0.8)', opacity: '0.3' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.25s ease-out',
        shake: 'shake 0.4s ease-in-out',
        'slide-up': 'slide-up 0.35s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'focus-drop': 'focus-drop 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};
