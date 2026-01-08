import { useMemo, useState } from "react";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

function buildDailySeries(orders, days = 7) {
  const dayKeys = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const revenue = Object.fromEntries(dayKeys.map((k) => [k, 0]));
  const count = Object.fromEntries(dayKeys.map((k) => [k, 0]));

  orders.forEach((o) => {
    const key = (o.created_at || "").split(" ")[0];
    if (!revenue.hasOwnProperty(key)) return;
    if (["paid", "shipped"].includes(o.status)) {
      revenue[key] += Number(o.total_amount || 0);
    }
    count[key] += 1;
  });

  return {
    labels: dayKeys,
    revenue: dayKeys.map((k) => revenue[k]),
    orders: dayKeys.map((k) => count[k]),
  };
}

export function AdminOverviewSection({ metrics, orders }) {
  const [period, setPeriod] = useState(7);
  const series = useMemo(() => buildDailySeries(orders || [], period), [orders, period]);
  if (!metrics) return null;

  const periodOptions = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "3 months", value: 90 },
    { label: "6 months", value: 180 },
    { label: "1 year", value: 365 },
  ];

  const revenueData = {
    labels: series.labels,
    datasets: [
      {
        label: "Revenue (paid + shipped)",
        data: series.revenue,
        borderColor: "rgba(59,130,246,1)",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const ordersData = {
    labels: series.labels,
    datasets: [
      {
        label: "Number of Orders",
        data: series.orders,
        borderColor: "rgba(16,185,129,1)",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categorySales = metrics.category_sales || [];
  const categoryData = {
    labels: categorySales.map(c => c.category),
    datasets: [{
      label: "Revenue per category",
      data: categorySales.map(c => c.revenue),
      backgroundColor: [
        "rgba(255,99,132,0.6)",
        "rgba(54,162,235,0.6)",
        "rgba(255,206,86,0.6)",
        "rgba(75,192,192,0.6)",
        "rgba(153,102,255,0.6)",
        "rgba(255,159,64,0.6)",
      ],
    }]
  };


  const topProducts = metrics.top_products || [];
  const topProductsData = {
    labels: topProducts.map(p => p.name),
    datasets: [{
      label: "Quantity Sold",
      data: topProducts.map(p => p.quantity),
      backgroundColor: "rgba(99,102,241,0.6)",
    }]
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(metrics)
          .filter(([key]) => !['category_sales', 'top_products'].includes(key))
          .map(([key, value]) => (
            <div key={key} className="border-b-1 border-b-stone-300 p-4 ">
              <div className="text-sm text-gray-600">{key}</div>
              <div className="text-xl font-semibold">{value}</div>
            </div>
          ))}
      </div>

      <div className="flex items-center">
        <span className="font-semibold">Period:</span>
        {periodOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPeriod(opt.value)}
            className={`px-3 py-1 hover:border-b-2 ${
              period === opt.value ? "border-b-2" : ""
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-b-1 border-b-stone-300 p-4">
          <h3 className="font-semibold mb-2">Revenue last {period} days</h3>
          {series.revenue.some((v) => v > 0) ? (
            <Line data={revenueData} options={{ plugins: { legend: { position: "bottom" } } }} />
          ) : (
            <p className="text-sm text-gray-600">No revenue data available.</p>
          )}
        </div>

        <div className="border-b-1 border-b-stone-300 p-4">
          <h3 className="font-semibold mb-2">Orders last {period} days</h3>
          {series.orders.some((v) => v > 0) ? (
            <Line data={ordersData} options={{ plugins: { legend: { position: "bottom" } } }} />
          ) : (
            <p className="text-sm text-gray-600">No order data available.</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-b-1 border-b-stone-300 p-4">
          <h3 className="font-semibold mb-2">Revenue per category</h3>
          {categorySales.length > 0 ? (
            <Doughnut 
              data={categoryData} 
              options={{ 
                plugins: { 
                  legend: { position: "right" },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed.toFixed(2)} PLN`
                    }
                  }
                } 
              }} 
            />
          ) : (
            <p className="text-sm text-gray-600">No sales data available.</p>
          )}
        </div>

        <div className="border-b-1 border-b-stone-300 p-4">
          <h3 className="font-semibold mb-2">Top 10 products</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              <Bar 
                data={topProductsData} 
                options={{ 
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { beginAtZero: true }
                  }
                }} 
              />
              <div className="mt-4 max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b-1 border-b-stone-300">
                      <th className="text-left p-2">Product</th>
                      <th className="text-right p-2">Qty</th>
                      <th className="text-right p-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map(p => (
                      <tr key={p.id} className="border-b-1 border-b-stone-300">
                        <td className="p-2">{p.name}</td>
                        <td className="text-right p-2">{p.quantity}</td>
                        <td className="text-right p-2">{p.revenue.toFixed(2)} PLN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Brak danych produktów.</p>
          )}
        </div>
      </div>
    </div>
  );
}
