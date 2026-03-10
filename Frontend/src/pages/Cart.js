import React, { useEffect, useState } from "react";
import BreadCrumb from "../components/BreadCrumb";
import Meta from "../components/Meta";
import watch from "../images/watch.jpg";
import { AiFillDelete } from "react-icons/ai";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartProduct,
  getUserCart,
  updateCartProduct,
} from "../features/user/userSlice";

const Cart = () => {
  console.log('Rendering Cart component');
  const getTokenFromLocalStorage = localStorage.getItem("customer")
    ? JSON.parse(localStorage.getItem("customer"))
    : null;

  const config2 = {
    headers: {
      Authorization: `Bearer ${
        getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""
      }`,
      Accept: "application/json",
    },
  };

  const dispatch = useDispatch();

  const [productupdateDetail, setProductupdateDetail] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const userCartState = useSelector((state) => {
    const cart = state?.auth?.cartProducts || [];
    console.log('Current cart state:', cart);
    return Array.isArray(cart) ? cart : [];
  });

  useEffect(() => {
    dispatch(getUserCart(config2));
  }, []);

  useEffect(() => {
    if (productupdateDetail !== null) {
      dispatch(
        updateCartProduct({
          cartItemId: productupdateDetail?.cartItemId,
          quantity: productupdateDetail?.quantity,
        })
      );
      setTimeout(() => {
        dispatch(getUserCart(config2));
      }, 200);
    }
  }, [productupdateDetail]);

  const deleteACartProduct = React.useCallback((id) => {
    console.log('Deleting cart item with ID:', id);
    if (!id) {
      console.error('No ID provided for deletion');
      return;
    }
    const itemId = String(id).trim();
    if (!itemId) {
      console.error('Invalid ID format for deletion:', id);
      return;
    }
    console.log('Dispatching delete action for ID:', itemId);
    dispatch(deleteCartProduct({ id: itemId, config2 }));
    setTimeout(() => {
      dispatch(getUserCart(config2));
    }, 200);
  }, [dispatch, config2]);

  // Process cart items with validation
  const validCartItems = React.useMemo(() => {
    try {
      // Get cart data from state (handle both direct array and nested data property)
      const cartData = userCartState?.data || userCartState;
      
      // Ensure we have valid data
      if (!cartData) {
        console.warn('No cart data available');
        return [];
      }
      
      // Ensure we're working with an array
      const itemsArray = Array.isArray(cartData) ? cartData : [];
      
      console.log('Processing cart items:', itemsArray);
      
      // Process and validate each item
      return itemsArray
        .map((item, index) => {
          try {
            // Skip if item is not an object
            if (!item || typeof item !== 'object' || item === null) {
              console.warn('Skipping invalid cart item (not an object):', item);
              return null;
            }

            // Create a safe item with defaults
            const safeItem = {
              ...item,
              // Ensure _id exists and is a string
              _id: item && item._id != null ? String(item._id) : `temp-${Date.now()}-${index}`,
              // Ensure productId is an object
              productId: item && typeof item.productId === 'object' ? item.productId : {},
              // Ensure quantity is a number between 1 and 100
              quantity: Math.max(1, Math.min(100, Number(item.quantity) || 1)),
              // Ensure price is a non-negative number
              price: Math.max(0, Number(item.price) || 0)
            };

            // Additional validation
            if (!safeItem._id || !safeItem.productId || !safeItem.quantity || !safeItem.price) {
              console.warn('Skipping cart item with missing required fields:', item);
              return null;
            }

            // Validate quantity and price
            if (safeItem.quantity < 1 || safeItem.quantity > 100 || safeItem.price < 0) {
              console.warn('Skipping cart item with invalid quantity or price:', item);
              return null;
            }

            return safeItem;
          } catch (error) {
            console.error('Error processing cart item:', error, item);
            return null;
          }
        })
        .filter(Boolean); // Remove any null items
    } catch (error) {
      console.error('Critical error processing cart items:', error);
      return [];
    }
  }, [userCartState]);

  useEffect(() => {
    let sum = 0;
    if (userCartState && userCartState.length > 0) {
      for (let index = 0; index < userCartState.length; index++) {
        if (userCartState[index]?.quantity && userCartState[index]?.price) {
          sum += Number(userCartState[index].quantity) * userCartState[index].price;
        }
      }
    }
    setTotalAmount(sum);
  }, [userCartState]);

  // Create a safe version of cart items
  const safeValidCartItems = React.useMemo(() => {
    if (!Array.isArray(validCartItems)) {
      console.warn('validCartItems is not an array:', validCartItems);
      return [];
    }

    return validCartItems
      .map((item, index) => {
        try {
          // Skip if item is not an object
          if (!item || typeof item !== 'object') {
            console.warn('Skipping invalid cart item (not an object)');
            return null;
          }

          // Create a safe item with defaults
          return {
            ...item,
            _id: item._id || `temp-${Date.now()}-${index}`,
            productId: item.productId || {},
            quantity: Math.max(1, Math.min(100, Number(item.quantity) || 1)),
            price: Math.max(0, Number(item.price) || 0)
          };
        } catch (error) {
          console.error('Error processing cart item:', error);
          return null;
        }
      })
      .filter(Boolean); // Remove any null items
  }, [validCartItems]);

  console.log('Processed cart items:', safeValidCartItems);

  return (
    <>
      <Meta title={"Cart"} />
      <BreadCrumb title="Cart" />
      <Container class1="cart-wrapper home-wrapper-2 py-5">
        <div className="row">
          <div className="col-12">
            <div className="cart-header py-3 d-flex justify-content-between align-items-center">
              <h4 className="cart-col-1">Product</h4>
              <h4 className="cart-col-2">Price</h4>
              <h4 className="cart-col-3">Quantity</h4>
              <h4 className="cart-col-4">Total</h4>
            </div>
            {safeValidCartItems.length > 0 ? (
              safeValidCartItems.map((item, index) => {
                // Additional safety check for each item
                if (!item || typeof item !== 'object') {
                  console.error('Invalid cart item detected');
                  return null;
                }
                
                return (
                  <div
                    key={item._id}
                    className="cart-data py-3 mb-2 d-flex justify-content-between align-items-center"
                  >
                    <div className="cart-col-1 gap-15 d-flex align-items-center">
                      <div className="w-25">
                        <img
                          src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/150'}
                          className="img-fluid"
                          alt={item.productId?.title || 'Product Image'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      </div>
                      <div className="w-75">
                        <p>{item.productId?.title || 'Product Title'}</p>

                      </div>
                    </div>
                    <div className="cart-col-2">
                      <h5 className="price">Rs. {item.price.toFixed(2)}</h5>
                    </div>
                    <div className="cart-col-3 d-flex align-items-center gap-15">
                      <div>
                        <input
                          className="form-control"
                          type="number"
                          name={`quantity-${item._id}`}
                          min={1}
                          max={10}
                          id={`card-${item._id}`}
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value, 10);
                            if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > 10) {
                              console.error('Invalid quantity update:', { id: item._id, quantity: e.target.value });
                              return;
                            }
                            setProductupdateDetail({
                              cartItemId: item._id,
                              quantity: newQuantity,
                            });
                          }}
                        />
                      </div>
                      <div>
                        <AiFillDelete
                          onClick={() => {
                            console.log('Deleting item with ID:', item._id);
                            deleteACartProduct(item._id);
                          }}
                          className="text-danger"
                          style={{ cursor: 'pointer' }}
                          title="Remove item"
                        />
                      </div>
                    </div>
                    <div className="cart-col-4">
                      <h5 className="price">
                        Rs. {(item.quantity * item.price).toFixed(2)}
                      </h5>
                    </div>
                  </div>
                  );
                })
                .filter(Boolean) // Remove any null items from invalid entries
            ) : (
              <div className="text-center py-5">
                <h4>Your cart is empty</h4>
                <Link to="/product" className="button mt-3">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
          <div className="col-12 py-2 mt-4">
            <div className="d-flex justify-content-between align-items-baseline">
              <Link to="/product" className="button">
                Continue To Shopping
              </Link>
              {(totalAmount !== null || totalAmount !== 0) && (
                <div className="d-flex flex-column align-items-end">
                  <h4>
                    SubTotal: Rs.{" "}
                    {totalAmount ? totalAmount.toFixed(2) : '0.00'}
                  </h4>
                  <p>Taxes and shipping calculated at checkout</p>
                  <Link to="/checkout" className="button">
                    Checkout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Cart;
