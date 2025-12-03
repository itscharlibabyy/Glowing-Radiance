import { jsonResponse } from '../utils/response.js';

export async function handleWarnings(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  switch (method) {
    case 'GET':
      return await getWarnings(id, firebase);
    case 'POST':
      return await addWarning(request, firebase);
    case 'DELETE':
      return await removeWarning(request, firebase);
    default:
      return jsonResponse({ error: 'Method not allowed' }, 405);
  }
}

async function getWarnings(id, firebase) {
  try {
    if (id) {
      const warnings = await firebase.get(`/warnings/${id}`);
      return jsonResponse({ 
        id, 
        warnings: warnings || [],
        count: warnings ? warnings.length : 0
      });
    } else {
      const data = await firebase.get('/warnings');
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function addWarning(request, firebase) {
  try {
    const { id, reason, issuer, date } = await request.json();

    if (!id || !reason) {
      return jsonResponse({ error: 'User ID and reason required' }, 400);
    }

    const warnings = (await firebase.get(`/warnings/${id}`)) || [];
    
    warnings.push({
      r: reason,
      i: issuer || 'Unknown',
      d: date || new Date().toISOString().split('T')[0]
    });

    await firebase.put(`/warnings/${id}`, warnings);

    return jsonResponse({ success: true, id, warnings });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function removeWarning(request, firebase) {
  try {
    const { id, index } = await request.json();

    if (!id || index === undefined) {
      return jsonResponse({ error: 'User ID and warning index required' }, 400);
    }

    const warnings = (await firebase.get(`/warnings/${id}`)) || [];
    
    if (index >= 0 && index < warnings.length) {
      warnings.splice(index, 1);
      await firebase.put(`/warnings/${id}`, warnings);
      return jsonResponse({ success: true, id, warnings });
    }

    return jsonResponse({ error: 'Invalid warning index' }, 400);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}