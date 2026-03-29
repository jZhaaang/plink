import { createClient } from 'jsr:@supabase/supabase-js@2';

type ActivityType =
  | 'link_created'
  | 'link_ended'
  | 'link_member_joined'
  | 'link_member_left'
  | 'party_member_joined'
  | 'party_member_left';

type ActivityRow = {
  id: string;
  recipient_user_id: string;
  actor_user_id: string | null;
  party_id: string | null;
  link_id: string | null;
  type: ActivityType;
  metadata: { partyName?: string; linkName?: string } | null;
};

function bodyLine(input: {
  type: ActivityType;
  actor: string;
  party: string;
  link: string;
}): string {
  const { type, actor, party, link } = input;
  switch (type) {
    case 'link_created':
      return `${actor} started a link in ${party}!`;
    case 'link_ended':
      return `${link} in ${party} has ended!`;
    case 'link_member_joined':
      return `${actor} joined ${link} in ${party}!`;
    case 'link_member_left':
      return `${actor} left ${link} in ${party}.`;
    case 'party_member_joined':
      return `${actor} joined ${party}!`;
    case 'party_member_left':
      return `${actor} left ${party}.`;
  }
}

Deno.serve(async (req) => {
  const payload = await req.json();
  const record = (payload?.record ?? null) as ActivityRow | null;
  if (!record) return new Response('No record', { status: 200 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const [{ data: tokens }, { data: actor }, { data: party }, { data: link }] =
    await Promise.all([
      supabase
        .from('push_tokens')
        .select('token')
        .eq('user_id', record.recipient_user_id)
        .eq('enabled', true),
      record.actor_user_id
        ? supabase
            .from('profiles')
            .select('name')
            .eq('id', record.actor_user_id)
            .single()
        : Promise.resolve({ data: null }),
      record.party_id
        ? supabase
            .from('parties')
            .select('name')
            .eq('id', record.party_id)
            .single()
        : Promise.resolve({ data: null }),
      record.link_id
        ? supabase
            .from('links')
            .select('name')
            .eq('id', record.link_id)
            .single()
        : Promise.resolve({ data: null }),
    ]);

  const actorName = actor?.name ?? 'Someone';
  const partyName = party?.name ?? record.metadata?.partyName ?? 'a party';
  const linkName = link?.name ?? record.metadata?.linkName ?? 'a link';

  const messages = (tokens ?? []).map((t) => ({
    to: t.token,
    sound: 'default',
    title: 'Plink activity',
    body: bodyLine({
      type: record.type,
      actor: actorName,
      party: partyName,
      link: linkName,
    }),
    data: {
      type: 'activity_event',
      eventId: record.id,
      partyId: record.party_id,
      linkId: record.link_id,
    },
  }));

  if (messages.length === 0) return new Response('No tokens', { status: 200 });

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });

  return new Response('ok', { status: 200 });
});
