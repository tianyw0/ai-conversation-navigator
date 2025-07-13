import baseConfig from '@extension/tailwindcss-config';
import { withUI } from '@extension/ui';

export default withUI({
  ...baseConfig,
  darkMode: 'class', // 'media(跟随系统)' or 'class'
  content: ['./src/**/*.{ts,tsx}', './extension/**/*.{ts,tsx}', './public/index.html'],
});
