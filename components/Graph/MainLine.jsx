"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
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
                backgroundColor: 'rgba(108, 176, 73, 0.2)',
                fill: true,
                tension: 0.4,
            },
        ],
    });

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
                const response = await axios.get('/api/Graph/Work/default'); // Update to your new API endpoint
                const { data } = response.data;

                const labels = data.dateWiseUpdates.map(item => item.date);
                const chartData = data.dateWiseUpdates.map(item => item.updatedCount);

                setLineData({
                    labels,
                    datasets: [
                        {
                            label: 'Queries',
                            data: chartData,
                            borderColor: '#6cb049',
                            backgroundColor: 'rgba(108, 176, 73, 0.2)',
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
    }, []);

    return (
        <div className="p-4  backdrop-blur-md bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Data Analysis By Date</h3>
            <div className="h-64">
                <Line data={lineData} options={options} />
            </div>
        </div>
    );
}
