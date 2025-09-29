import React, {useMemo, useState} from 'react';
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
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns'; // Importa l'adattatore per le date

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale // Registra la scala temporale
);

// Funzione per generare dati di esempio su un periodo più lungo
const generateSampleData = (days) => {
    const data = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        data.push({
            date: date.toISOString().split('T')[0], // Formato YYYY-MM-DD
            sales: Math.floor(Math.random() * 20) + 1,
            returns: Math.floor(Math.random() * 5),
        });
    }
    return data;
};

// Genera dati per l'ultimo anno
const fullData = generateSampleData(365);

const periods = {
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '12m': 365,
};

const BookChart = () => {
    const [period, setPeriod] = useState('1m'); // Periodo di default: 1 mese
    const [visibleDatasets, setVisibleDatasets] = useState({
        sales: true,
        returns: true,
    });

    const handleVisibilityChange = (event) => {
        const {name, checked} = event.target;
        setVisibleDatasets(prevState => ({...prevState, [name]: checked}));
    };

    const chartData = useMemo(() => {
        const dataPoints = period === 'full' ? fullData.length : periods[period];
        const filteredData = fullData.slice(-dataPoints);

        const labels = filteredData.map(d => d.date);
        const datasets = [];

        if (visibleDatasets.sales) {
            datasets.push({
                label: 'Vendite giornaliere',
                data: filteredData.map(d => d.sales),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.1
            });
        }

        if (visibleDatasets.returns) {
            datasets.push({
                label: 'Resi giornalieri',
                data: filteredData.map(d => d.returns),
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.1
            });
        }

        return {labels, datasets};
    }, [period, visibleDatasets]);

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Andamento Vendite e Resi',
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
            }
        }
    };

    return (
        <div style={{width: '90%', margin: 'auto'}}>
            <div style={{marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <strong>Periodo:</strong>
                    {Object.keys(periods).concat('full').map(p => (
                        <button key={p} onClick={() => setPeriod(p)}
                                style={{marginLeft: '5px', fontWeight: period === p ? 'bold' : 'normal'}}>
                            {p.toUpperCase()}
                        </button>
                    ))}
                </div>
                <div>
                    <strong>Filtri:</strong>
                    <label style={{marginLeft: '10px'}}>
                        <input
                            type="checkbox"
                            name="sales"
                            checked={visibleDatasets.sales}
                            onChange={handleVisibilityChange}
                        /> Vendite
                    </label>
                    <label style={{marginLeft: '10px'}}>
                        <input
                            type="checkbox"
                            name="returns"
                            checked={visibleDatasets.returns}
                            onChange={handleVisibilityChange}
                        /> Resi
                    </label>
                </div>
            </div>
            <Line options={options} data={chartData}/>
        </div>
    );
};

export default BookChart;
