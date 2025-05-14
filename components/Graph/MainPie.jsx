"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Page() {
    const [pieData, setPieData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Total Queries',
                data: [],
                backgroundColor: [
                    '#F7CB73',
                    '#6cb049',
                    '#C3615E',
                ],
                hoverOffset: 6,
            },
        ],
    });

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#29234b',
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw || 0;
                        return `${label}: ${value}`;
                    },
                },
            },
        },
    };

    // Fetch data from API for the pie chart
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/Graph/Status/default');
                const result = response.data.fetch;

                const labels = result.map(item => item.label); // Extract labels
                const data = result.map(item => item.value);

                setPieData(prevData => ({
                    ...prevData,
                    labels,
                    datasets: [{
                        ...prevData.datasets[0],
                        data,
                    }],
                }));
            } catch (error) {
                console.error("Error fetching data:", error);
                // Optionally, set some error state here
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-4 bg-white shadow-lg rounded-lg">
            {/* <h3 className="text-lg font-semibold text-center text-[#6cb049] mb-4">Data Analysis By Month</h3> */}
            <div className=" h-80 flex items-center justify-center">
                <Pie data={pieData} options={options} />
            </div>
        </div>
    );
}
