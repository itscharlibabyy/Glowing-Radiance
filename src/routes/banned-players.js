import { corsHeaders } from "../utils/cors";
import { jsonResponse } from "../utils/response";

export async function handleBannedPlayers(request, env, ctx, firebase) {
    const method = request.method;

  switch (method) {
    case 'GET':
      return await getBannedPlayers(firebase);
    case 'POST':
      return await addBannedPlayer(request, firebase);
    case 'DELETE':
      return await removeBannedPlayer(request, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getBannedPlayers(firebase) {
  try {
    const data = await firebase.get('/bannedPlayers');
    
    if (!data) {
      return jsonResponse({ players: [], count: 0 });
    }

    const players = Object.entries(data).map(([id, player]) => ({
      id,
      ...player
    }));

    return jsonResponse({ players, count: players.length });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function addBannedPlayer(request, firebase) {
  try {
    const data = await request.json();
    const { id, name, reason, datePosted } = data;

    if (!id || !name || !reason) {
      return jsonResponse({ error: 'Missing required fields: id, name, reason' }, 400);
    }

    const playerData = {
      id: String(id),
      name,
      reason,
      datePosted: datePosted || new Date().toISOString()
    };

    await firebase.patch(`/bannedPlayers/${id}`, playerData);

    return jsonResponse({ success: true, player: playerData }, 201);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function removeBannedPlayer(request, firebase) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return jsonResponse({ error: 'Player ID required' }, 400);
    }

    await firebase.delete(`/bannedPlayers/${id}`);

    return jsonResponse({ success: true, message: 'Player unbanned' });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}