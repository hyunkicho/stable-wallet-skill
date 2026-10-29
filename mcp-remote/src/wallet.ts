export class WalletApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class WalletClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
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

  products(merchantId: number) {
    return this.call('GET', `/agent/merchants/${merchantId}/products`);
  }

  pay(body: {
    merchantId: number;
    productId: number;
    quantity: number;
    idempotencyKey: string;
  }) {
    return this.call('POST', '/agent/payments', body);
  }

  private async call(method: string, path: string, body?: unknown) {
    const headers: Record<string, string> = {
      authorization: `Bearer ${this.apiKey}`,
    };
    if (body !== undefined) headers['content-type'] = 'application/json';
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let parsed: { message?: string } = {};
    try {
      parsed = text ? (JSON.parse(text) as { message?: string }) : {};
    } catch {
      parsed = { message: text };
    }
    if (!response.ok) {
      const message =
        typeof parsed.message === 'string' ? parsed.message : text || response.statusText;
      throw new WalletApiError(response.status, `${response.status} ${path}: ${message}`);
    }
    return parsed;
  }
}

export function bearerFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.toLowerCase().startsWith('bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token.startsWith('kbw_') ? token : null;
}
