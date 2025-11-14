import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartyStackParamList } from '../../../navigation/types';
import { View, Text } from 'react-native';

type Props = NativeStackScreenProps<PartyStackParamList, 'PartyDetail'>;

export default function PartyDetailScreen({ route }: Props) {
  const { partyId } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <Text>{partyId}</Text>
    </View>
  );
}
