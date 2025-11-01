import React from 'react';
import SearchPageTemplate from "./SearchPageTemplate";

function CategorySearchPage({categoryId}) {

    return (
        <SearchPageTemplate
            initSearchParams={new URLSearchParams(`categoriaId=${categoryId}`)}
            enableSearchBar={false}
        />
    );
}

export default CategorySearchPage;