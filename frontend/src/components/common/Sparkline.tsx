import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

type SparklineProps = {
  data: number[];
  color: string;
};

export default function Sparkline({
  data,
  color,
}: SparklineProps) {
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data.map((value) => ({ value }))}
        >
          <defs>
            <linearGradient
              id={`gradient-${color.replace("#", "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={color}
                stopOpacity={0.35}
              />

              <stop
                offset="100%"
                stopColor={color}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#gradient-${color.replace("#", "")})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}