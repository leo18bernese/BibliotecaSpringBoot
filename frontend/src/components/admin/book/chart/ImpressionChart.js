import React, { useEffect, useState, useMemo } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import axios from "axios";

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

const periods = {
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
};

const metrics = [
    { key: "IMPRESSION", label: "Impressioni", color: "rgb(255, 99, 132)" },
    { key: "VIEW", label: "Visualizzazioni", color: "rgb(54, 162, 235)" },
    { key: "VIEW_IMAGE", label: "Visualizzazioni Immagine", color: "rgb(255, 206, 86)" }
];

const ImpressionChart = ({ productId }) => {
    const [period, setPeriod] = useState('1m');
    const [dataByMetric, setDataByMetric] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        setError(null);

        Promise.all(
            metrics.map(metric =>
                axios
                    .get(`/api/analytics/products/${productId}/timeseries/${metric.key}`)
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
    }, [productId]);

    const chartData = useMemo(() => {
        const dataPoints = periods[period];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - dataPoints);

        // Trova tutte le date uniche tra le metriche
        const allDates = new Set();
        metrics.forEach(metric => {
            (dataByMetric[metric.key] || []).forEach(item => {
                const d = new Date(item.date);
                if (d >= startDate) allDates.add(item.date);
            });
        });
        const sortedDates = Array.from(allDates).sort();

        // Per ogni metrica, crea un array di valori allineato alle date
        const datasets = metrics.map(metric => {
            const dataMap = {};
            (dataByMetric[metric.key] || []).forEach(item => {
                dataMap[item.date] = item.count;
            });
            return {
                label: metric.label,
                data: sortedDates.map(date => dataMap[date] || 0),
                borderColor: metric.color,
                backgroundColor: metric.color , // trasparente
                tension: 0.1
            };
        });

        return {
            labels: sortedDates,
            datasets
        };
    }, [period, dataByMetric]);

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Andamento Impressioni, Visualizzazioni e Visualizzazioni Immagine" }
        },
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "hour",
                    stepSize: 1,
                    displayFormats: { hour: "HH" },
                    tooltipFormat: "dd/MM/yyyy HH:mm"
                },
                title: { display: true, text: "Ora" }
            },
            y: {
                title: { display: true, text: "Numero" },
                beginAtZero: true,
                ticks: { stepSize: 1 }
            }
        }
    };

    if (loading) return <div>Caricamento...</div>;
    if (error) return <div>Errore: {error}</div>;
    if (!chartData.labels.length) return <div>Nessun dato disponibile.</div>;

    return (
        <div style={{ width: "90%", margin: "auto" }}>
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <strong>Periodo:</strong>
                {Object.keys(periods).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                            style={{ marginLeft: "5px", fontWeight: period === p ? "bold" : "normal" }}>
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>
            <Line options={options} data={chartData} />
        </div>
    );
};

export default ImpressionChart;
