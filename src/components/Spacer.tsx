import { View } from 'react-native';

type Props = { size?: number };

export default function Spacer({ size = 12 }: Props) {
  return <View style={{ height: size, width: size }} />;
}
