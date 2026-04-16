import { StyleSheet } from 'react-native-unistyles';
import { lightTheme, darkTheme } from './theme';

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
