import { View, ViewProps, ViewStyle } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

type SpacingKey =
  keyof (typeof import('../styles/theme').lightTheme)['spacing'];

interface StackProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  gap?: SpacingKey;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  flex?: number;
  wrap?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Stack({
  children,
  gap,
  align,
  justify,
  flex,
  wrap,
  style,
  ...rest
}: StackProps) {
  const { theme } = useUnistyles();

  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: 'column',
          gap: gap ? theme.spacing[gap] : undefined,
          alignItems: align,
          justifyContent: justify,
          flex,
          flexWrap: wrap ? 'wrap' : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Row({
  children,
  gap,
  align,
  justify,
  flex,
  wrap,
  style,
  ...rest
}: StackProps) {
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        { ...rest },
        {
          flexDirection: 'row',
          gap: gap ? theme.spacing[gap] : undefined,
          alignItems: align,
          justifyContent: justify,
          flex,
          flexWrap: wrap ? 'wrap' : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
