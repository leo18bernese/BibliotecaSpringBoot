import React, {useContext, useState} from 'react';
import {UserContext} from "../user/UserContext";
import {useLocation, useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import PaymentTabs from "./PaymentTabs";

const fetchPlaces = async () => {
    const {data} = await axios.get(`/api/spedizione/places`);
    return data;
}

const fetchCouriers = async (type) => {
    const {data} = await axios.get(`/api/spedizione/methods/type/${type}`);
    return data;
}


const CheckOut = () => {
    const {user} = useContext(UserContext);
    const navigate = useNavigate();

    const location = useLocation();
    const cart = location.state?.cart;
    console.log(cart);

    const [locationType, setLocationType] = useState("");
    const [courierType, setCourierType] = useState("");
    const [shippingService, setShippingService] = useState("");

    const {data: places, isLoading: isLoadingPlaces} = useQuery({
        queryKey: ['shippingPlaces'],
        queryFn: fetchPlaces,
    });

    const {data: couriers, isLoading: isLoadingCouriers, error: errorCouriers} = useQuery({
        queryKey: ['shippingCouriers', locationType],
        queryFn: () => fetchCouriers(locationType),
        enabled: !!locationType, // Only fetch couriers if locationType is set
    });

    const isLoading = isLoadingPlaces || isLoadingCouriers;

    if (isLoading) return <div>Loading...</div>;
    if (errorCouriers) return <div>Error loading couriers: {errorCouriers.message}</div>;

    console.log("selezionato", locationType);
    console.log("couriers", courierType);

    const sommaProdotti = cart.reduce((total, item) => total + (item.prezzo * item.quantita), 0).toFixed(2)
    const spedizione = (courierType && shippingService) ? couriers.find(c => c.id === courierType)?.offerte.find(o => o.tipo === shippingService)?.costo : 0;

    return <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Check Out</h1>

        {user ? (
            <div>
                <p>Welcome, {user.username}!</p>
                <p>Proceed with your order.</p>

                <div id="spedizione" className="bg-white p-6 rounded-lg"
                     style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>

                    <h2 className="text-lg font-semibold my-4">Metodo di spedizione</h2>

                    {places.map((place) => {
                        return (
                            <div key={place.id} className="flex items-center mb-4">
                                <input
                                    type="radio"
                                    id={place.id}
                                    name="shippingPlace"
                                    value={place.id}
                                    checked={locationType === place.id}
                                    onChange={() => setLocationType(place.id)}
                                    className="mr-2"
                                />
                                <label htmlFor={place.id} className="cursor-pointer">
                                    {place.description}
                                </label>
                            </div>
                        );
                    })}

                    {locationType && (
                        <div className="border-t my-5">
                            <h2 className="text-lg font-semibold my-4">Corriere</h2>

                            {couriers.map((courier) => {
                                console.log("courier", courier);
                                return (
                                    <div key={courier.id} className="flex items-center mb-4">
                                        <input
                                            type="radio"
                                            id={courier.id}
                                            name="shippingCourier"
                                            value={courier.id}
                                            checked={courierType === courier.id}
                                            onChange={() => setCourierType(courier.id)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={courier.id} className="cursor-pointer">
                                            {courier.displayName}
                                        </label>
                                    </div>
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
                                    <div key={offerta.tipo} className="flex items-center mb-4">
                                        <input
                                            type="radio"
                                            id={offerta.tipo}
                                            name="shippingService"
                                            value={offerta.tipo}
                                            checked={shippingService === offerta.tipo}
                                            onChange={() => setShippingService(offerta.tipo)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={offerta.tipo} className="cursor-pointer">
                                            {offerta.nome} ({offerta.giorniMinimo}-{offerta.giorniMassimo} giorni)
                                            - {offerta.costo}€
                                        </label>
                                    </div>
                                );
                            })
                            }
                        </div>
                    )}
                </div>

                <div id="pagamento"className="bg-white p-6 rounded-lg my-8 "
                     style={{boxShadow: '0 4px 7px rgba(0, 0, 0, 0.1)'}}>

                        <h2 className="text-lg font-semibold my-4">Metodo di pagamento</h2>

                        <PaymentTabs />
                </div>

                <div id="riepilogo">
                    {shippingService && (
                        <div className="border-t my-5">
                            <h2 className="text-lg font-semibold my-4">Riepilogo Ordine</h2>

                            <div className="flex justify-between">
                                <h3 className="text-md font-semibold">Carrello:</h3>
                                <h3 className="text-md font-semibold text-right">{sommaProdotti} €</h3>
                            </div>
                            <div className="flex justify-between">
                                <h3 className="text-md font-semibold">Spesa di spedizione:</h3>
                                <h3 className="text-md font-semibold text-right">+ {spedizione} €</h3>
                            </div>
                            <div className="flex justify-between">
                                <h3 className="text-md font-semibold">Totale:</h3>
                                <h3 className="text-md font-semibold text-right">{(parseFloat(sommaProdotti) + parseFloat(spedizione)).toFixed(2)} €</h3>
                            </div>

                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4"
                                onClick={() => {
                                    toast.success("Order placed successfully!");
                                    navigate("/orders");
                                }}
                            >Conferma Ordine
                            </button>
                        </div>
                    )}
                </div>

            </div>
        ) : (
            toast.error("Please log in to proceed with checkout.") &&
            navigate("/login")
        )}
    </div>
};

export default CheckOut;