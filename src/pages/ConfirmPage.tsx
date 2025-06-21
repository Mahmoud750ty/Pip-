import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';

export default function ConfirmPage() {
    const { cartItems, getCartTotal, clearCart, addToCart, decreaseQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    const [customerDetails, setCustomerDetails] = useState({ name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const orderData = {
            customerName: customerDetails.name,
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: getCartTotal(),
            status: 'pending',
            type: 'WhatsApp',
            createdAt: Timestamp.now()
        };

        try {
            await addDoc(collection(db, "orders"), orderData);

            // Prepare the WhatsApp message and URL
            const orderDetailsText = cartItems.map(item =>
                `- ${item.name} (x${item.quantity}) - EGP ${item.price * item.quantity}`
            ).join('\n');

            const message = `
Hello Pip Beach Plug! I'd like to place an order:

*Customer Details:*
Name: ${customerDetails.name}

*Order Summary:*
${orderDetailsText}

*Total: EGP ${getCartTotal()}*

Thank you!
            `;

            const whatsappNumber = "201019284462";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message.trim())}`;

            clearCart();

            // Navigate to the success page, passing the URL in the state
            // This is the key to the two-page flow
            navigate('/success', { state: { whatsappUrl } });

        } catch (err) {
            console.error("Error creating order: ", err);
            setError("Could not place your order. Please try again.");
            setIsLoading(false); // Ensure loading state is reset on error
        }
    };

    if (cartItems.length === 0 && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty!</h1>
                <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#224ED1] text-white rounded-lg">
                    Go back to shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-4 sm:p-8 font-sans">
            <h1 className="text-4xl font-bold text-center mb-8 font-roc-grotesk-compressed">Confirm Your Order</h1>

            <div className="bg-white border rounded-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Your Items</h2>
                <ul className="space-y-4">
                    {cartItems.map(item => (
                        <li key={item.id} className="flex justify-between items-center gap-2">
                            <div className="w-2/5"><p className="font-semibold truncate" title={item.name}>{item.name}</p></div>
                            <div className="flex items-center gap-2 border rounded-lg">
                                <button onClick={() => decreaseQuantity(item.id)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded-l-lg">-</button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="px-3 py-1 text-lg font-bold hover:bg-gray-100 rounded-r-lg">+</button>
                            </div>
                            <p className="font-semibold w-1/5 text-right">EGP {item.price * item.quantity}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-600 transition-colors" aria-label="Remove item">
                                <Trash2 size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
                <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>EGP {getCartTotal()}</span>
                </div>
            </div>

            <div className="bg-white border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
                <form onSubmit={handleConfirmOrder} className="space-y-4">
                    <input type="text" name="name" placeholder="Your Full Name" value={customerDetails.name} onChange={handleInputChange} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#224ED1]" required />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading || cartItems.length === 0}
                        className="w-full tracking-wider bg-[#224ED1] text-white text-xl font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {/* --- BUTTON TEXT UPDATED AS REQUESTED --- */}
                        {isLoading ? 'Placing Order...' : 'Confirm Order & Send via WhatsApp'}
                    </button>
                </form>
            </div>
        </div>
    );
}