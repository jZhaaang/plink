import { View, ViewProps, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface DividerProps extends Omit<ViewProps, 'style'> {
  style?: ViewStyle;
}

export default function Divider({ style, ...rest }: DividerProps) {
  return <View style={[styles.line, style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  line: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
}));
