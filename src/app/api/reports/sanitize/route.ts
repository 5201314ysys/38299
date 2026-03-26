import { NextResponse } from 'next/server';

interface RequestBody {
  text?: string;
}

function maskName(input: string) {
  return input.replace(/[\u4e00-\u9fa5]{2,4}/g, (name) => {
    if (name.length <= 1) return name;
    return `${name[0]}**`;
  });
}

function maskIdCard(input: string) {
  return input.replace(/\d{17}[\dXx]/g, (id) => `${id.slice(0, 3)}***********${id.slice(-4)}`);
}

function normalizeText(input: string) {
  return input
    .replace(/护工/g, '护理执行人员')
    .replace(/病人/g, '服务对象')
    .replace(/身份证/g, '身份标识')
    .replace(/喂食/g, '进食照护');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const text = body.text?.trim();

    if (!text) {
      return NextResponse.json({ success: false, error: '文本不能为空' }, { status: 400 });
    }

    const sanitized = normalizeText(maskIdCard(maskName(text)));
    const digest = Buffer.from(sanitized).toString('base64').slice(0, 16).toUpperCase();

    return NextResponse.json({
      success: true,
      data: {
        sanitized,
        digest,
        policy: ['实体擦除', '身份证脱敏', '术语规范化'],
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: '处理失败' }, { status: 500 });
  }
}
