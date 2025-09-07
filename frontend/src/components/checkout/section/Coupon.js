import React from "react";
import {useCarrello} from "../../hook/useCarrello";

const Coupon = ({onChange, errors}) => {

    const {carrello, isLoadingCart, errorCart, isErrorCart} = useCarrello();

    return <>
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
                onClick={() => onChange(document.getElementById("discountCode").value)}
            > Applica Buono Sconto
            </button>

        </div>
    </>
}

export default Coupon;