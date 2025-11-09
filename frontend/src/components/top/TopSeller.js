import TopTemplate from "./TopTemplate";
import {fetchTopItems} from "../admin/book/chart/useAnalytics";
import {useQuery} from "@tanstack/react-query";

const TopSeller = () => {

    const {data, isLoading, error} = useQuery({
        queryKey: ['topSellerBooks'],
        queryFn: () => fetchTopItems('BEST_SELLERS_UNITS', true),
        staleTime: Infinity,
    });

    return (
        <TopTemplate title={'Top Seller'} description={'Discover the best-selling books that readers love.'}
                     idList={data} isLoading={isLoading} error={error}/>
    );
}

export default TopSeller;
