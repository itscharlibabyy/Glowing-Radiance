import { jsonResponse } from '../utils/response.js';

export async function handleStaffData(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  switch (method) {
    case 'GET':
      return await getStaffData(id, firebase);
    case 'POST':
      return await setStaffData(request, firebase);
    case 'DELETE':
      return await deleteStaffData(id, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getStaffData(id, firebase) {
  try {
    if (id) {
      const data = await firebase.get(`/staffData/${id}`);
      return jsonResponse({ id, data: data || { c: 0, d: 0, r: 0, s: 0 } });
    } else {
      const data = await firebase.get('/staffData');
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function setStaffData(request, firebase) {
  try {
    const { id, c, d, r, s } = await request.json();

    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    const data = {
      c: c || 0,  // Star count
      d: d || 0,  // Dormant timestamp
      r: r || 0,  // Rank
      s: s || 0   // Streak
    };

    await firebase.patch(`/staffData/${id}`, data);

    return jsonResponse({ success: true, id, data });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function deleteStaffData(id, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: 'User ID required' }, 400);
    }

    await firebase.delete(`/staffData/${id}`);

    return jsonResponse({ success: true, message: 'Staff data deleted' });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}