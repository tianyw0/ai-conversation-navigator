import 'webextension-polyfill';
import { globalThemeStorage } from '@extension/storage';

globalThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
