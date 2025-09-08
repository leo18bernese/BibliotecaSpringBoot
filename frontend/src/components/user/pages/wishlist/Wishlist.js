import React, {useContext} from 'react';
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import WishlistItem from "./WishlistItem";
import {UserContext} from "../../UserContext";

const fetchWishlist = async () => {
    const {data} = await axios.get("/api/wishlist");
    return data;
}

const Wishlist = () => {
    const {user} = useContext(UserContext);

    const {data: wishlist, isLoading, error} = useQuery({
        queryKey: ['wishlist'],
        queryFn: fetchWishlist,
        enabled: !!user
    });

    if (isLoading) {
        return <div className="text-center text-gray-500">Loading wishlist...</div>;
    }

    if (error) {
        console.error("Error fetching wishlist:", error);
        return <div className="text-center text-red-500">Error loading wishlist. Please try again later.</div>;
    }

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Your wishlist items!</h2>

            {wishlist.length === 0 ? (
                <div className="text-center text-gray-500">
                    <p>No wishlist items found.</p>
                    <p>Start adding books to your wishlist to see them here!</p>
                </div>
            ) : (
                <div>
                    <p>These are the items in your wishlist.</p>
                    <p>Click on an item to view its details.</p>

                    <table className="min-w-full divide-y divide-gray-200 mt-8">
                        <thead className="bg-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book
                                Title
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {wishlist.map((item) => (
                            <WishlistItem key={item.id} book={item}/>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Wishlist;