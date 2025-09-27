import React from 'react';
import {useNavigate} from "react-router-dom";
import Pageable from "../../ui/pages/Pageable";


const ReviewHistory = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">Review History</h2>

            <Pageable endpoint={`/api/recensioni/all/user`}
                      id={"reviews"}

                      columns={[
                          {key: 'Review #', value: 'id', function: (id) => `#${id}`},
                          {
                              key: 'Date',
                              value: 'dataCreazione',
                              function: (dataCreazione) => new Date(dataCreazione).toLocaleString()
                          },
                          {
                              key: 'Book #',
                              value: 'libroId',
                              function: (libroId) => libroId
                          },
                          {
                              key: 'Stars',
                              value: 'stelle',
                              function: (stelle) => stelle
                          },
                          {
                              key: 'Title',
                              value: 'titolo',
                              function: (titolo) => titolo
                          },
                      ]}

                      onRowClick={(review) => navigate(`/book/${review.libroId}?focusReview=${review.id}`)}

                      noneFound={<div className="text-center text-gray-500">
                          <p>No reviews found.</p>
                          <p>Start reviewing books to see them here!</p>
                      </div>}

                      foundMessage={<div>
                          <p>Queste sono le recensioni che hai scritto.</p>
                          <p>Clicca su una recensione per visualizzarne i dettagli.</p>
                      </div>}
            />
        </div>
    );
};

export default ReviewHistory;