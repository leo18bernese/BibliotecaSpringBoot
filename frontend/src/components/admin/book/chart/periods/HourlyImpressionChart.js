import ImprViewChart from "./ImprViewChart";
const HourlyImpressionChart = ({ productId }) => (
    <ImprViewChart
        productId={productId}
        resolution="hourly"
        periods={{ '1d': 24, '3d': 72, '7d': 168, '14d': 336 }}
    />
);
export default HourlyImpressionChart;