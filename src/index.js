import { router } from './router.js';
import { corsHeaders } from './utils/cors.js';
import { authenticate } from './middleware/auth.js';
import { createFirebase } from './utils/firebase.js';

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Authenticate request
      const authResult = authenticate(request, env.DS_API_KEY);
      if (!authResult.success) {
        return new Response(JSON.stringify({ error: authResult.error }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create Firebase instance and attach to request
      const firebase = createFirebase(env);

      // Route request
      const response = await router(request, env, ctx, firebase);
      return response;

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};