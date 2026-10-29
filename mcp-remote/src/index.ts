import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import { WalletApiError, WalletClient, bearerFromRequest } from './wallet';

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

function createServer(apiKey: string, apiBase: string) {
  const client = new WalletClient(apiBase, apiKey);
  const server = new McpServer({ name: 'stable-wallet-mcp', version: '0.1.0' });

  server.registerTool(
    'wallet_me',
    {
      description: 'API 키 회원의 userNo, kyaStatus, paymentLimitKrw, spentKrw를 읽습니다.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(await client.me());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_kya_request',
    {
      description: '주인 승인(KYA·인증) 요청을 한 번 보냅니다. approved가 아닐 때만 호출하세요.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(await client.requestKya());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_balances',
    {
      description: '지갑과 같은 잔액 목록을 읽습니다.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(await client.balances());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_merchants',
    {
      description: '결제 가능한 활성 가맹점 목록.',
      inputSchema: z.object({}),
    },
    async () => {
      try {
        return ok(await client.merchants());
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_products',
    {
      description: '가맹점 품목과 원화 가격.',
      inputSchema: z.object({ merchantId: z.number().int().positive() }),
    },
    async ({ merchantId }) => {
      try {
        return ok(await client.products(merchantId));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'wallet_pay',
    {
      description:
        '승인·한도 안에서 품목 결제. idempotencyKey는 결제 시도마다 uuid. topup/owner auth는 호출하지 마세요.',
      inputSchema: z.object({
        merchantId: z.number().int().positive(),
        productId: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99).default(1),
        idempotencyKey: z.string().uuid(),
      }),
    },
    async (input) => {
      try {
        return ok(await client.pay(input));
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

    const apiKey = bearerFromRequest(request);
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'unauthorized',
          message: 'Authorization: Bearer kbw_... 가 필요합니다.',
        }),
        {
          status: 401,
          headers: {
            'content-type': 'application/json',
            'WWW-Authenticate': 'Bearer',
            'Access-Control-Allow-Origin': '*',
          },
        },
      );
    }

    const apiBase = (env.KB_WALLET_API_BASE || 'https://kb-stable-wallet-api-stage.vercel.app').replace(
      /\/$/,
      '',
    );
    const handler = createMcpHandler(() => createServer(apiKey, apiBase));
    return handler(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;
