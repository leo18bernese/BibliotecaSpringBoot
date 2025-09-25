import ImprViewChart from "./ImprViewChart";

const DailyImpressionChart = ({productId}) => {

    const options = {
        scales: {
            x: {
                type: "time",
                time: {
                    unit: "day",
                    stepSize: 1,
                    tooltipFormat: "dd/MM/yyyy"
                },
                title: {
                    display: true, text: "Giorno"
                }
            }
        }
    }

    return <ImprViewChart
        productId={productId}
        resolution="daily"
        selectedPeriod="2w"
        options={options}
    />
};
export default DailyImpressionChart;