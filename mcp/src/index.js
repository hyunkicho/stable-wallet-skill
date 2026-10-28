#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { WalletApiError, WalletClient } from './client.js';

const apiKey = process.env.KB_WALLET_API_KEY ?? '';
const baseUrl = (
  process.env.KB_WALLET_API_BASE ?? 'https://kb-stable-wallet-api-stage.vercel.app'
).replace(/\/$/, '');

if (!apiKey) {
  console.error('KB_WALLET_API_KEY가 없습니다. 키는 환경변수로만 넣습니다.');
  process.exit(1);
}

const client = new WalletClient({ baseUrl, apiKey });
const server = new McpServer({ name: 'stable-wallet-mcp', version: '0.1.0' });

function ok(output) {
  return {
    content: [{ type: 'text', text: JSON.stringify(output) }],
    structuredContent: output,
  };
}

function fail(error) {
  const message = error instanceof WalletApiError || error instanceof Error ? error.message : String(error);
  return { isError: true, content: [{ type: 'text', text: message }] };
}

server.registerTool(
  'wallet_me',
  {
    title: 'Wallet me',
    description: 'API 키 회원의 userNo, kyaStatus, paymentLimitKrw, spentKrw를 읽습니다.',
    inputSchema: {},
    annotations: { readOnlyHint: true },
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
    title: 'Request KYA',
    description: '주인 승인(KYA·인증) 요청을 한 번 보냅니다. approved가 아닐 때만 호출하세요.',
    inputSchema: {},
    annotations: { readOnlyHint: false },
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
    title: 'Balances',
    description: '지갑과 같은 잔액 목록을 읽습니다.',
    inputSchema: {},
    annotations: { readOnlyHint: true },
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
    title: 'Merchants',
    description: '결제 가능한 활성 가맹점 목록.',
    inputSchema: {},
    annotations: { readOnlyHint: true },
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
    title: 'Products',
    description: '가맹점 품목과 원화 가격.',
    inputSchema: { merchantId: z.number().int().positive() },
    annotations: { readOnlyHint: true },
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
    title: 'Pay',
    description:
      '승인·한도 안에서 품목 결제. idempotencyKey는 결제 시도마다 uuid. topup/owner auth는 호출하지 마세요.',
    inputSchema: {
      merchantId: z.number().int().positive(),
      productId: z.number().int().positive(),
      quantity: z.number().int().min(1).max(99).default(1),
      idempotencyKey: z.string().uuid(),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
  },
  async (input) => {
    try {
      return ok(await client.pay(input));
    } catch (error) {
      return fail(error);
    }
  },
);

await server.connect(new StdioServerTransport());
