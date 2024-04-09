import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import { makeRequest } from "../../axios";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PaymentElement } from '@stripe/react-stripe-js';
import { VscVerifiedFilled } from "react-icons/vsc";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import { useState } from "react";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const userId = parseInt(useLocation().pathname.split("/")[2]);

  const { isLoading, error, data } = useQuery(["user"], () =>
    makeRequest.get("/users/find/" + userId).then((res) => {
      return res.data;
    })
  );
  const openPaymentModal = () => {
    setOpenModal(true);
  };

  // Function to close the modal
  const closePaymentModal = () => {
    setOpenModal(false);
  };
  const { isLoading: rIsLoading, data: relationshipData } = useQuery(
    ["relationship"],
    () =>
      makeRequest.get("/relationships?followedUserId=" + userId).then((res) => {
        return res.data;
      })
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (following) => {
      if (following)
        return makeRequest.delete("/relationships?userId=" + userId);
      return makeRequest.post("/relationships", { userId });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["relationship"]);
      },
    }
  );

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
  };
  // Payement LOgic
  
  return (
    <div className="profile">
      {isLoading ? (
        "loading"
      ) : (
        <>
          <div className="images">
            <img src={"/upload/"+data.coverPic} alt="" className="cover" />
            <img src={"/upload/"+data.profilePic} alt="" className="profilePic" />
          </div>
          <div className="profileContainer">
            <div className="uInfo">
              <div className="left">
                <a href="http://facebook.com">
                  <FacebookTwoToneIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <InstagramIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <TwitterIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <LinkedInIcon fontSize="large" />
                </a>
                <a href="http://facebook.com">
                  <PinterestIcon fontSize="large" />
                </a>
              </div>
              <div className="center">
              <div className="payment-info-container">
  <span>{data.name}</span>
  <span>{data.isVerifyPayment ? <VscVerifiedFilled fill="blue" /> : ""}</span>
</div>

                <div className="info">
                  <div className="item">
                    <PlaceIcon />
                    <span>{data.city}</span>
                  </div>
                  <div className="item">
                    <LanguageIcon />
                    <span>{data.website}</span>
                  </div>
                </div>
                {!data.isVerifyPayment && <button className="" onClick={openPaymentModal}>Verify Payment Method</button>}
                {rIsLoading ? (
                  "loading"
                ) : userId === currentUser.id ? (
                  <button onClick={() => setOpenUpdate(true)}>update</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipData.includes(currentUser.id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>
             
              <div className="right">
                <EmailOutlinedIcon />
                <MoreVertIcon />
              </div>
              
            </div>
            <Posts userId={userId} />
          </div>
         <div>
    
         </div>
        </>
      )}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
      {openModal && <StripePaymentModal onClose={closePaymentModal} />}
    </div>
  );
};

export default Profile;
const StripePaymentModal = ({ onClose }) => {
  const stripekey = "pk_test_51NSNJfK5jFmIR9ElOjj4STpJI0aVKMH0i03dG5KM4cuLUvpV31hc8UMpE1DlJiYPxip50pLsl3hbezYSMipsdXJU007BaEo7ni";
  const stripePromise = loadStripe(stripekey);
  const [PaymentError, setPaymentError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvc: '',
    expiryDate: '',
  });

  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (event) => {
    setCardDetails({ ...cardDetails, [event.target.name]: event.target.value });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await makeRequest.post(
        "/paymentverify",
        cardDetails 
      );

      if (response.data.success) {
        onClose(); // Close the modal
      } else {
        setPaymentError(response.data.message);
      }
    } catch (err) {
      console.error("Error verifying payment method:", err);
      setPaymentError(
        "Payment Verification failed! Please Try Again Later or Check your Credentials"
      );
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="payment-heading">Payment Method Verification</h2>
          <button className="close-button" onClick={onClose}>&#10005;</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cardNumber" className="input-label">
                Card Number:
              </label>
              <CardNumberElement className="input-field" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="cvc" className="input-label">
                PIN:
              </label>
              <CardCvcElement className="input-field" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="expiryDate" className="input-label">
                Expiry Date:
              </label>
              <CardExpiryElement className="input-field" onChange={handleChange} />
            </div>
            {PaymentError && <div className="error-message">{PaymentError}</div>}
            <button type="submit" className="verify-button" disabled={isProcessing}>
              {isProcessing ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .modal-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }
        .modal-container {
          position: absolute;
          top: 50%;
          width:30vw;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
          z-index: 1000;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }
        .close-button:hover {
          color: #ff0000;
        }
        .payment-heading {
          font-size: 1.25rem;
          color:green;
          font-weight: bold;
        }
        .modal-content {
          margin-top: 1rem;
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .input-label {
          display: block;
          font-size: 0.875rem;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .input-field {
          width: 90%;
          padding: 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid #ccc;
          outline: none;
          transition: border-color 0.2s ease-in-out;
        }
        .input-field:focus {
          border-color: #007bff;
        }
      `}</style>
    </>
  );
};

