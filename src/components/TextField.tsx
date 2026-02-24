import {
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  header?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export default function TextField({
  header,
  left,
  right,
  containerStyle,
  inputStyle,
  ...rest
}: TextFieldProps) {
  return (
    <>
      {header && <Text style={styles.header}>{header}</Text>}
      <View style={[styles.container, containerStyle]}>
        {left}
        <TextInput
          {...rest}
          placeholderTextColor="#94a3b8"
          style={[styles.input, inputStyle]}
        />
        {right}
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  header: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.iconSecondary,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderInput,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    marginLeft: theme.spacing.sm,
    flex: 1,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
  },
}));
