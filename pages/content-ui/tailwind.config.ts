import baseConfig from '@extension/tailwindcss-config';
import { withUI } from '@extension/ui';

export default withUI({
  ...baseConfig,
  content: ['./src/**/*.{ts,tsx}', './extension/**/*.{ts,tsx}', './public/index.html'],
});
