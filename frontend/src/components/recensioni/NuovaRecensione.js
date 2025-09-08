import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate, useParams} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";

const NuovaRecensione = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    // The state is a single object 'response' which holds all form data.
    const [response, setResponse] = useState({
        id: id,
        titolo: '',
        testo: '',
        stelle: 5,
        approvato: true, // This field is set by default
        consigliato: true, // This field is also set by default
    });

    const [isLoading, setIsLoading] = useState(false);

    // Generic handler to update the 'response' state object.
    const handleInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setResponse(prevResponse => ({
            ...prevResponse,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation logic now correctly accesses properties of the 'response' object.
        if (response.stelle < 1 || response.stelle > 5) {
            toast.error("Il voto deve essere compreso tra 1 e 5.");
            setIsLoading(false);
            return;
        }
        if (!response.titolo || response.titolo.trim() === '') {
            toast.error("Il titolo della recensione non può essere vuoto.");
            setIsLoading(false);
            return;
        }
        if (!response.testo || response.testo.trim() === '') {
            toast.error("Il testo della recensione non può essere vuoto.");
            setIsLoading(false);
            return;
        }

        try {
            await axios.post(`/api/recensioni/${id}`, response);

            toast.success('Recensione inviata con successo!');

            setTimeout(() => {
                navigate(`/libri/${id}`);
            }, 1500);
        } catch (error) {
            console.error("Errore durante l'invio della recensione:", error);
            toast.error(error.response?.data?.message || 'Si è verificato un errore durante l\'invio.');
            setIsLoading(false);
        }
    };

    return (
        <>
            <div>
                <Toaster/>
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto py-6">
                    <div className="mb-4">
                        <h1 className="text-3xl font-semibold mb-4 text-gray-800">Dacci la tua opinione!</h1>
                        <label htmlFor="stelle" className="block text-gray-700 text-sm font-bold mb-2">
                            Voto (da 1 a 5)
                        </label>
                        <input
                            type="number"
                            id="stelle"
                            name="stelle" // Added name attribute
                            value={response.stelle}
                            onChange={handleInputChange} // Uses the generic handler
                            min="1"
                            max="5"
                            required
                            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="titolo" className="block text-gray-700 text-sm font-bold mb-2">
                            Titolo
                        </label>
                        <input
                            type="text"
                            id="titolo"
                            name="titolo" // Added name attribute
                            value={response.titolo}
                            onChange={handleInputChange} // Uses the generic handler
                            required
                            placeholder="Inserisci un titolo per la tua recensione"
                            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="testo" className="block text-gray-700 text-sm font-bold mb-2">
                            Recensione
                        </label>
                        <textarea
                            id="testo"
                            name="testo" // Added name attribute
                            rows="5"
                            value={response.testo}
                            onChange={handleInputChange} // Uses the generic handler
                            required
                            placeholder="Scrivi la tua recensione qui..."
                            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>


                    <div className="mb-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                id="consigliato"
                                name="consigliato" // Added name attribute
                                checked={response.consigliato} // 'checked' instead of 'value' for checkboxes
                                onChange={handleInputChange} // Uses the generic handler
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">Consiglieresti questo libro?</span>
                        </label>
                    </div>

                    <div className="mb-4">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                id="approvato"
                                name="approvato" // Added name attribute
                                checked={response.approvato} // 'checked' instead of 'value' for checkboxes
                                onChange={handleInputChange} // Uses the generic handler
                                className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span className="ml-2 text-gray-700">In conclusione approvi questo libro? <br/> Ci si riferisce a un libro che ti è piaciuto o che hai trovato utile.</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl focus:outline-none focus:shadow-outline disabled:bg-blue-300"
                        >
                            {isLoading ? 'Invio in corso...' : 'Invia Recensione'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default NuovaRecensione;