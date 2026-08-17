/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        route: 'var(--color-route)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'focus-ring': 'var(--color-focus-ring)',
      },
      borderRadius: {
        control: 'var(--radius-control)',
        panel: 'var(--radius-panel)',
        sheet: 'var(--radius-sheet)',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        panel: 'var(--shadow-panel)',
        sheet: 'var(--shadow-sheet)',
      },
      fontSize: {
        'wg-page-title': ['var(--text-page-title)', { lineHeight: 'var(--leading-page-title)', fontWeight: '700' }],
        'wg-section-title': ['var(--text-section-title)', { lineHeight: 'var(--leading-section-title)', fontWeight: '650' }],
        'wg-body': ['var(--text-body)', { lineHeight: 'var(--leading-body)', fontWeight: '400' }],
        'wg-body-secondary': ['var(--text-body-secondary)', { lineHeight: 'var(--leading-body)', fontWeight: '400' }],
        'wg-label': ['var(--text-label)', { lineHeight: 'var(--leading-label)', fontWeight: '650' }],
        'wg-building-code': ['var(--text-building-code)', { lineHeight: 'var(--leading-label)', fontWeight: '750', letterSpacing: '0' }],
      },
      spacing: {
        touch: 'var(--size-touch-target)',
      },
    },
  },
  plugins: [],
}
