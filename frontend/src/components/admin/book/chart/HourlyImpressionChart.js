import React from "react";
import GenericTimeSeriesChart from "./ImpressionChart";

const HourlyImpressionChart = ({ productId }) => (
    <GenericTimeSeriesChart
        apiUrls={[
            `/api/analytics/products/${productId}/timeseries/IMPRESSION`,
            `/api/analytics/products/${productId}/timeseries/VIEW`,
            `/api/analytics/products/${productId}/timeseries/VIEW_IMAGE`
        ]}
        metrics={[
            { key: "IMPRESSION", label: "Impressioni", color: "rgb(255, 99, 132)" },
            { key: "VIEW", label: "Visualizzazioni", color: "rgb(54, 162, 235)" },
            { key: "VIEW_IMAGE", label: "Visualizzazioni Immagine", color: "rgb(255, 206, 86)" }
        ]}
        chartTitle="Andamento Impressioni, Visualizzazioni e Visualizzazioni Immagine"
        options={{
            // opzioni personalizzate Chart.js
        }}
        resolution="hourly"
    />
);

export default HourlyImpressionChart;
