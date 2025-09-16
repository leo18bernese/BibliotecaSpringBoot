import React, { useEffect, useState } from "react";
import axios from "axios";

const AnalyticsOverview = ({ productId }) => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`/api/analytics/products/${productId}/timeseries/IMPRESSION`)
            .then((res) => {
                setOverview(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [productId]);

    if (loading) return <div>Caricamento...</div>;
    if (!overview) return <div>Nessun dato disponibile.</div>;

    return (
        <div>
            <h2>Analytics Overview</h2>
            <pre>{JSON.stringify(overview, null, 2)}</pre>
        </div>
    );
};

export default AnalyticsOverview;