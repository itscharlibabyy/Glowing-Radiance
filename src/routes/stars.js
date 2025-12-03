import { jsonResponse } from '../utils/response.js';

export async function handleStars(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const game = url.searchParams.get('game'); // 'dpi' or 'lbe'

  if (!game || !['dpi', 'lbe'].includes(game)) {
    return jsonResponse({ error: 'Game parameter required (dpi or lbe)' }, 400);
  }

  const basePath = `/stars/${game}`;

  switch (method) {
    case 'GET':
      return await getStarLevel(id, basePath, firebase);
    case 'POST':
      return await setStarLevel(request, basePath, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getStarLevel(id, basePath, firebase) {
  try {
    if (id) {
      const level = await firebase.get(`${basePath}/p/${id}`);
      return jsonResponse({ id, stars: parseInt(level) || 0 });
    } else {
      const data = await firebase.get(basePath);
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function setStarLevel(request, basePath, firebase) {
  try {
    const { id, stars } = await request.json();

    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    const level = Math.max(0, Math.min(6, parseInt(stars) || 0));
    await firebase.put(`${basePath}/p/${id}`, level.toString());

    return jsonResponse({ success: true, id, stars: level });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}