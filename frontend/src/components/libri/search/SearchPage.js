import React from 'react';
import SearchPageTemplate from "./SearchPageTemplate";

function SearchPage() {

    return (
        <div className="container mx-auto py-12">
            <SearchPageTemplate
                enableSearchBar={false}
            />
        </div>
    );
}

export default SearchPage;