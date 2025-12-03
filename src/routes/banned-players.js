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