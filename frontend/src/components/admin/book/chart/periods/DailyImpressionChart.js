import ImprViewChart from "./ImprViewChart";
const DailyImpressionChart = ({ productId }) => (
    <ImprViewChart
        productId={productId}
        resolution="daily"
        selectedPeriod="2w"
    />
);
export default DailyImpressionChart;