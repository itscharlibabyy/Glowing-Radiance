class Firebase {
  constructor(url, secret) {
    this.url = url;
    this.auth = `.json?auth=${secret}`;
  }

  async request(method, key, data) {
    const url = key 
      ? `${this.url}${key}${this.auth}`
      : `${this.url}${this.auth}`;

    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
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
      console.error('[Firebase] Request failed:', error);
      return null;
    }
  }

  async get(key) {
    return await this.request('GET', key);
  }

  async patch(key, data) {
    return await this.request('PATCH', key, data);
  }

  async put(key, data) {
    return await this.request('PUT', key, data);
  }

  async delete(key) {
    return await this.request('DELETE', key);
  }

  async post(key, data) {
    return await this.request('POST', key, data);
  }

  // Helper: Check if a player is banned
  async isBanned(playerId) {
    const player = await this.get(`/bannedPlayers/${playerId}`);
    return player !== null;
  }
}

export function createFirebase(env) {
  return new Firebase(env.FIREBASE_URL, env.FIREBASE_SECRET);
}