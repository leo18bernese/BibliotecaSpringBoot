import React, {useEffect, useMemo, useState} from "react";
import {Line} from "react-chartjs-2";
import axios from "axios";
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

const defaultPeriods = {
    '3d': 3,
    '1w': 7,
    '2w': 14,
    '1month': 30,
    '3month': 90,
    '6month': 180,
    '1y': 365,
    'all': 10000
};

const GenericTimeSeriesChart = ({
                                    apiUrls, metrics, chartTitle,
                                    options: customOptions, resolution,
                                    periods: customPeriods, selectedPeriod
                                }) => {
    const [dataByMetric, setDataByMetric] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const periods = customPeriods || defaultPeriods;
    const [period, setPeriod] = useState(selectedPeriod || Object.keys(periods)[0]);

    console.log(selectedPeriod, period);

    useEffect(() => {
        setLoading(true);
        setError(null);

        Promise.all(
            metrics.map((metric, idx) =>
                axios
                    .get(apiUrls[idx], {params: {resolution: resolution || "daily", period}})
                    .then(res => ({
                        key: metric.key,
                        data: (Array.isArray(res.data) ? res.data : Object.values(res.data)).map(item => ({
                            date: item.timestamp,
                            count: item.value
                        }))
                    }))
                    .catch(() => ({
                        key: metric.key,
                        data: []
                    }))
            )
        )
            .then(results => {
                const mapped = {};
                results.forEach(r => {
                    mapped[r.key] = r.data;
                });
                setDataByMetric(mapped);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [apiUrls, metrics, period, resolution]); // <-- aggiungi period e resolution qui

    const chartData = useMemo(() => {
        const dataPoints = periods[period];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - dataPoints);

        const allDates = new Set();
        metrics.forEach(metric => {
            (dataByMetric[metric.key] || []).forEach(item => {
                const d = new Date(item.date);
                if (d >= startDate) allDates.add(item.date);
            });
        });
        const sortedDates = Array.from(allDates).sort();

        const datasets = metrics.map(metric => {
            const dataMap = {};
            (dataByMetric[metric.key] || []).forEach(item => {
                dataMap[item.date] = item.count;
            });
            return {
                label: metric.label,
                data: sortedDates.map(date => dataMap[date] || 0),
                borderColor: metric.color,
                backgroundColor: metric.color,
                tension: 0.1
            };
        });

        return {
            labels: sortedDates,
            datasets
        };
    }, [period, dataByMetric, metrics]);

    const defaultOptions = {
        responsive: true,
        plugins: {
            legend: {position: "top"},
            title: {display: true, text: chartTitle}
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "hour",
                    stepSize: 1,
                    displayFormats: {hour: "HH"},
                    tooltipFormat: "dd/MM/yyyy HH:mm"
                },
                title: {display: true, text: "Ora"}
            },
            y: {
                title: {display: true, text: "Numero"},
                beginAtZero: true,
                ticks: {stepSize: 1}
            }
        }
    };

    const mergedOptions = {...defaultOptions, ...customOptions};

    if (loading) return <div>Caricamento...</div>;
    if (error) return <div>Errore: {error}</div>;

    return (
        <div style={{width: "90%", margin: "auto"}}>
            <div style={{marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <strong>Periodo:</strong>
                {Object.keys(periods).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                            style={{marginLeft: "5px", fontWeight: period === p ? "bold" : "normal"}}>
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>
            <Line options={mergedOptions} data={chartData}/>
        </div>
    );
};

export default GenericTimeSeriesChart;
