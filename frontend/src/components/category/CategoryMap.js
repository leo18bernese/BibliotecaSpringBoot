import React, {Fragment} from "react";
import {Link} from "react-router-dom";

const CategoryMap = ({map, considerLast = true}) => {
    return (
        <div className="mb-8">
            {Object.entries(map).map(([id, name], index) => {

                const last = index === Object.entries(map).length - 1 ;

                return (
                    <Fragment key={id}>

                        {(last&& !considerLast) ? <a className="mr-2 inline-block font-bold text-black">{name}</a> :
                            <Link
                                className={`text-sm mr-2 inline-block text-gray-700 underline hover:text-blue-700`}
                                to={`/category/${id}`}
                            >
                                {name}
                            </Link>
                        }

                        {!last && (
                            <span className="text-blue-600 font-bold mr-2"> > </span>
                        )}
                    </Fragment>
                );
            })}
        </div>
    );
}

export default CategoryMap;