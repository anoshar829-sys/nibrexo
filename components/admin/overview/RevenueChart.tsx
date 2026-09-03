// Dependency-free SVG revenue trend, following the geometry of the original
// Nibrexo admin prototype (area + line + axis labels). Two viewBoxes are
// rendered from the same data: a wide one for desktop/tablet and a compact
// one for phones, so axis labels stay readable at every breakpoint.

import { formatCompactMoney, formatMoney } from "@/lib/admin/format";
import type { RevenuePoint } from "@/lib/admin/overview";

const HEIGHT = 190;
const PADDING = { top: 18, right: 12, bottom: 30, left: 12 };

type ChartProps = {
  points: RevenuePoint[];
  currency: string;
  width: number;
  maxLabels: number;
  labelSize: number;
  className: string;
  ariaLabel: string;
};

function ChartSvg({ points, currency, width, maxLabels, labelSize, className, ariaLabel }: ChartProps) {
  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const values = points.map((point) => point.totalCents || 0);
  const max = Math.max(...values, 1);

  const x = (index: number) =>
    PADDING.left + (points.length === 1 ? plotWidth / 2 : (index * plotWidth) / (points.length - 1));
  const y = (value: number) => PADDING.top + plotHeight * (1 - value / max);

  const linePoints = points.map((point, index) => `${x(index)},${y(point.totalCents || 0)}`).join(" ");
  const areaPath = `M ${x(0)} ${HEIGHT - PADDING.bottom} L ${linePoints.replace(/ /g, " L ")} L ${x(points.length - 1)} ${HEIGHT - PADDING.bottom} Z`;

  const labelStep = Math.max(1, Math.ceil(points.length / maxLabels));
  const gridValues = max > 0 ? [max, max / 2] : [0];

  return (
    <svg viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={ariaLabel} className={className}>
      {gridValues.map((value) => (
        <g key={value}>
          <line
            className="dashboard-chart__grid"
            x1={PADDING.left}
            x2={width - PADDING.right}
            y1={y(value)}
            y2={y(value)}
          />
          <text className="dashboard-chart__value" x={PADDING.left + 2} y={y(value) - 4}>
            {formatCompactMoney(Math.round(value), currency)}
          </text>
        </g>
      ))}
      <line
        className="dashboard-chart__baseline"
        x1={PADDING.left}
        x2={width - PADDING.right}
        y1={HEIGHT - PADDING.bottom}
        y2={HEIGHT - PADDING.bottom}
      />
      {points.length === 1 ? (
        <circle className="dashboard-chart__dot" cx={x(0)} cy={y(values[0])} r={4} />
      ) : (
        <>
          <path className="dashboard-chart__area" d={areaPath} />
          <polyline className="dashboard-chart__line" points={linePoints} />
        </>
      )}
      {points.map((point, index) => {
        const showLabel = index % labelStep === 0 || index === points.length - 1;
        const anchor = index === 0 ? "start" : index === points.length - 1 ? "end" : "middle";
        return (
          <g key={`${point.isoDate}-${index}`}>
            {showLabel ? (
              <text
                className="dashboard-chart__axis"
                x={x(index)}
                y={HEIGHT - 8}
                textAnchor={anchor}
                fontSize={labelSize}
              >
                {point.label}
              </text>
            ) : null}
            <circle className="dashboard-chart__hit" cx={x(index)} cy={y(point.totalCents || 0)} r={9}>
              <title>{`${point.label}: ${formatMoney(point.totalCents, currency)}${
                typeof point.orders === "number" ? ` · ${point.orders} ${point.orders === 1 ? "order" : "orders"}` : ""
              }`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

export function RevenueChart({
  points,
  currency,
}: Readonly<{
  points: RevenuePoint[];
  currency: string;
}>) {
  const total = points.reduce((sum, point) => sum + point.totalCents, 0);
  const peak = points.reduce(
    (best, point) => (point.totalCents > best.totalCents ? point : best),
    points[0],
  );
  const ariaLabel =
    points.length === 0
      ? "Revenue trend: no data"
      : `Revenue trend across ${points.length} periods. Total ${formatMoney(total, currency)}; peak ${peak.label} at ${formatMoney(peak.totalCents, currency)}.`;

  return (
    <div className="dashboard-chart">
      <ChartSvg
        points={points}
        currency={currency}
        width={980}
        maxLabels={12}
        labelSize={10}
        className="dashboard-chart__canvas dashboard-chart__canvas--wide"
        ariaLabel={ariaLabel}
      />
      <ChartSvg
        points={points}
        currency={currency}
        width={300}
        maxLabels={4}
        labelSize={11}
        className="dashboard-chart__canvas dashboard-chart__canvas--narrow"
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
