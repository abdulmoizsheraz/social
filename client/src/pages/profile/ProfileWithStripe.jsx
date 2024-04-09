import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Profile from "./Profile";

const stripekey = "pk_test_51NSNJfK5jFmIR9ElOjj4STpJI0aVKMH0i03dG5KM4cuLUvpV31hc8UMpE1DlJiYPxip50pLsl3hbezYSMipsdXJU007BaEo7ni";
const stripePromise = loadStripe(stripekey);

const ProfileWithStripe = () => {
  return (
    <Elements stripe={stripePromise}>
      <Profile />
    </Elements>
  );
};

export default ProfileWithStripe;
