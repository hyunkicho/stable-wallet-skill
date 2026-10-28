export class WalletApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** stage API 또는 supabase 프록시 base. 끝의 / 는 제거. */
export class WalletClient {
  constructor({ baseUrl, apiKey, fetchImpl = fetch }) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  me() {
    return this.call('GET', '/agent/me');
  }

  requestKya() {
    return this.call('POST', '/agent/kya/request');
  }

  balances() {
    return this.call('GET', '/agent/balances');
  }

  merchants() {
    return this.call('GET', '/agent/merchants');
  }

  products(merchantId) {
    return this.call('GET', `/agent/merchants/${merchantId}/products`);
  }

  pay(body) {
    return this.call('POST', '/agent/payments', body);
  }

  async call(method, path, body) {
    const headers = { authorization: `Bearer ${this.apiKey}` };
    if (body !== undefined) headers['content-type'] = 'application/json';
    // supabase 프록시 base 는 .../functions/v1 이고 path 는 /agent/...
    const url = `${this.baseUrl}${path}`;
    const response = await this.fetchImpl(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text };
    }
    if (!response.ok) {
      const message = typeof parsed.message === 'string' ? parsed.message : text || response.statusText;
      throw new WalletApiError(response.status, `${response.status} ${path}: ${message}`);
    }
    return parsed;
  }
}
