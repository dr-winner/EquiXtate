
import React from 'react';
import { ChartTooltip } from "@/components/ui/chart";

const ChartTooltipCustom: React.FC = () => {
  return (
    <ChartTooltip 
      content={({ active, payload }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
              <div className="font-medium">{payload[0].payload.month}</div>
              {payload.map((entry, index) => (
                <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.stroke }}
                  />
                  <span>
                    {entry.name === "portfolio" ? "Portfolio: " : "Property: "}
                    ${entry.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          );
        }
        return null;
      }}
    />
  );
};

export default ChartTooltipCustom;
