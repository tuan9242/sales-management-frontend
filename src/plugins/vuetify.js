import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';


export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2563eb',
          secondary: '#6366f1',
          background: '#f8fafc',
          surface: '#ffffff',
          error: '#ef4444',
          info: '#3b82f6',
          success: '#10b981',
          warning: '#f59e0b',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#b6c4ff',
          secondary: '#b7c8e1',
          background: '#191c20',
          surface: '#2e3135',
          error: '#ffdad6',
          info: '#60A5FA',
          success: '#34D399',
          warning: '#FBBF24',
        },
      },
    },
  },
});
