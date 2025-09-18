import ImprViewChart from "./ImprViewChart";
const DailyImpressionChart = ({ productId }) => (
    <ImprViewChart
        productId={productId}
        resolution="daily"
    />
);
export default DailyImpressionChart;