import React, { useState, useEffect } from "react";
import { loadCart, cartEmpty } from "./helper/cartHelper";
import { Link } from "react-router-dom";
import { getmeToken, processPayment } from "./helper/paymentBhelper";
import { createOrder } from "./helper/orderHelper";
import { isAutheticated } from "./../auth/helper/index";

import { DropIn } from "braintree-web-drop-in-react";

const Paymentb = ({ products, setReload = (f) => f, reload = undefined }) => {
  const [info, setInfo] = useState({
    loading: false,
    success: false,
    clientToken: null,
    error: "",
    instance: {},
  });
  const userId = isAutheticated() && isAutheticated().user._id;
  const token = isAutheticated() && isAutheticated().token;

  const getToken = (userId, token) => {
    console.log(userId, token);
    getmeToken(userId, token)
    .then((response) => {
      console.log("INFORMATION", response);
      if (response.error) {
        setInfo({ ...info, error: response.error });

        //TODO:
      } else {
        const clientToken = response.clientToken;
        setInfo({ clientToken });
      }
    });
  };
  useEffect(() => {
    getToken(userId, token);
  }, []);

  const showbtdropIn = () => {
    return (
      <div>
        {info.clientToken !== null && products.length > 0 ? (
          <div>
            <DropIn
              options={{ authorization: info.clientToken }}
              onInstance={(instance) => (info.instance = instance)}
            />
            <button className="btn btn-success btn-block" onClick={onPurchases}>
              Buy
            </button>
          </div>
        ) : (
          <h3>Login or Add something to Cart</h3>
        )}
      </div>
    );
  };

  const onPurchases = () => {
    setInfo({loading: true});
    let nonce;
    let getNonce = info.instance
    .requestPaymentMethod()
    .then(data=>{
        nonce = data.nonce;
        const paymentData = {
            paymentMethodNonce : nonce,
            amount : getAmount()
        }
        processPayment(userId,token,paymentData).then(response=>{
            setInfo({...info,loading: false,success: response.success});
            console.log("TRANSACTION SUCCESS");

            const orderData = {
                products : products,
                transaction_id : response.transaction.id,
                amount : response.transaction.amount
            };

            createOrder(userId , token , orderData);
           
            cartEmpty(()=>{
                console.log("Did we got crash?");
            });

            setReload(!reload);
        
        })
    }).catch(error=>{
        setInfo({loading: false , success: false})
    })
  }

  const getAmount = () =>{
    let amount = 0;
    products.map(p=>{
        amount = amount + p.price;
    });
    return amount;
  }

  return (
    <div>
      <h3>Your bill is ${getAmount()}</h3>
      {showbtdropIn()}
    </div>
  );
};

export default Paymentb;
