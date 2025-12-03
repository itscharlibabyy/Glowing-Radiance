import { jsonResponse } from '../utils/response.js';

export async function handleQualityData(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const game = url.searchParams.get('game'); // 'dpi' or 'lbe'

  if (!game || !['dpi', 'lbe'].includes(game)) {
    return jsonResponse({ error: 'Game parameter required (dpi or lbe)' }, 400);
  }

  const basePath = `/quality/${game}`;

  switch (method) {
    case 'GET':
      return await getQualityData(id, basePath, firebase);
    case 'POST':
      return await setQualityData(request, basePath, firebase);
    case 'DELETE':
      return await deleteQualityData(id, basePath, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getQualityData(id, basePath, firebase) {
  try {
    if (id) {
      const data = await firebase.get(`${basePath}/p/${id}`);
      return jsonResponse({ 
        id, 
        data: data || { q: 0, t: 0, l: 0, r: 0 } 
      });
    } else {
      const data = await firebase.get(basePath);
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function setQualityData(request, basePath, firebase) {
  try {
    const { id, q, t, l, r } = await request.json();

    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    const data = {
      q: q || 0,  // Quality points
      t: t || 0,  // Time/hours
      l: l || 0,  // Last reform timestamp
      r: r || 0   // Roses
    };

    await firebase.patch(`${basePath}/p/${id}`, data);

    return jsonResponse({ success: true, id, data });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function deleteQualityData(id, basePath, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    await firebase.delete(`${basePath}/p/${id}`);

    return jsonResponse({ success: true, message: 'Quality data deleted' });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}