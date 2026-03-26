import { NextResponse } from 'next/server';
import { createOrder, listOrders } from '@/lib/commercial-store';
import { ProductOrderPayloadSchema } from '@/lib/schema';

export async function GET() {
  return NextResponse.json({ success: true, data: listOrders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ProductOrderPayloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: '订单参数校验失败',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const order = createOrder(parsed.data);
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: '服务器处理失败' }, { status: 500 });
  }
}
