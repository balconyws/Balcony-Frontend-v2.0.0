'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { ChartData } from '@/types';
import { ChartServerActions } from '@/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const chartConfig = {
  transactions: {
    label: 'Transactions',
  },
  workspace: {
    label: 'workspace booking',
    color: 'var(--chart-1)',
  },
  property: {
    label: 'property subscription',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

type Props = object;

const DashboardChart: React.FC<Props> = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<string>('30d');

  useEffect(() => {
    const fetchChartData = async () => {
      const res = await ChartServerActions.GetData({ range: '3 months' });
      if ('data' in res) {
        setData(res.data.result);
      }
    };
    fetchChartData();
  }, []);

  const filteredData = data.filter((item: ChartData) => {
    const date = new Date(item.date);
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    now.setDate(now.getDate() - daysToSubtract);
    return date >= now;
  });

  return (
    <Card className="w-full border border-border rounded-none lg:rounded-lg box-shadow-primary">
      <CardHeader className="flex lg:items-center gap-2 space-y-0 lg:border-b px-6 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-left">
          <CardTitle className="text-[15px] font-semibold leading-4 tracking-[-1px]">
            Transaction analysis
          </CardTitle>
          <CardDescription className="text-[#71717A] text-[13px] leading-5">
            Showing total transactions for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-md sm:ml-auto border-border px-[13px] py-2 gap-[25px] text-[#09090B] text-[13px] font-normal leading-5">
            <SelectValue
              className="text-[#09090B] text-[13px] font-normal leading-5"
              placeholder="Last 3 months"
            />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem
              value="90d"
              className="rounded-lg text-[#09090B] text-[13px] font-normal leading-5">
              Last 3 months
            </SelectItem>
            <SelectItem
              value="30d"
              className="rounded-lg text-[#09090B] text-[13px] font-normal leading-5">
              Last 30 days
            </SelectItem>
            <SelectItem
              value="7d"
              className="rounded-lg text-[#09090B] text-[13px] font-normal leading-5">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillWorkspace" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-workspace)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-workspace)" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="fillProperty" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-property)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-property)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={value => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={value =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="workspace"
              type="natural"
              fill="url(#fillWorkspace)"
              stroke="var(--color-workspace)"
              stackId="a"
            />
            <Area
              dataKey="property"
              type="natural"
              fill="url(#fillProperty)"
              stroke="var(--color-property)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} className="pt-6 pb-4" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardChart;
