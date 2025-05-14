"use client"
import React from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement
);

export default function Page() {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [50, 60, 70, 80, 90],
        backgroundColor: '#6cb049',
        borderColor: '#29234b',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Revenue',
        data: [200, 300, 400, 300, 500],
        borderColor: '#6cb049',
        backgroundColor: 'rgba(108, 176, 73, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: ['Electronics', 'Clothing', 'Home Appliances'],
    datasets: [
      {
        label: 'Categories',
        data: [300, 150, 200],
        backgroundColor: ['#29234b', '#6cb049', '#F7DED0'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#29234b',
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          color: '#29234b',
        },
      },
      y: {
        grid: {
          color: 'rgba(0,0,0,0.1)',
        },
        ticks: {
          color: '#29234b',
        },
      },
    },
  };

  return (
    <div className=" mx-auto p-6  rounded-lg">
      <h2 className="text-2xl font-semibold text-center text-[#29234b] mb-8">
        Dashboard Analytics
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Bar Chart</h3>
          <div className="h-64">
            <Bar data={barData} options={options} />
          </div>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Line Chart</h3>
          <div className="h-64">
            <Line data={lineData} options={options} />
          </div>
        </div>
        <div className="p-4 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Pie Chart</h3>
          <div className="h-64">
            <Pie data={pieData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
}
