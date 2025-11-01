const HomepageSellers = () => {

    return <div className="bg-blue-100/80 rounded-lg relative  p-6 overflow-hidden">

        <div className="absolute -top-16 -left-16 w-40 h-40 bg-blue-300/60 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-24 -right-10  w-56 h-56 bg-blue-300/60 rounded-full opacity-30 animate-pulse"></div>

        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">Top Sellers</h2>

        <div className="text-center text-blue-800">
            <p className="mb-2">Discover our top sellers and find your next favorite product from our curated selection.</p>
            <p className="mb-2">You can explore a variety of categories and enjoy exclusive deals.</p>

            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold">Discover More</button>
        </div>

    </div>
}

export default HomepageSellers;