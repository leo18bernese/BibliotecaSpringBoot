import React, {useContext, useEffect, useRef, useState} from 'react';
import {UserContext} from "../user/UserContext";
import {Link, useNavigate} from "react-router-dom";
import toast, {Toaster} from "react-hot-toast";
import axios from "axios";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import PaymentTabs from "./PaymentTabs";
import AddressForm from "./AddressForm";
import {useCarrello} from "../hook/useCarrello";

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
    const queryClient = useQueryClient();

    const [errors, setErrors] = useState({});
    const errorRef = useRef(null);

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

    const [showSavedAddresses, setShowSavedAddresses] = useState(false);
    const [selectedSavedAddress, setSelectedSavedAddress] = useState(null);

    const [orderId, setOrderId] = useState(null);

    const handleAddressChange = (e) => {
        const {name, value} = e.target;
        setShippingAddress(prev => ({...prev, [name]: value}));
        if (errors[name]) {
            setErrors(prev => ({...prev, [name]: null}));
        }
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0 && errorRef.current) {
            errorRef.current.focus();
            errorRef.current.scrollIntoView({behavior: 'smooth', block: 'center'});
        }
    }, [errors]);

    const {data: places, isLoading: isLoadingPlaces} = useQuery({
        queryKey: ['shippingPlaces'],
        queryFn: fetchPlaces,
    });

    const {data: couriers, isLoading: isLoadingCouriers, error: errorCouriers} = useQuery({
        queryKey: ['shippingCouriers', locationType],
        queryFn: () => fetchCouriers(locationType),
        enabled: !!locationType, // Only fetch couriers if locationType is set
    });

    const {carrello, isLoadingCart, errorCart, isErrorCart} = useCarrello();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!carrello || !isLoadingCart || !carrello.canCheckout) {

            console.log("counter", countdown);

            if (countdown <= 0) {
                navigate("/cart", {replace: true});
                return;
            }

            const countdownInterval = setInterval(() => {
                if (!carrello.canCheckout) {
                    setCountdown(prevCountdown => prevCountdown > 0 ? prevCountdown - 1 : 0);
                }
            }, 1000);

            return () => {
                clearInterval(countdownInterval);
            };
        }
    }, [carrello, countdown, isLoadingCart, navigate]);


    const sendOrder = async () => {

        const addr = {
            nome: shippingAddress.name,
            indirizzo: shippingAddress.address + " " + (shippingAddress.houseNumber || ""),
            citta: shippingAddress.city,
            cap: shippingAddress.postalCode,
            provincia: shippingAddress.country, // Assuming country is used as province here
            telefono: "" // Add phone number if needed
        }

        const {data} = await axios.post(`/api/carrello/invia`, {
            luogoSpedizione: locationType,
            corriereId: courierType,
            tipoSpedizioneId: shippingService,
            indirizzoSpedizione: addr,
            speseSpedizione: spedizione,
            metodoPagamento: ""
        });

        setOrderId(data.id);
        return data;
    }


    const mutation = useMutation({
        mutationFn: sendOrder,
        onSuccess: (data) => {
            toast.success('Ordine inviato con successo!');


            let secondsPassed = 0;
            const interval = setInterval(() => {
                secondsPassed++;

                // se troviamo orderId, reindirizziamo e fermiamo il loop
                if (data?.id) {
                    clearInterval(interval);
                    navigate(`/ordine/${data.id}`, { replace: true });
                }

                // se passano 5 secondi senza orderId, stop
                if (secondsPassed >= 5) {
                    clearInterval(interval);
                    toast.error("Impossibile recuperare i dettagli dell'ordine. Controlla la tua email per la conferma dell'ordine.");
                    navigate("/", { replace: true });
                }
            }, 1000);
        },
        onError: (error) => {
            toast.error(
                `Errore nell'invio dell'ordine: ${error.response?.data?.message || error.message}`
            );
        },
    });

    const isLoading = isLoadingPlaces || isLoadingCouriers || isLoadingCart;

    if (isLoading) return <div>Loading...</div>;
    if (errorCouriers) return <div>Error loading couriers: {errorCouriers.message}</div>;
    if (isErrorCart) return <div>Error loading cart: {errorCart.message}</div>;


    if (!carrello || !carrello.canCheckout) {
        return <div className="container mx-auto p-4 text-gray-700">
            <h1 className="text-2xl font-bold mb-4">Checkout Not Available</h1>

            <p><span className="underline">Your cart is not eligible for checkout</span>, it may be empty or contain
                items may be out of stock.</p>

            <h3 className="mt-8">You will be automatically redirected to your cart in <span
                className="underline text-lg text-blue-700 font-bold">{countdown}</span> seconds. <br/>
                If you are not redirected, click

                <Link to="/cart" replace={true} className="text-blue-700 underline mx-1.5">
                    here
                </Link>

                to go to your cart.
            </h3>
        </div>;
    }

    const sommaProdotti = carrello.totale;
    const spedizione = (courierType && shippingService) ? couriers.find(c => c.id === courierType)?.offerte.find(o => o.tipo === shippingService)?.costo : 0;
    const prezzoFinale = (parseFloat(carrello.finale) + parseFloat(spedizione)).toFixed(2);

    const disabled = !shippingService || !courierType || !locationType;

    const validate = () => {
        const newErrors = {};


        if (!locationType || !courierType || !shippingService) {
            newErrors.shipping = "Please select a shipping method, courier, and service.";
        }

        if (locationType === 'HOME') {
            if (!shippingAddress.name) newErrors.name = 'Name is required.';
            if (!shippingAddress.address) newErrors.address = 'Address is required.';
            if (!shippingAddress.city) newErrors.city = 'City is required.';
            if (!shippingAddress.postalCode) newErrors.postalCode = 'Postal code is required.';
            if (!shippingAddress.country) newErrors.country = 'Country is required.';
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    const validateDiscountCode = async (code) => {

        if (!code) {
            setErrors({coupon: "Please enter a discount code."});

            return;
        }

        const params = new URLSearchParams();
        params.append('codice', code);

        const {data} = axios.post(`/api/buono/validate`, params)
            .then(async response => {
                setErrors({}); // Reset coupon error
                toast.success("Discount code applied successfully!");

                console.log("coup ", response.data);
                await queryClient.invalidateQueries(['carrello', user?.id]);

            })
            .catch(error => {
                setErrors({coupon: error.response.data || "Error validating discount code."});
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
                                        onClick={() => {
                                            setLocationType(place.id);
                                            setCourierType("");
                                            setShippingService("");
                                        }}
                                    >
                                        {place.description}
                                    </button>
                                );
                            })}

                            {locationType && (
                                <div className="border-t my-5">
                                    <h2 className="text-lg font-semibold my-4">Corriere</h2>

                                    {couriers.map((courier) => {
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
                                        const min = offerta.giorniMinimo;
                                        const max = offerta.giorniMassimo;

                                        return (
                                            <button
                                                key={offerta.tipo}
                                                className={`flex items-center mb-4 border-2 border-gray-200 p-2 rounded-md shadow-sm w-full ${shippingService === offerta.tipo ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}
                                                onClick={() => setShippingService(offerta.tipo)}
                                            >
                                                {offerta.nome} ({(min === max) ? min : `${min}-${max}`} giorni)
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
                                <p className="text-sm text-gray-600 mb-4">Seleziona un luogo di spedizione per poter
                                    scegliere l'indirizzo di spedizione.</p>
                            )}

                            {locationType === "HOME" ? (
                                <div>
                                    <p className="text-sm text-gray-600 mb-4">Inserisci i dettagli dell'indirizzo che
                                        desideri utilizzare per questa spedizione.</p>
                                    <p className="text-sm text-gray-600 mb-4">È possibile modificare l'indirizzo scelta
                                        PRIMA che l'ordine venga impacchettato. <br/>
                                        Se commetti un errore correggilo il prima possibile essendo che l'ordine viene
                                        poi gestito dal corriere e non da noi.</p>

                                    {user.indirizzi.length > 0 && (
                                        <div className="mb-8">
                                            <div className="mt-5">
                                                {showSavedAddresses ? (
                                                    <button
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700  rounded p-3 transition"
                                                        onClick={() => setShowSavedAddresses(false)}>
                                                        Nascondi Indirizzi Salvati
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700  rounded p-3 transition"
                                                        onClick={() => setShowSavedAddresses(true)}>
                                                        Mostra Indirizzi Salvati ({user.indirizzi.length})
                                                    </button>
                                                )}
                                            </div>

                                            {showSavedAddresses &&
                                                <div className="ml-6 mt-4">

                                                    <div
                                                        className="border px-3 py-3 mb-2 rounded hover:bg-gray-50 cursor-pointer flex items-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Implement edit functionality if needed
                                                            toast("Add new address functionality not implemented yet.");
                                                        }}>

                                                        <i className='bxr bxs-plus-square text-2xl'
                                                           style={{color: '#00c90b'}}></i>
                                                        <span className="ml-2 font-semibold underline">Aggiungi Nuovo Indirizzo</span>
                                                    </div>

                                                    {user.indirizzi.map((addr) => (
                                                        console.log("addr", addr) ||


                                                        <div key={addr.id}
                                                             className="border px-3 py-3 mb-2 rounded hover:bg-gray-50 cursor-pointer"
                                                             onClick={() => setShippingAddress({
                                                                 name: addr.nome,
                                                                 address: addr.indirizzo,
                                                                 city: addr.citta,
                                                                 postalCode: addr.cap,
                                                                 country: addr.provincia
                                                             })}>

                                                            <div className="flex flex-row justify-between">
                                                                <div>
                                                                    <p className="font-semibold">{addr.nome}</p>
                                                                    <p>{addr.indirizzo}, {addr.citta}, {addr.provincia}, {addr.cap}</p>
                                                                </div>

                                                                <div>
                                                                    <button className="ml-4 text-2xl hover:underline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Implement edit functionality if needed
                                                                                toast("Edit functionality not implemented yet.");
                                                                            }}>
                                                                        <i className="bxr bx-edit"></i>
                                                                    </button>

                                                                    <button className="ml-2 text-2xl hover:underline"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Implement delete functionality if needed
                                                                                toast("Delete functionality not implemented yet.");
                                                                            }}>
                                                                        <i className="bxr bx-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            }
                                        </div>
                                    )}


                                    <AddressForm
                                        addressData={shippingAddress}
                                        handleChange={handleAddressChange}
                                        errors={errors}
                                        errorRef={errorRef}
                                    />

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

                            {carrello.couponCodes && carrello.couponCodes.map((couponCode) => {
                                console.log("couponCode", couponCode);
                                return (
                                    <div key={couponCode.id}
                                         className="flex items-center mb-4 border-2 border-gray-200 p-2 rounded-md shadow-sm w-full">
                                        <button className="mr-3" title="Remove coupon">✖</button>

                                        <span className=" font-semibold">{couponCode.codice}</span>

                                        {couponCode.percentuale > 0 && (
                                            <span
                                                className="ml-2 text-sm text-gray-600">- {couponCode.percentuale}%</span>
                                        )}

                                        {couponCode.valore > 0 && (
                                            <span className="ml-2 text-sm text-gray-600">- {couponCode.valore}€</span>
                                        )}
                                    </div>
                                );
                            })}

                            <p className="text-sm text-gray-600 mb-4">Se hai un buono sconto, inseriscilo qui:</p>


                            <div className="flex flex-grow ">
                                <div className=" w-4/6 mr-4">
                                    <input
                                        type="text"
                                        id="discountCode"
                                        placeholder="Inserisci codice sconto"
                                        className="border border-gray-300 rounded-md w-full p-2"
                                    />

                                    {errors.coupon && <p className="text-red-500 text-sm  mb-2">{errors.coupon}</p>}
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

                        <div className="flex flex-col border-b py-2 text-md ">
                            <h3 className="font-semibold text-gray-500 pb-4">Coupons</h3>

                            {carrello.couponCodes && carrello.couponCodes.length > 0 ? (
                                <h3 className="font-semibold text-right text-gray-700">
                                    {carrello.couponCodes.map(coupon => (
                                        <div key={coupon.id} className="flex justify-between  text-md">
                                            <span>{coupon.codice}</span>
                                            <span>{coupon.percentuale > 0 ? `-${coupon.percentuale}%` : `-${coupon.valore}€`}</span>
                                        </div>
                                    ))}
                                </h3>
                            ) : (
                                <h3 className="font-semibold text-right text-gray-800">Nessun coupon applicato</h3>
                            )}


                        </div>


                        <div className="flex justify-between py-2 text-lg">
                            <h3 className=" font-semibold">Totale:</h3>
                            <h3 className=" font-semibold text-right text-blue-700">{prezzoFinale} €</h3>
                        </div>

                        <button
                            className={`${disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white px-4 py-2 rounded-xl mt-4 w-full 2 duration-200`}
                            onClick={() => {

                                if (validate()) {
                                    mutation.mutate();

                                    toast.success("Order placed successfully!");
                                }
                            }}
                            disabled={!shippingService || !courierType || !locationType || mutation.isLoading}
                        >
                            {disabled ? "Insert all details to place order" : (
                                mutation.isLoading ? 'Processing...' : 'Place Order')
                            }
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