
import React from 'react';
import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart"; 
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Calendar } from "lucide-react";

interface ChartDataPoint {
  month: string;
  value: number;
  propertyValue: number;
}

interface PortfolioChartProps {
  portfolioData: ChartDataPoint[];
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ portfolioData }) => {
  // Chart configuration
  const chartConfig = {
    portfolio: {
      label: "Portfolio Value",
      theme: {
        light: "#10b981",
        dark: "#10b981"
      }
    },
    property: {
      label: "Property Value",
      theme: {
        light: "#8b5cf6",
        dark: "#8b5cf6"
      }
    }
  };

  return (
    <Card className="bg-space-deep-purple/30 border-space-deep-purple p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-orbitron text-lg text-white">Portfolio Performance</h3>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">Last 6 months</span>
        </div>
      </div>
      
      <div className="h-64">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <Line 
                name="portfolio"
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#10b981', strokeWidth: 2, r: 6 }}
              />
              <Line 
                name="property"
                type="monotone" 
                dataKey="propertyValue" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 6 }}
              />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} 
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-space-neon-green" />
          <span className="text-sm text-gray-300">Portfolio Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-space-neon-purple" />
          <span className="text-sm text-gray-300">Property Value</span>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioChart;
