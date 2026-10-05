import React from "react";
import Chart from "chart.js/auto";

const TopProducts = ({ data = null }) => {
  // default mock data if none provided
  const products = data || [
    { name: "สินค้า A", sold: 320 },
    { name: "สินค้า B", sold: 210 },
    { name: "สินค้า C", sold: 180 },
    { name: "สินค้า D", sold: 140 },
    { name: "สินค้า E", sold: 95 },
  ];

  return (
    <div className="card bg-white shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-3">สินค้าขายดีประจำเดือน</h3>
      <ul className="space-y-3">
        {products.map((p, idx) => (
          <li key={p.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold">
                {idx + 1}
              </div>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">ยอดขาย: {p.sold}</div>
              </div>
            </div>
            <div className="text-sm text-gray-600 font-semibold">{p.sold}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopProducts;
