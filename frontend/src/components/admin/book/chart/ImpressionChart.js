import React, {useState, useMemo, useEffect} from 'react';
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
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
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

const ImpressionChart = ({bookId}) => {
    const [period, setPeriod] = useState('1m');
    const [fullData, setFullData] = useState({views: [], impressions: []});
    const [allUnique, setAllUnique] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!bookId) return;
            setLoading(true);
            try {
                const {data} = await axios.get(`/api/impressions/all/${bookId}`);
                const {data: uniqueData} = await axios.get(`/api/impressions/unique/${bookId}`);

                const allEvents = data.flatMap(item => item.events || []);

                const aggregateEvents = (events, type) => {
                    const filteredEvents = events.filter(event => event.type === type);
                    const countsByDate = filteredEvents.reduce((acc, event) => {
                        const date = event.timestamp.split('T')[0];
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                    }, {});

                    return Object.keys(countsByDate).map(date => ({
                        date: date,
                        count: countsByDate[date],
                    })).sort((a, b) => new Date(a.date) - new Date(b.date));
                };

                const aggregatedViews = aggregateEvents(allEvents, 'VIEW');
                const aggregatedImpressions = aggregateEvents(allEvents, 'IMPRESSION');


                setFullData({views: aggregatedViews, impressions: aggregatedImpressions});
                setAllUnique(uniqueData);

                console.log("Aggregated Views:", aggregatedViews);
                console.log("Unique Data:", uniqueData);
            } catch (e) {
                setError(e.message);
                console.error("Failed to fetch impressions:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookId]);

    const chartData = useMemo(() => {
        const dataPoints = periods[period];
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - dataPoints);

        const filterDataByPeriod = (data) => {
            if (!dataPoints) return data;
            return data.filter(item => new Date(item.date) >= startDate);
        };

        const filteredViews = filterDataByPeriod(fullData.views);
        const filteredImpressions = filterDataByPeriod(fullData.impressions);

        const allDates = [...new Set([
            ...filteredViews.map(d => d.date),
            ...filteredImpressions.map(d => d.date)
        ])].sort((a, b) => new Date(a) - new Date(b));

        const createDataset = (data, allLabels) => {
            const dataMap = new Map(data.map(item => [item.date, item.count]));
            return allLabels.map(label => dataMap.get(label) || 0);
        };

        return {
            labels: allDates,
            datasets: [
                {
                    label: 'Visualizzazioni (VIEW)',
                    data: createDataset(filteredViews, allDates),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.1
                },
                {
                    label: 'Impressioni (IMPRESSION)',
                    data: createDataset(filteredImpressions, allDates),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.1
                }
            ]
        };
    }, [period, fullData]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Andamento Interazioni Prodotto',
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day',
                    tooltipFormat: 'dd/MM/yyyy',
                },
                title: {
                    display: true,
                    text: 'Data'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Numero di Eventi'
                },
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    if (loading) return <div>Caricamento dati...</div>;
    if (error) return <div>Errore nel caricamento dei dati: {error}</div>;

    return (
        <div style={{width: '90%', margin: 'auto'}}>
            <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <strong>Periodo:</strong>
                {Object.keys(periods).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                            style={{marginLeft: '5px', fontWeight: period === p ? 'bold' : 'normal'}}>
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>

            <Line options={options} data={chartData}/>

            <div style={{marginTop: '30px', textAlign: 'center'}}>
                <h3>Eventi Unici</h3>
                <ul style={{listStyle: 'none', padding: 0}}>
                    {Object.entries(allUnique).map(([key, value]) => (
                        <li key={key} style={{margin: '8px 0'}}>
                            <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default ImpressionChart;
