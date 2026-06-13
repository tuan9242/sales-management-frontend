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
          primary: '#00236f',
          secondary: '#505f76',
          background: '#f8f9ff',
          surface: '#ffffff',
          error: '#ba1a1a',
          info: '#36b6fb',
          success: '#34D399',
          warning: '#FBBF24',
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
