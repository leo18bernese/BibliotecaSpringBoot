// src/components/admin/book/chart/periods/CartWishChart.js
import React from "react";
import GenericTimeSeriesChart from "../ImpressionChart";

const metrics = [
    {key: "ADD_TO_CART", label: "Aggiunte al Carrello", color: "rgb(75, 192, 192)"},
    {key: "ADD_TO_WISHLIST", label: "Aggiunte alla Lista Desideri", color: "rgb(153, 102, 255)"}
];

const CartWishChart = ({productId, resolution, periods, options, selectedPeriod}) => (
    <GenericTimeSeriesChart
        apiUrls={[
            `/api/analytics/products/${productId}/timeseries/ADD_TO_CART`,
            `/api/analytics/products/${productId}/timeseries/ADD_TO_WISHLIST`,
        ]}
        metrics={metrics}
        chartTitle="Andamento Impressioni, Visualizzazioni e Visualizzazioni Immagine"
        options={options}
        resolution={resolution}
        periods={periods}
        selectedPeriod={selectedPeriod}
    />
);

export default CartWishChart;
