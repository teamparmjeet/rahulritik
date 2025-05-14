"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
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
    const [lineData, setLineData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Queries',
                data: [],
                borderColor: '#6cb049',
                backgroundColor: '#6cb049',
                fill: true,
                tension: 0.4,
            },
        ],
    });
    const [year, setYear] = useState(new Date().getFullYear()); // Default to current year

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

    // Fetch data from API for the line chart
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/Graph/comequeries/default');
                const result = response.data.fetch;

                // Filter data to only include entries for the selected year
                const filteredData = result.filter(item => item.year === year);

                const labels = filteredData.map(item => item.month);
                const data = filteredData.map(item => item.totalQueries);

                setLineData({
                    labels,
                    datasets: [
                        {
                            label: `Queries for ${year}`,
                            data,
                            borderColor: '#6cb049',
                            backgroundColor: '#6cb049',
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                });
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [year]); 

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Monthly Queries Overview</h3>

           
            <div className="mb-4 flex ">
                <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="px-2 py-1 text-gray-500 bg-white border border-gray-200  placeholder:text-gray-400 focus:border-[#6cb049] focus:outline-none focus:ring-[#6cb049] sm:text-sm"
                >
                    <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                   
                    <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                </select>
            </div>

            <div className="h-64">
                <Bar data={lineData} options={options} />
            </div>
        </div>
    );
}
