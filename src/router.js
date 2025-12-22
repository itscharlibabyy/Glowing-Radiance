
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

  console.log("Incoming request to /server", request.method, url)
  console.log("Body:", await request.text())
  console.log("Headers:", [...request.headers])

  const path = url.pathname.toLowerCase();

  if (path === '/bannedplayers2') {
    return await handleBannedPlayers(request, env, ctx, firebase);
  }

  if (path === '/checkban') {
    return await handleCheckBan(request, env, ctx, firebase);
  }

  if (path === '/staffdata') {
    return await handleStaffData(request, env, ctx, firebase);
  }

  if (path === '/qualitydata') {
    return await handleQualityData(request, env, ctx, firebase);
  }

  if (path === '/trained') {
    return await handleTrained(request, env, ctx, firebase);
  }

  if (path === '/stars') {
    return await handleStars(request, env, ctx, firebase);
  }

  if (path === '/wards') {
    return await handleWards(request, env, ctx, firebase);
  }

  if (path === '/warnings') {
    return await handleWarnings(request, env, ctx, firebase);
  }

  if (path === '/blacklist') {
    return await handleBlacklist(request, env, ctx, firebase);
  }

  // 404 Not Found
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
