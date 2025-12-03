import { jsonResponse } from '../utils/response.js';

export async function handleBlacklist(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  switch (method) {
    case 'GET':
      return await getBlacklist(id, firebase);
    case 'POST':
      return await addToBlacklist(request, firebase);
    case 'DELETE':
      return await removeFromBlacklist(id, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getBlacklist(id, firebase) {
  try {
    if (id) {
      const entry = await firebase.get(`/blacklist/${id}`);
      return jsonResponse({ 
        id, 
        blacklisted: entry !== null,
        data: entry || null
      });
    } else {
      const data = await firebase.get('/blacklist');
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function addToBlacklist(request, firebase) {
  try {
    const { id, reason, issuer, date } = await request.json();

    if (!id || !reason) {
      return jsonResponse({ error: 'User ID and reason required' }, 400);
    }

    const entry = {
      r: reason,
      i: issuer || 'Unknown',
      d: date || new Date().toISOString().split('T')[0]
    };

    await firebase.put(`/blacklist/${id}`, entry);

    return jsonResponse({ success: true, id, entry });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function removeFromBlacklist(id, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    await firebase.delete(`/blacklist/${id}`);

    return jsonResponse({ success: true, message: 'User removed from blacklist' });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}