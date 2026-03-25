'use client';
import React, { useState } from 'react';
import { Card, Steps, Input, Button, Timeline, Typography, Tag } from 'antd';
import { RobotOutlined, CheckCircleOutlined, SafetyOutlined, LockOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

export default function ReportsPage() {
  const [current, setCurrent] = useState(0);
  
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
              rows={4} 
              defaultValue="病人王富贵(身份证：110105194503221918)在2026年3月25日上午9点被喂食一次，未发生呛咳。护工李阿姨(工号:C100)。"
              disabled
              className="font-mono text-gray-500 mb-4"
            />
            <Button type="primary" onClick={() => setCurrent(1)} className="font-bold">下一步：投入脱敏沙箱</Button>
          </div>
        )}

        {current === 1 && (
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 flex gap-6">
            <div className="flex-1">
               <Timeline
                  items={[
                    { color: 'green', children: '识别敏感实体：[王富贵] [身份证...] [李阿姨]' },
                    { color: 'blue', children: '应用混淆规则：姓名转拼音缩写，身份证转哈希' },
                    { color: 'red', children: '重构描述语义 (大语言模型介入)' },
                  ]}
                />
            </div>
            <div className="flex-1 text-center flex flex-col justify-center items-center">
                <RobotOutlined className="text-6xl text-indigo-500 animate-pulse mb-4" />
                <Button type="primary" onClick={() => setCurrent(2)} className="bg-indigo-600">完成清洗与脱敏</Button>
            </div>
          </div>
        )}

        {current === 2 && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
            <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
            <Typography.Title level={4} className="text-green-700">脱敏已完成，合法合规入库</Typography.Title>
            <div className="bg-white p-4 rounded text-left mt-4 mx-auto max-w-xl font-mono text-gray-700 border border-green-200 shadow-inner">
               <Tag color="green">已安全落表</Tag> 病人 W** (ID: 8F9C2B...) 在规范时间段内完成【进食】服务，未见异常记录。关联工单：C100。
            </div>
            <Button className="mt-6 font-bold" onClick={() => setCurrent(0)} icon={<LockOutlined />}>重新执行批次</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
