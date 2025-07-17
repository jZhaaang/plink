import { LinkOverview } from '@/types/models';
import { Text, View } from 'react-native';
import { LinkCard } from './LinkCard';

type Props = {
  linkOverviews: LinkOverview[];
  onPressLink: (partyId: string, linkId: string) => void;
  title?: string;
  showPartyInfo?: boolean;
};

export function LinkListContainer({
  linkOverviews,
  onPressLink,
  title = 'Recent Links',
  showPartyInfo = false,
}: Props) {
  if (linkOverviews.length === 0) return null;

  const sorted = [...linkOverviews].sort((a, b) => {
    if (a.link.is_active !== b.link.is_active) return a.link.is_active ? -1 : 1;
    return new Date(b.link.created_at).getTime() - new Date(a.link.created_at).getTime();
  });

  return (
    <View className="p-4">
      <Text className="text-xl font-bold text-gray-900 mb-4">{title}</Text>
      <View>
        {sorted.map((item) => (
          <LinkCard
            key={item.link.id}
            linkOverview={item}
            onPress={() => onPressLink(item.party.id, item.link.id)}
            showPartyInfo={showPartyInfo}
          />
        ))}
      </View>
    </View>
  );
}
