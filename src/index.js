export default {
  fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/1189fb58638453b576ed5347ac1063a1.txt") {
      return new Response(
        "detectify",
        {
          headers: {
            "content-type": "text/plain"
          }
        }
      );
    }

    // normal site logic below
    return new Response("OK");
  }
};


/*
import { router } from './router.js';
import { corsHeaders } from './utils/cors.js';
import { authenticate } from './middleware/auth.js';
import { createFirebase } from './utils/firebase.js';

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const authResult = authenticate(request, env.DS_API_KEY);
      if (!authResult.success) {
        return new Response(JSON.stringify({ error: authResult.error }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const firebase = createFirebase(env);

      const response = await router(request, env, ctx, firebase);
      return response;

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}; */