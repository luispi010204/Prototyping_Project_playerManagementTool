export async function load({ parent }) {
  const parentData = await parent();
  return { players: parentData.players || [] };
}
