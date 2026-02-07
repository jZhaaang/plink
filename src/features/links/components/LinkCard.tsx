import { Pressable, View, Text } from 'react-native';
import { LinkRow } from '../../../lib/models';

type Props = {
  link: LinkRow;
  onPress?: (linkId: string) => void;
};

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LinkCard({ link, onPress }: Props) {
  const isActive = !link.end_time;

  return (
    <Pressable
      onPress={() => onPress?.(link.id)}
      className="bg-white rounded-xl border border-slate-200 p-4 mb-3 active:opacity-90"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-slate-900">
            {link.name}
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            {isActive
              ? `Started ${formatDate(link.created_at)}`
              : `${formatDate(link.created_at)} - ${formatDate(link.end_time)}`}
          </Text>
        </View>

        <View
          className={`px-2.5 py-1 rounded-full ${
            isActive ? 'bg-green-100' : 'bg-slate-100'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              isActive ? 'text-green-700' : 'text-slate-600'
            }`}
          >
            {isActive ? 'Active' : 'Ended'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
