var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils/cors.js
var corsHeaders = {
  "Access-Control-Allowed-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

// src/utils/response.js
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
__name(jsonResponse, "jsonResponse");

// src/routes/banned-players.js
async function handleBannedPlayers(request, env, ctx, firebase) {
  const method = request.method;
  switch (method) {
    case "GET":
      return await getBannedPlayers(firebase);
    case "POST":
      return await addBannedPlayer(request, firebase);
    case "DELETE":
      return await removeBannedPlayer(request, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleBannedPlayers, "handleBannedPlayers");
async function getBannedPlayers(firebase) {
  try {
    const data = await firebase.get("/bannedPlayers");
    if (!data) {
      return jsonResponse({ players: [], count: 0 });
    }
    const players = Object.entries(data).map(([id, player]) => ({
      id,
      ...player
    }));
    return jsonResponse({ players, count: players.length });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getBannedPlayers, "getBannedPlayers");
async function addBannedPlayer(request, firebase) {
  try {
    const data = await request.json();
    const { id, name, reason, datePosted } = data;
    if (!id || !name || !reason) {
      return jsonResponse({ error: "Missing required fields: id, name, reason" }, 400);
    }
    const playerData = {
      id: String(id),
      name,
      reason,
      datePosted: datePosted || (/* @__PURE__ */ new Date()).toISOString()
    };
    await firebase.patch(`/bannedPlayers/${id}`, playerData);
    return jsonResponse({ success: true, player: playerData }, 201);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(addBannedPlayer, "addBannedPlayer");
async function removeBannedPlayer(request, firebase) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return jsonResponse({ error: "Player ID required" }, 400);
    }
    await firebase.delete(`/bannedPlayers/${id}`);
    return jsonResponse({ success: true, message: "Player unbanned" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(removeBannedPlayer, "removeBannedPlayer");

// src/routes/check-ban.js
async function handleCheckBan(request, env, ctx, firebase) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return jsonResponse({ error: "Player ID required" }, 400);
  }
  try {
    const playerData = await firebase.get(`/bannedPlayers/${id}`);
    if (playerData) {
      return jsonResponse({
        banned: true,
        player: playerData
      });
    }
    return jsonResponse({ banned: false });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(handleCheckBan, "handleCheckBan");

// src/routes/staff-data.js
async function handleStaffData(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  switch (method) {
    case "GET":
      return await getStaffData(id, firebase);
    case "POST":
      return await setStaffData(request, firebase);
    case "DELETE":
      return await deleteStaffData(id, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleStaffData, "handleStaffData");
async function getStaffData(id, firebase) {
  try {
    if (id) {
      const data = await firebase.get(`/staffData/${id}`);
      return jsonResponse({ id, data: data || { c: 0, d: 0, r: 0, s: 0 } });
    } else {
      const data = await firebase.get("/staffData");
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getStaffData, "getStaffData");
async function setStaffData(request, firebase) {
  try {
    const { id, c, d, r, s } = await request.json();
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    const data = {
      c: c || 0,
      // Star count
      d: d || 0,
      // Dormant timestamp
      r: r || 0,
      // Rank
      s: s || 0
      // Streak
    };
    await firebase.patch(`/staffData/${id}`, data);
    return jsonResponse({ success: true, id, data });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(setStaffData, "setStaffData");
async function deleteStaffData(id, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    await firebase.delete(`/staffData/${id}`);
    return jsonResponse({ success: true, message: "Staff data deleted" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(deleteStaffData, "deleteStaffData");

// src/routes/quality-data.js
async function handleQualityData(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const game = url.searchParams.get("game");
  if (!game || !["dpi", "lbe"].includes(game)) {
    return jsonResponse({ error: "Game parameter required (dpi or lbe)" }, 400);
  }
  const basePath = `/quality/${game}`;
  switch (method) {
    case "GET":
      return await getQualityData(id, basePath, firebase);
    case "POST":
      return await setQualityData(request, basePath, firebase);
    case "DELETE":
      return await deleteQualityData(id, basePath, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleQualityData, "handleQualityData");
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
__name(getQualityData, "getQualityData");
async function setQualityData(request, basePath, firebase) {
  try {
    const { id, q, t, l, r } = await request.json();
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    const data = {
      q: q || 0,
      // Quality points
      t: t || 0,
      // Time/hours
      l: l || 0,
      // Last reform timestamp
      r: r || 0
      // Roses
    };
    await firebase.patch(`${basePath}/p/${id}`, data);
    return jsonResponse({ success: true, id, data });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(setQualityData, "setQualityData");
async function deleteQualityData(id, basePath, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    await firebase.delete(`${basePath}/p/${id}`);
    return jsonResponse({ success: true, message: "Quality data deleted" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(deleteQualityData, "deleteQualityData");

// src/routes/trained.js
async function handleTrained(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const game = url.searchParams.get("game");
  if (!game || !["dpi", "lbe"].includes(game)) {
    return jsonResponse({ error: "Game parameter required (dpi or lbe)" }, 400);
  }
  const basePath = `/trained/${game}`;
  switch (method) {
    case "GET":
      return await getTrainedStatus(id, basePath, firebase);
    case "POST":
      return await setTrainedStatus(request, basePath, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleTrained, "handleTrained");
async function getTrainedStatus(id, basePath, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    const status = await firebase.get(`${basePath}/t_${id}`);
    const isTrained = status === "true" || status === true;
    return jsonResponse({ id, trained: isTrained });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getTrainedStatus, "getTrainedStatus");
async function setTrainedStatus(request, basePath, firebase) {
  try {
    const { id, trained } = await request.json();
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    const value = trained ? "true" : "false";
    await firebase.put(`${basePath}/t_${id}`, value);
    return jsonResponse({ success: true, id, trained });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(setTrainedStatus, "setTrainedStatus");

// src/routes/stars.js
async function handleStars(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const game = url.searchParams.get("game");
  if (!game || !["dpi", "lbe"].includes(game)) {
    return jsonResponse({ error: "Game parameter required (dpi or lbe)" }, 400);
  }
  const basePath = `/stars/${game}`;
  switch (method) {
    case "GET":
      return await getStarLevel(id, basePath, firebase);
    case "POST":
      return await setStarLevel(request, basePath, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleStars, "handleStars");
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
__name(getStarLevel, "getStarLevel");
async function setStarLevel(request, basePath, firebase) {
  try {
    const { id, stars } = await request.json();
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    const level = Math.max(0, Math.min(6, parseInt(stars) || 0));
    await firebase.put(`${basePath}/p/${id}`, level.toString());
    return jsonResponse({ success: true, id, stars: level });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(setStarLevel, "setStarLevel");

// src/routes/wards.js
async function handleWards(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const wardId = url.searchParams.get("id");
  switch (method) {
    case "GET":
      return await getWards(wardId, firebase);
    case "POST":
      return await setWard(request, firebase);
    case "DELETE":
      return await deleteWard(wardId, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleWards, "handleWards");
async function getWards(wardId, firebase) {
  try {
    if (wardId) {
      const ward = await firebase.get(`/wards/${wardId}`);
      return jsonResponse({ wardId, ward: ward || null });
    } else {
      const active = await firebase.get("/wards/active");
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
__name(getWards, "getWards");
async function setWard(request, firebase) {
  try {
    const { id, nurse, patient, day, datetime } = await request.json();
    if (!id) {
      return jsonResponse({ error: "Ward ID required" }, 400);
    }
    const wardData = {
      nurse: nurse || 0,
      patient: patient || 0,
      day: day || 0,
      datetime: datetime || Date.now()
    };
    await firebase.patch(`/wards/${id}`, wardData);
    const active = await firebase.get("/wards/active") || [];
    if (!active.includes(id)) {
      active.push(id);
      await firebase.put("/wards/active", active);
    }
    return jsonResponse({ success: true, ward: wardData });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(setWard, "setWard");
async function deleteWard(wardId, firebase) {
  try {
    if (!wardId) {
      return jsonResponse({ error: "Ward ID required" }, 400);
    }
    await firebase.delete(`/wards/${wardId}`);
    const active = await firebase.get("/wards/active") || [];
    const filtered = active.filter((id) => id !== wardId);
    await firebase.put("/wards/active", filtered);
    return jsonResponse({ success: true, message: "Ward deleted" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(deleteWard, "deleteWard");

// src/routes/warnings.js
async function handleWarnings(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  switch (method) {
    case "GET":
      return await getWarnings(id, firebase);
    case "POST":
      return await addWarning(request, firebase);
    case "DELETE":
      return await removeWarning(request, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleWarnings, "handleWarnings");
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
      const data = await firebase.get("/warnings");
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getWarnings, "getWarnings");
async function addWarning(request, firebase) {
  try {
    const { id, reason, issuer, date } = await request.json();
    if (!id || !reason) {
      return jsonResponse({ error: "User ID and reason required" }, 400);
    }
    const warnings = await firebase.get(`/warnings/${id}`) || [];
    warnings.push({
      r: reason,
      i: issuer || "Unknown",
      d: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    });
    await firebase.put(`/warnings/${id}`, warnings);
    return jsonResponse({ success: true, id, warnings });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(addWarning, "addWarning");
async function removeWarning(request, firebase) {
  try {
    const { id, index } = await request.json();
    if (!id || index === void 0) {
      return jsonResponse({ error: "User ID and warning index required" }, 400);
    }
    const warnings = await firebase.get(`/warnings/${id}`) || [];
    if (index >= 0 && index < warnings.length) {
      warnings.splice(index, 1);
      await firebase.put(`/warnings/${id}`, warnings);
      return jsonResponse({ success: true, id, warnings });
    }
    return jsonResponse({ error: "Invalid warning index" }, 400);
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(removeWarning, "removeWarning");

// src/routes/blacklist.js
async function handleBlacklist(request, env, ctx, firebase) {
  const method = request.method;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  switch (method) {
    case "GET":
      return await getBlacklist(id, firebase);
    case "POST":
      return await addToBlacklist(request, firebase);
    case "DELETE":
      return await removeFromBlacklist(id, firebase);
    default:
      return jsonResponse({ error: "Method not allowed" }, 405);
  }
}
__name(handleBlacklist, "handleBlacklist");
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
      const data = await firebase.get("/blacklist");
      return jsonResponse({ data: data || {} });
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(getBlacklist, "getBlacklist");
async function addToBlacklist(request, firebase) {
  try {
    const { id, reason, issuer, date } = await request.json();
    if (!id || !reason) {
      return jsonResponse({ error: "User ID and reason required" }, 400);
    }
    const entry = {
      r: reason,
      i: issuer || "Unknown",
      d: date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    await firebase.put(`/blacklist/${id}`, entry);
    return jsonResponse({ success: true, id, entry });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(addToBlacklist, "addToBlacklist");
async function removeFromBlacklist(id, firebase) {
  try {
    if (!id) {
      return jsonResponse({ error: "User ID required" }, 400);
    }
    await firebase.delete(`/blacklist/${id}`);
    return jsonResponse({ success: true, message: "User removed from blacklist" });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}
__name(removeFromBlacklist, "removeFromBlacklist");

// src/router.js
async function router(request, env, ctx, firebase) {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  if (path === "/bannedplayers2") {
    return await handleBannedPlayers(request, env, ctx, firebase);
  }
  if (path === "/checkban") {
    return await handleCheckBan(request, env, ctx, firebase);
  }
  if (path === "/staffdata") {
    return await handleStaffData(request, env, ctx, firebase);
  }
  if (path === "/qualitydata") {
    return await handleQualityData(request, env, ctx, firebase);
  }
  if (path === "/trained") {
    return await handleTrained(request, env, ctx, firebase);
  }
  if (path === "/stars") {
    return await handleStars(request, env, ctx, firebase);
  }
  if (path === "/wards") {
    return await handleWards(request, env, ctx, firebase);
  }
  if (path === "/warnings") {
    return await handleWarnings(request, env, ctx, firebase);
  }
  if (path === "/blacklist") {
    return await handleBlacklist(request, env, ctx, firebase);
  }
  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}
__name(router, "router");

// src/middleware/auth.js
function authenticate(request, validKey) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) {
    return { success: false, error: "API key needed!" };
  }
  if (key !== validKey) {
    return { success: false, error: "Invalid API key!" };
  }
  return { success: true };
}
__name(authenticate, "authenticate");

// src/utils/firebase.js
var Firebase = class {
  static {
    __name(this, "Firebase");
  }
  constructor(url, secret) {
    this.url = url;
    this.auth = `.json?auth=${secret}`;
  }
  async request(method, key, data) {
    const url = key ? `${this.url}${key}${this.auth}` : `${this.url}${this.auth}`;
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Firebase error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("[Firebase] Request failed:", error);
      return null;
    }
  }
  async get(key) {
    return await this.request("GET", key);
  }
  async patch(key, data) {
    return await this.request("PATCH", key, data);
  }
  async put(key, data) {
    return await this.request("PUT", key, data);
  }
  async delete(key) {
    return await this.request("DELETE", key);
  }
  async post(key, data) {
    return await this.request("POST", key, data);
  }
  // Helper: Check if a player is banned
  async isBanned(playerId) {
    const player = await this.get(`/bannedPlayers/${playerId}`);
    return player !== null;
  }
};
function createFirebase(env) {
  return new Firebase(env.FIREBASE_URL, env.FIREBASE_SECRET);
}
__name(createFirebase, "createFirebase");

// src/index.js
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      const authResult = authenticate(request, env.DS_API_KEY);
      if (!authResult.success) {
        return new Response(JSON.stringify({ error: authResult.error }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const firebase = createFirebase(env);
      const response = await router(request, env, ctx, firebase);
      return response;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-QSU7DW/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-QSU7DW/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
