import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import {
  WalletApiError,
  WalletClient,
  bearerFromRequest,
  normalizeApiKey,
} from './wallet';

function ok(output: unknown) {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(output) }],
    structuredContent: output as Record<string, unknown>,
  };
}

function fail(error: unknown) {
  const message =
    error instanceof WalletApiError || error instanceof Error ? error.message : String(error);
  return { isError: true as const, content: [{ type: 'text' as const, text: message }] };
}

/** 헤더 Bearer 또는 도구 인자. ChatGPT는 보통 인자로 넘김. */
const apiKeyField = z
  .string()
  .optional()
  .describe('대화의 kbw_ API 키. Authorization Bearer가 없을 때 필수.');

function createServer(headerApiKey: string | null, apiBase: string) {
  const server = new McpServer({
    name: 'stable-wallet-mcp',
    version: '0.2.0',
    instructions:
      'Stable wallet agent tools. Connection needs no OAuth. Pass apiKey=kbw_... on every tool unless the client already sends Authorization: Bearer kbw_.... Flow: wallet_me → wallet_kya_request if not approved → merchants/products → wallet_pay. Do not ask for recipient wallet address or chain.',
  });

  function resolveKey(apiKey?: string) {
    const key = normalizeApiKey(apiKey) ?? headerApiKey;
    if (!key) {
      throw new Error(
        'apiKey(kbw_...)가 필요합니다. 도구 인자에 넣거나 Authorization: Bearer 로 보내세요.',
      );
    }
    return new WalletClient(apiBase, key);
  }

  server.registerTool(
    'wallet_me',
    {
      description:
        '회원·KYA·한도 조회. 결제 전 첫 호출. 수신 주소는 묻지 마세요. apiKey는 대화의 kbw_ 키.',
      inputSchema: z.object({ apiKey: apiKeyField }),
    },
    async ({ apiKey }) => {
      try {
        return ok(await resolveKey(apiKey).me());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_kya_request',
    {
      description:
        '회원 한도 승인(KYA) 요청 한 번. 주소 위험도 검사가 아님. approved가 아닐 때만.',
      inputSchema: z.object({ apiKey: apiKeyField }),
    },
    async ({ apiKey }) => {
      try {
        return ok(await resolveKey(apiKey).requestKya());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_balances',
    {
      description: '잔액 목록.',
      inputSchema: z.object({ apiKey: apiKeyField }),
    },
    async ({ apiKey }) => {
      try {
        return ok(await resolveKey(apiKey).balances());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_merchants',
    {
      description: '결제 가능 가맹점 목록.',
      inputSchema: z.object({ apiKey: apiKeyField }),
    },
    async ({ apiKey }) => {
      try {
        return ok(await resolveKey(apiKey).merchants());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_products',
    {
      description: '가맹점 품목과 원화 가격.',
      inputSchema: z.object({
        apiKey: apiKeyField,
        merchantId: z.number().int().positive(),
      }),
    },
    async ({ apiKey, merchantId }) => {
      try {
        return ok(await resolveKey(apiKey).products(merchantId));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_pay',
    {
      description:
        '승인·한도 안 품목 결제. idempotencyKey는 결제마다 uuid. topup/owner auth/수신주소 금지.',
      inputSchema: z.object({
        apiKey: apiKeyField,
        merchantId: z.number().int().positive(),
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99).default(1),
        idempotencyKey: z.string().uuid(),
      }),
    },
    async ({ apiKey, ...input }) => {
      try {
        return ok(await resolveKey(apiKey).pay(input));
      } catch (error) {
        return fail(error);
      }
    },
  );

  return server;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
          'Access-Control-Allow-Headers':
            request.headers.get('Access-Control-Request-Headers') ??
            'authorization,content-type,accept,mcp-protocol-version',
        },
      });
    }

    // OAuth 메타는 없음 → 404. ChatGPT는 "No authentication"으로 연결.
    const url = new URL(request.url);
    if (url.pathname.startsWith('/.well-known/')) {
      return new Response(null, { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const apiBase = (env.KB_WALLET_API_BASE || 'https://kb-stable-wallet-api-stage.vercel.app').replace(
      /\/$/,
      '',
    );
    const headerApiKey = bearerFromRequest(request);
    const handler = createMcpHandler(() => createServer(headerApiKey, apiBase));
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
