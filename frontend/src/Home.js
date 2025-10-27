import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {UserContext} from "./components/user/UserContext";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";
import HomepageSellers from "./components/utils/HomepageSellers";
import CategoryDisplay from "./components/category/CategoryDisplay";
import BookDisplay from "./components/libri/BookDisplay";
import {Toaster} from "react-hot-toast";


const fetchHomepageItems = async () => {
    const {data} = await axios.get("/api/home/libri");
    return data;
}

const fetchHomepageCategories = async () => {
    const {data} = await axios.get("/api/categories/homepage");
    return data;
}

export default function Home() {
    const {user} = useContext(UserContext);

    const {data: homepageIds, isLoading, error} = useQuery({
        queryKey: ['homepageItems'],
        queryFn: fetchHomepageItems,
        staleTime: Infinity, // Impedisce il refetch automatico
    });

    const {data: homepageCategories} = useQuery({
        queryKey: ['homepageCategories'],
        queryFn: fetchHomepageCategories,
        staleTime: Infinity, // Impedisce il refetch automatico
    });

    return (
        <div className=" container mx-auto">

            <Toaster/>

            <header className="App-header ">

                {user && (
                    <div className="user-info">
                        <h3 className="text-gray-700">Welcome back, {user.username}!</h3>
                    </div>
                )}
            </header>

            <HomepageSellers/>

            {/* Categorie */}
            <div className="flex justify-between items-center pt-10 pb-6">

                <h3 className="text-2xl  font-bold text-gray-800 py-2 pr-16  inline-block border-b-4 border-gray-800">Featured
                    Categories</h3>

                <Link className="text-lg font-bold text-blue-500  hover:underline" to="/categories">
                    View All >
                </Link>

            </div>

            <CategoryDisplay idList={homepageCategories} isLoading={isLoading} error={error}
                             gridCss={"grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-8 px-4 md:px-0"}
            />


            {/* Prodotti */}
            <div className="flex justify-between items-center pt-10 pb-6">

                <h3 className="text-2xl  font-bold text-gray-800 py-2 pr-16  inline-block border-b-4 border-gray-800">Products
                    for you</h3>

                <Link className="text-lg font-bold text-blue-500  hover:underline" to="/ricerca">
                    View All >
                </Link>

            </div>

            <BookDisplay idList={homepageIds} isLoading={isLoading} error={error}
                         gridCss={"grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-8 px-4 md:px-0"}
            />

        </div>
    );
}
