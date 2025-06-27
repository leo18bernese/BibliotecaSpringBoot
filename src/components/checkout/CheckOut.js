import React, {useContext, useState} from 'react';
import {UserContext} from "../user/UserContext";
import {useLocation, useNavigate} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import PaymentTabs from "./PaymentTabs";
import AdressForm from "./AdressForm";

const fetchPlaces = async () => {
    const {data} = await axios.get(`/api/spedizione/places`);
    return data;
}

const fetchCouriers = async (type) => {
    const {data} = await axios.get(`/api/spedizione/methods/type/${type}`);
    return data;
}

const fetchTotal = async () => {
    const {data} = await axios.get(`/api/carrello/total`);
    return data;
}


const CheckOut = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});

    const location = useLocation();
    const cart = location.state?.cart;

    const [locationType, setLocationType] = useState("");
    const [courierType, setCourierType] = useState("");
    const [shippingService, setShippingService] = useState("");

    const [shippingAddress, setShippingAddress] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const [couponCodes, setCouponCodes] = useState([]);

    const {data: places, isLoading: isLoadingPlaces} = useQuery({
        queryKey: ['shippingPlaces'],
        queryFn: fetchPlaces,
    });

    const {data: couriers, isLoading: isLoadingCouriers, error: errorCouriers} = useQuery({
        queryKey: ['shippingCouriers', locationType],
        queryFn: () => fetchCouriers(locationType),
        enabled: !!locationType, // Only fetch couriers if locationType is set
    });

    const {data: total, isLoading: isLoadingTotal} = useQuery({
        queryKey: ['cartTotal'],
        queryFn: fetchTotal,
    });

    const isLoading = isLoadingPlaces || isLoadingCouriers;

    if (isLoading) return <div>Loading...</div>;
    if (errorCouriers) return <div>Error loading couriers: {errorCouriers.message}</div>;

    console.log(places)
    console.log("selezionato", locationType);
    console.log("couriers", courierType);

    const sommaProdotti = total;
    const spedizione = (courierType && shippingService) ? couriers.find(c => c.id === courierType)?.offerte.find(o => o.tipo === shippingService)?.costo : 0;

    const disabled = !shippingService || !courierType || !locationType;

    const validate = () => {
        const newErrors = {};

        if (!locationType || !courierType || !shippingService) {
            newErrors.shipping = "Please select a shipping method, courier, and service.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const validateDiscountCode = async (code) => {
        console.log("errors1 ", errors);

        if(!code) {
            errors.coupon = "Please enter a discount code.";
            setErrors(errors);
            console.log("errors2 ", errors);

            return;
        }

        setErrors({}) ; // Reset coupon error
console.log("errors3 ", errors);

        const params = new URLSearchParams();
        params.append('codice', code);

        const {data} = axios.post(`/api/buono/validate`, params)
            .then(response => {
                console.log(response.data);
            })
            .catch(error => {
                console.error("Error validating discount code:", error);
                toast.error(error.response.data);
            });


    }

    return <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Check Out</h1>

        {user ? (
            <div>
                <Toaster/>

                <p className="text-gray-700">Welcome, {user.username}!</p>
                <p className="font-semibold text-gray-700 text-lg">Proceed with your order.</p>

                <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-4 text-gray-700 mt-6"
                     style={{alignItems: 'start'}}>
                    <div>
                        <div id="spedizione" className="bg-white p-6 rounded-lg"
                             style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>

                            <h2 className="text-lg font-semibold my-4">Metodo di spedizione</h2>

                            {places.map((place) => {
                                return (
                                    <button
                                        key={place.id}
                                        className={`flex items-center mb-4 border-2 border-gray-200 p-2 rounded-md shadow-sm w-full ${locationType === place.id ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                                        onClick={() => setLocationType(place.id)}
                                    >
                                        {place.description}
                                    </button>
                                );
                            })}

                            {locationType && (
                                <div className="border-t my-5">
                                    <h2 className="text-lg font-semibold my-4">Corriere</h2>

                                    {couriers.map((courier) => {
                                        console.log("courier", courier);
                                        return (
                                            <button
                                                key={courier.id}
                                                className={`flex items-center mb-4 border-2 border-gray-200 p-2 rounded-md shadow-sm w-full ${courierType === courier.id ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                                                onClick={() => setCourierType(courier.id)}
                                            >
                                                {courier.displayName}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {courierType && (
                                <div className="border-t my-5">
                                    <h2 className="text-lg font-semibold my-4">Servizio di spedizione</h2>

                                    {couriers.find(c => c.id === courierType)?.offerte.map((offerta) => {

                                        console.log("offerta", offerta);

                                        return (
                                            <button
                                                key={offerta.tipo}
                                                className={`flex items-center mb-4 border-2 border-gray-200 p-2 rounded-md shadow-sm w-full ${shippingService === offerta.tipo ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                                                onClick={() => setShippingService(offerta.tipo)}
                                            >
                                                {offerta.nome} ({offerta.giorniMinimo}-{offerta.giorniMassimo} giorni)
                                                - {offerta.costo}€
                                            </button>
                                        );
                                    })
                                    }
                                </div>
                            )}
                        </div>

                        <div id="indirizzo" className="bg-white p-6 rounded-lg my-8 "
                             style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                            <h2 className="text-lg font-semibold my-4">Indirizzo di Spedizione</h2>

                            {locationType === "" && (
                                <p className="text-sm text-gray-600 mb-4">Seleziona un luogo di spedizione per poter scegliere l'indirizzo di spedizione.</p>
                            )}

                            {locationType === "HOME" ? (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Indirizzo di casa</h3>

                                    <p className="text-sm text-gray-600 mb-4">Inserisci il tuo indirizzo di casa:</p>

                                    <AdressForm/>

                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-md font-semibold mb-2">Seleziona un punto di ritiro</h3>
                                </div>
                            )}


                        </div>

                        <div id="pagamento" className="bg-white p-6 rounded-lg my-8 "
                             style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>

                            <h2 className="text-lg font-semibold my-4">Metodo di pagamento</h2>

                            <PaymentTabs/>
                        </div>

                        <div id="pagamento" className="bg-white p-6 rounded-lg my-8 "
                             style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>

                            <h2 className="text-lg font-semibold my-4">Buoni Sconto</h2>
                            <p className="text-sm text-gray-600 mb-4">Se hai un buono sconto, inseriscilo qui:</p>

                            <div className="flex flex-grow ">
                                <div className=" w-4/6 mr-4">
                                    <input
                                        type="text"
                                        id="discountCode"
                                        placeholder="Inserisci codice sconto"
                                        className="border border-gray-300 rounded-md w-full p-2"
                                    />

                                    {errors.coupon && <p className="text-red-500 text-sm">{errors.coupon}</p>}
                                </div>


                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white rounded p-1 w-2/6 font-semibold "
                                    onClick={() => validateDiscountCode(document.getElementById("discountCode").value)}
                                > Applica Buono Sconto
                                </button>

                            </div>

                        </div>

                    </div>


                    <div id="riepilogo" className=" bg-white p-6 rounded-lg"
                         style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>
                        <h2 className="text-lg font-semibold my-4 text-gray-700">Riepilogo Ordine</h2>

                        <div className="flex justify-between border-t pt-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Carrello:</h3>
                            <h3 className="font-semibold text-right  text-gray-800">{sommaProdotti} €</h3>
                        </div>

                        <div className="flex justify-between border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500">Spesa di spedizione:</h3>
                            <h3 className="font-semibold text-right text-gray-800">{shippingService ? `+ ${spedizione} €` : "Da calcolare ..."}</h3>
                        </div>

                        <div className="flex justify-between py-2 text-lg">
                            <h3 className=" font-semibold">Totale:</h3>
                            <h3 className=" font-semibold text-right text-blue-700">{(parseFloat(sommaProdotti) + parseFloat(spedizione)).toFixed(2)} €</h3>
                        </div>

                        <button
                            className={`${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-xl mt-4 w-full`}
                            onClick={() => {

                                if (validate()) {
                                    toast.success("Order placed successfully!");
                                    navigate("/orders");
                                }
                            }}
                            disabled={!shippingService || !courierType || !locationType}
                        >Conferma Ordine
                        </button>
                    </div>
                </div>
            </div>
        ) : (
            toast.error("Please log in to proceed with checkout.") &&
            navigate("/login")
        )}
    </div>
};

export default CheckOut;