import { jsonResponse } from '../utils/response.js';

export async function handleWards(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const wardId = url.searchParams.get('id');

  switch (method) {
    case 'GET':
      return await getWards(wardId, firebase);
    case 'POST':
      return await setWard(request, firebase);
    case 'DELETE':
      return await deleteWard(wardId, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getWards(wardId, firebase) {
  try {
    if (wardId) {
      const ward = await firebase.get(`/wards/${wardId}`);
      return jsonResponse({ wardId, ward: ward || null });
    } else {
      // Get active wards list
      const active = await firebase.get('/wards/active');
      const wards = {};

      if (active && Array.isArray(active)) {
        for (const id of active) {
          const wardData = await firebase.get(`/wards/${id}`);
          if (wardData) {
            wards[id] = wardData;
          }
        }
      }

      return jsonResponse({ wards, count: Object.keys(wards).length });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function setWard(request, firebase) {
  try {
    const { id, nurse, patient, day, datetime } = await request.json();

    if (!id) {
      return jsonResponse({ error: 'Ward ID required' }, 400);
    }

    const wardData = {
      nurse: nurse || 0,
      patient: patient || 0,
      day: day || 0,
      datetime: datetime || Date.now()
    };

    await firebase.patch(`/wards/${id}`, wardData);

    // Update active wards list
    const active = (await firebase.get('/wards/active')) || [];
    if (!active.includes(id)) {
      active.push(id);
      await firebase.put('/wards/active', active);
    }

    return jsonResponse({ success: true, ward: wardData });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function deleteWard(wardId, firebase) {
  try {
    if (!wardId) {
      return jsonResponse({ error: 'Ward ID required' }, 400);
    }

    await firebase.delete(`/wards/${wardId}`);

    // Remove from active list
    const active = (await firebase.get('/wards/active')) || [];
    const filtered = active.filter(id => id !== wardId);
    await firebase.put('/wards/active', filtered);

    return jsonResponse({ success: true, message: 'Ward deleted' });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}