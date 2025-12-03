import { corsHeaders } from './utils/cors.js';
import { handleBannedPlayers } from './routes/banned-players.js';
import { handleCheckBan } from './routes/check-ban.js';
import { handleStaffData } from './routes/staff-data.js';
import { handleQualityData } from './routes/quality-data.js';
import { handleTrained } from './routes/trained.js';
import { handleStars } from './routes/stars.js';
import { handleWards } from './routes/wards.js';
import { handleWarnings } from './routes/warnings.js';
import { handleBlacklist } from './routes/blacklist.js';

export async function router(request, env, ctx, firebase) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Route matching
  if (path === '/BannedPlayers2') {
    return await handleBannedPlayers(request, env, ctx, firebase);
  }

  if (path === '/CheckBan') {
    return await handleCheckBan(request, env, ctx, firebase);
  }

  if (path === '/StaffData') {
    return await handleStaffData(request, env, ctx, firebase);
  }

  if (path === '/QualityData') {
    return await handleQualityData(request, env, ctx, firebase);
  }

  if (path === '/Trained') {
    return await handleTrained(request, env, ctx, firebase);
  }

  if (path === '/Stars') {
    return await handleStars(request, env, ctx, firebase);
  }

  if (path === '/Wards') {
    return await handleWards(request, env, ctx, firebase);
  }

  if (path === '/Warnings') {
    return await handleWarnings(request, env, ctx, firebase);
  }

  if (path === '/Blacklist') {
    return await handleBlacklist(request, env, ctx, firebase);
  }

  // 404 Not Found
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}