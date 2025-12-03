import { jsonResponse } from '../utils/response.js';

export async function handleTrained(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const game = url.searchParams.get('game'); // 'dpi' or 'lbe'

  if (!game || !['dpi', 'lbe'].includes(game)) {
    return jsonResponse({ error: 'Game parameter required (dpi or lbe)' }, 400);
  }

  const basePath = `/trained/${game}`;

  switch (method) {
    case 'GET':
      return await getTrainedStatus(id, basePath, firebase);
    case 'POST':
      return await setTrainedStatus(request, basePath, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getTrainedStatus(id, basePath, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    const status = await firebase.get(`${basePath}/t_${id}`);
    const isTrained = status === 'true' || status === true;

    return jsonResponse({ id, trained: isTrained });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function setTrainedStatus(request, basePath, firebase) {
  try {
    const { id, trained } = await request.json();

    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    const value = trained ? 'true' : 'false';
    await firebase.put(`${basePath}/t_${id}`, value);

    return jsonResponse({ success: true, id, trained });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}