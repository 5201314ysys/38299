'use client';
import React, { useMemo, useState } from 'react';
import { Card, Steps, Input, Button, Timeline, Typography, Tag, Space, App } from 'antd';
import { RobotOutlined, CheckCircleOutlined, SafetyOutlined, LockOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const { TextArea } = Input;
const { Paragraph } = Typography;

const EXAMPLE_TEXT = '病人王富贵(身份证：110105194503221918)在2026年3月25日上午9点被喂食一次，未发生呛咳。护工李阿姨(工号:C100)。';

interface SanitizeResult {
  sanitized: string;
  digest: string;
  policy: string[];
}

export default function ReportsPage() {
  const { message } = App.useApp();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [rawText, setRawText] = useState(EXAMPLE_TEXT);
  const [result, setResult] = useState<SanitizeResult | null>(null);

  const sanitizeMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch('/api/reports/sanitize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('脱敏失败');
      return res.json();
    },
    onSuccess: (payload) => {
      setResult(payload.data as SanitizeResult);
      setCurrent(2);
      message.success('脱敏完成，可直接导出合规文本');
    },
    onError: () => message.error('脱敏失败，请检查输入内容'),
  });

  const timelineItems = useMemo(() => {
    if (!result) {
      return [
        { color: 'green', content: '识别敏感实体：姓名、身份证、工号' },
        { color: 'blue', content: '执行不可逆映射与术语规范化' },
        { color: 'gray', content: '待生成审计摘要与哈希指纹' },
      ];
    }
    return [
      { color: 'green', content: `识别并处理策略：${result.policy.join('、')}` },
      { color: 'blue', content: `生成摘要指纹：${result.digest}` },
      { color: 'purple', content: '已写入合规导出缓存，可下载或回传监管侧' },
    ];
  }, [result]);

  const handleStart = () => {
    if (!rawText.trim()) {
      message.warning('请先输入原始护理日志');
      return;
    }
    setCurrent(1);
  };

  const handleSanitize = () => {
    sanitizeMutation.mutate(rawText);
  };

  const handleDownload = () => {
    if (!result) {
      message.warning('请先执行脱敏再导出');
      return;
    }
    const fileContent = `【合规脱敏结果】\n\n${result.sanitized}\n\n摘要指纹: ${result.digest}\n策略: ${result.policy.join(', ')}`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sanitized-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('脱敏报告已导出');
  };

  const handleReset = () => {
    setCurrent(0);
    setResult(null);
    setRawText(EXAMPLE_TEXT);
  };
  
  return (
    <div className="space-y-6">
      <Card title={<span className="text-xl font-bold"><SafetyOutlined className="mr-2"/>医保底稿隐私混淆与数据脱敏池</span>} className="shadow-sm rounded-xl">
        <Steps
          current={current}
          className="mb-8"
          items={[
            { title: '数据提取', subTitle: '政务内网接入点' },
            { title: 'AI 脱敏与改写', subTitle: '大模型实体擦除', icon: <RobotOutlined /> },
            { title: '安全封存', subTitle: '不可逆哈希' },
          ]}
        />
        
        {current === 0 && (
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <Typography.Title level={5}>护工工作日志（原件模拟）</Typography.Title>
            <TextArea 
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="font-mono text-gray-700 mb-4"
            />
            <Space wrap>
              <Button onClick={() => setRawText(EXAMPLE_TEXT)}>填充示例文本</Button>
              <Button type="primary" onClick={handleStart} className="font-bold">下一步：投入脱敏沙箱</Button>
            </Space>
          </div>
        )}

        {current === 1 && (
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 flex gap-6">
            <div className="flex-1">
              <Paragraph className="mb-4 text-indigo-800">系统将执行实体擦除、规则脱敏和术语规范化，输出可审计的监管文本。</Paragraph>
              <Timeline items={timelineItems} />
            </div>
            <div className="flex-1 text-center flex flex-col justify-center items-center">
                <RobotOutlined className="text-6xl text-indigo-500 animate-pulse mb-4" />
                <Button type="primary" onClick={handleSanitize} loading={sanitizeMutation.isPending} className="bg-indigo-600">完成清洗与脱敏</Button>
            </div>
          </div>
        )}

        {current === 2 && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
            <Typography.Title level={4} className="text-green-700">脱敏已完成，合法合规入库</Typography.Title>
            <div className="bg-white p-4 rounded text-left mt-4 mx-auto max-w-xl font-mono text-gray-700 border border-green-200 shadow-inner">
              <Tag color="green">已安全落表</Tag>
              <span className="ml-2">{result?.sanitized}</span>
              <div className="mt-3 text-xs text-gray-500">摘要指纹：{result?.digest}</div>
            </div>
            <Space className="mt-6" wrap>
              <Button className="font-bold" onClick={handleReset} icon={<ReloadOutlined />}>重新执行批次</Button>
              <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>导出脱敏文本</Button>
              <Button icon={<LockOutlined />} onClick={() => router.push('/commercial')}>回到商业中心跟进转化</Button>
            </Space>
          </div>
        )}
      </Card>
    </div>
  );
}
