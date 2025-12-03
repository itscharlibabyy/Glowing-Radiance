import { jsonResponse } from '../utils/response.js';

export async function handleCheckBan(request, env, ctx, firebase) {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return jsonResponse({ error: 'Player ID required' }, 400);
  }

  try {
    const playerData = await firebase.get(`/bannedPlayers/${id}`);
    
    if (playerData) {
      return jsonResponse({ 
        banned: true,
        player: playerData
      });
    }

    return jsonResponse({ banned: false });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}