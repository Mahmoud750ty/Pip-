import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';

export default function CashierConfirmPage() {
  const { cartItems, getCartTotal, clearCart, addToCart, decreaseQuantity } = useCart();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [customerDetails, setCustomerDetails] = useState({ name: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCompleteSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await runTransaction(db, async (transaction) => {
        // Check stock for each item
        for (const item of cartItems) {
          const productRef = doc(db, item.collectionName, item.id);
          const productSnap = await transaction.get(productRef);
          if (!productSnap.exists()) throw new Error(`Product ${item.name} not found.`);
          const productData = productSnap.data();
          if (productData.stock < item.quantity) {
            throw new Error(`Item ${item.name} is out of stock.`);
          }
          transaction.update(productRef, { stock: productData.stock - item.quantity, updatedAt: serverTimestamp() });
        }
        // Create order
        const orderData = {
          customerName: customerDetails.name || 'In-Store Customer',
          items: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: getCartTotal(),
          createdAt: serverTimestamp(),
          type: 'Cashier',
          cashierId: currentUser?.uid,
          cashierName: currentUser?.displayName || currentUser?.email || '',
        };
        const ordersRef = collection(db, 'orders');
        transaction.set(doc(ordersRef), orderData);
      });
      clearCart();
      setSuccess('Order successfully created!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (err: any) {
      setError(err.message || 'Could not complete sale.');
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty!</h1>
        <button onClick={() => navigate('/admin/new-order')} className="px-6 py-2 bg-[#224ED1] text-white rounded-lg">
          Go back to products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8 font-sans">
      <h1 className="text-4xl font-bold text-center mb-8 font-roc-grotesk-compressed">Confirm Sale</h1>
      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Your Items</h2>
        {/* Cart items table (reuse from guest UI) */}
        <ul>
          {cartItems.map(item => (
            <li key={item.id} className="flex justify-between items-center py-2 border-b gap-2">
              <div className="w-2/5"><p className="font-semibold truncate" title={item.name}>{item.name}</p></div>
              <div className="flex items-center gap-2 border rounded-lg">
                <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded-l-lg">-</button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button onClick={() => addToCart(item)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded-r-lg">+</button>
              </div>
              <span className="font-semibold w-1/5 text-right">EGP {item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-4 font-bold">
          <span>Total:</span>
          <span>EGP {getCartTotal()}</span>
        </div>
      </div>
      <form onSubmit={handleCompleteSale} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
          <input
            id="customerName"
            name="name"
            type="text"
            value={customerDetails.name}
            onChange={handleInputChange}
            placeholder="In-Store Customer"
            className="w-full p-3 border rounded-lg"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          {isLoading ? 'Processing...' : 'Complete Sale'}
        </button>
      </form>
    </div>
  );
}