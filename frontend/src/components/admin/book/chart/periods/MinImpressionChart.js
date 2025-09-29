import ImprViewChart from "./ImprViewChart";

const MinImpressionChart = ({productId}) => (
    <ImprViewChart
        productId={productId}
        resolution="20min"
        periods={{'1h': 1, '3h': 3, '6h': 6, '12h': 12, '1d': 24, '3d': 72}}
        selectedPeriod="1d"
    />
);
export default MinImpressionChart;