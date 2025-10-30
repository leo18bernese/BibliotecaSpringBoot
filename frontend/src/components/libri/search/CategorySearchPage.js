import React from 'react';
import SearchPageTemplate from "./SearchPageTemplate";

function SearchPage({categoryId}) {

    return (
        <SearchPageTemplate
            initSearchParams={new URLSearchParams(`categoriaId=${categoryId}`)}
        />
    );
}

export default SearchPage;