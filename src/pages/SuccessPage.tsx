import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Get the whatsappUrl passed from the ConfirmPage's state
    const whatsappUrl = location.state?.whatsappUrl;

    // Fallback if the user lands on this page directly without an order
    if (!whatsappUrl) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
                <h1 className="text-2xl font-bold mb-4">No order to send.</h1>
                <p className="mb-6">Please go back and confirm your order first.</p>
                <button onClick={() => navigate('/confirm')} className="px-6 py-2 bg-[#224ED1] text-white rounded-lg">
                    Go to Cart
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-50">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-3 font-roc-grotesk-compressed">Order Placed!</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                Your order is confirmed. Click the button below to send the details via WhatsApp.
            </p>

            {/* 
              This is the final click. It's a simple link, which is the most reliable
              way to redirect. It does NOT use target="_blank" to ensure it works on iPhones.
            */}
            <a
                href={whatsappUrl}
                className="w-full max-w-xs tracking-wider bg-green-500 text-white text-xl font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
                rel="noopener noreferrer"
            >
                Open WhatsApp to Send
            </a>

            <Link to="/" className="mt-8 text-gray-500 hover:text-gray-800">
                Or continue shopping
            </Link>
        </div>
    );
}