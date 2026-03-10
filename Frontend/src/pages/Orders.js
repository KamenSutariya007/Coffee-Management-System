import React, { useEffect, useState } from "react";
import Container from "../components/Container";
import BreadCrumb from "../components/BreadCrumb";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../features/user/userSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const orderState = useSelector((state) => {
    const orders = state?.auth?.getorderedProduct?.orders;
    return Array.isArray(orders) ? orders : [];
  });

  const getTokenFromLocalStorage = localStorage.getItem("customer")
    ? JSON.parse(localStorage.getItem("customer"))
    : null;

  const config2 = {
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage?.token || ""}`,
      Accept: "application/json",
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await dispatch(getOrders(config2));
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [dispatch]);

  return (
    <>
      <BreadCrumb title="My Orders" />
      <Container class1="cart-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="row">
              <div className="col-3">
                <h5>Order Id</h5>
              </div>
              <div className="col-3">
                <h5>Total Amount</h5>
              </div>
              <div className="col-3">
                <h5>Total Amount after Discount</h5>
              </div>
              <div className="col-3">
                <h5>Status</h5>
              </div>
            </div>

            <div className="col-12 mt-3">
              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading your orders...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : orderState.length === 0 ? (
                <div className="text-center py-5">
                  <h5>No orders found</h5>
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                orderState.map((item, index) => (
                  <div
                    style={{ backgroundColor: "#d5b57c" }}
                    className="row pt-3 my-3"
                    key={item?._id || index}
                  >
                    <div className="col-3">
                      <p>{item?._id || 'N/A'}</p>
                    </div>
                    <div className="col-3">
                      <p>${item?.totalPrice?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="col-3">
                      <p>${item?.totalPriceAfterDiscount?.toFixed(2) || '0.00'}</p>
                    </div>
                    <div className="col-3">
                      <p>{item?.orderStatus || 'N/A'}</p>
                    </div>
                    <div className="col-12">
                      <div className="row py-3" style={{ backgroundColor: "#ba9750" }}>
                        <div className="col-3">
                          <h6 className="text-white">Product Name</h6>
                        </div>
                        <div className="col-3">
                          <h6 className="text-white">Quantity</h6>
                        </div>
                        <div className="col-3">
                          <h6 className="text-white">Price</h6>
                        </div>
                        {item?.orderItems?.length > 0 ? (
                          item.orderItems.map((orderItem, itemIndex) => (
                            <div className="col-12" key={`${item._id}-${itemIndex}`}>
                              <div className="row py-3">
                                <div className="col-3">
                                  <p className="text-white mb-0">
                                    {orderItem?.product?.title || 'Product not available'}
                                  </p>
                                </div>
                                <div className="col-3">
                                  <p className="text-white mb-0">{orderItem?.quantity || 0}</p>
                                </div>
                                <div className="col-3">
                                  <p className="text-white mb-0">${orderItem?.price?.toFixed(2) || '0.00'}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-12 text-center py-3">
                            <p className="text-white mb-0">No items in this order</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Orders;
