export function authenticate(request, validKey) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
        return { success: false, error: 'API key needed!'};
    }

    if (key !== validKey) {
        return { success: false, error: 'Invalid API key!'};
    }

    return {success: true};
}