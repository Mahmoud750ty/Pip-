// ----- IMPORTS -----
import { useState, useEffect } from 'react';
import { Mail, Phone, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase'; // Import Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '../types'; // Use our shared Product type
import logo from '../assets/header.svg';
import Heroimg from '../assets/hero.svg';

// List of all your product collections in Firestore
const CATEGORY_COLLECTIONS = [
    'smokes', 'snack-attack', 'candy-boom',
    'super-nuts', 'vibe-save', 'game-on'
];

// ----- COMPONENTS -----

// A helper function to format collection names for display
const formatCategoryName = (name: string) => name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Header component refactored for a consistent, centered layout on all screen sizes.
function Header() {
    const { getCartItemCount } = useCart();
    const cartCount = getCartItemCount();
    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm py-4 border-b border-gray-200 mb-8 lg:mb-16">
            <div className="grid grid-cols-3 items-center max-w-md mx-auto lg:max-w-6xl px-4 sm:px-8">
                {/* Left spacer for balance */}
                <div />
                {/* Centered Logo */}
                <div className="flex justify-center">
                    <img src={logo} alt="Pip Beach Plug Logo" className="h-10" />
                </div>
                {/* Right Cart Icon */}
                <div className="flex justify-end">
                    <Link to="/confirm" className="relative text-gray-700 hover:text-blue-600 transition-colors p-2" aria-label="View shopping cart">
                        <ShoppingCart className="w-6 h-6" />
                        {cartCount > 0 && <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-[#224ED1] text-white text-xs flex items-center justify-center">{cartCount}</span>}
                    </Link>
                </div>
            </div>
        </header>
    );
}

function ConfirmOrderBar() {
    const { getCartItemCount, getCartTotal } = useCart();
    const itemCount = getCartItemCount();
    if (itemCount === 0) return null;
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 shadow-lg animate-slide-up">
            <div className="max-w-md mx-auto lg:max-w-6xl flex justify-between items-center">
                <div>
                    <p className="font-bold">{itemCount} item{itemCount > 1 ? 's' : ''} in cart</p>
                    <p className="text-sm">Total: EGP {getCartTotal()}</p>
                </div>
                <Link to="/confirm" className="px-6 py-2 font-bold bg-[#224ED1] rounded-lg hover:bg-blue-600 transition-colors">View Cart</Link>
            </div>
        </div>
    );
}

// Removed `lg:hidden` to ensure the triangle is visible on all screen sizes.
function CustomTriangle({ isOpen }: { isOpen: boolean }) {
    return <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#224ED1] transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />;
}

// ProductCard using a consistent style.
function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const handleAddToCart = () => {
        const cartProduct = {
            ...product,
            id: product.id,
            product_name: product.name,
            price_consumer: product.price,
            image: product.imageUrl,
        };
        addToCart(cartProduct);
    };

    return (
        <div className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-contain" />
            <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-sm font-bold text-gray-800 font-sans truncate" title={product.name}>{product.name}</h3>
                        <p className="text-xs font-semibold text-blue-600 font-sans shrink-0 pt-0.5">EGP {product.price}</p>
                    </div>
                </div>
                <button onClick={handleAddToCart} className="w-full tracking-wider bg-[#224ED1] text-white text-xl font-bold py-1.5 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
                    Order
                </button>
            </div>
        </div>
    );
}

// ADDED: A skeleton loader component to show while product data is being fetched.
function ProductCardSkeleton() {
    return (
        <div className="flex-shrink-0 w-40 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col animate-pulse">
            <div className="w-full h-32 bg-gray-300"></div>
            <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="h-9 bg-gray-400 rounded-lg mt-3"></div>
            </div>
        </div>
    );
}


function ContactForm() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Thank you, ${formData.name}! Your message has been received.`);
        setFormData({ name: '', email: '', phone: '', subject: '' });
    };
    const inputStyle = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#224ED1] transition-shadow";
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className={inputStyle} required />
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email Address" className={inputStyle} required />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Your Phone Number (Optional)" className={inputStyle} />
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" className={inputStyle} required />
            <button type="submit" className="w-full tracking-wider bg-[#224ED1] text-white text-xl font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-75">
                Send Message
            </button>
        </form>
    );
}

// PageFooter with a consistent layout.
function PageFooter() {
    const companyEmail = "Hey.pipplug@gmail.com";
    const companyPhone = "00201019284462";
    return (
        <footer className="mt-16">
            <div className="text-center space-y-6">
                <img src={logo} alt="Pip Beach Plug Logo" className="mx-auto w-12" />
                <div className="space-y-3">
                    <a href={`mailto:${companyEmail}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Mail className="w-4 h-4" /> <span>{companyEmail}</span>
                    </a>
                    <a href={`tel:${companyPhone.replace(/\s/g, '')}`} className="flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <Phone className="w-4 h-4" /> <span>{companyPhone}</span>
                    </a>
                </div>
                <p className="text-xs text-gray-400 pt-4">
                    © {new Date().getFullYear()} Pip Beach Plug. All Rights Reserved.
                </p>
            </div>
        </footer>
    );
}

// --- THE MAIN PAGE COMPONENT ---
// CHANGED: Refactored to load category UI synchronously and product data asynchronously.
export default function PipBeachPlugPage() {
    // State to manage which collapsible sections are open
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

    // CHANGED: New state to hold data for each category individually
    interface CategoryState {
        products: Product[];
        isLoading: boolean;
        error: string | null;
    }
    const [categoryData, setCategoryData] = useState<{ [key: string]: CategoryState }>({});

    // CHANGED: useEffect now populates the UI structure first, then fetches data
    useEffect(() => {
        // This function sets up the initial state and then fetches data
        const initializeAndFetchCategories = () => {
            // 1. Synchronously set up the initial state for all categories
            const initialData: { [key: string]: CategoryState } = {};
            CATEGORY_COLLECTIONS.forEach(collectionName => {
                const displayName = formatCategoryName(collectionName);
                initialData[displayName] = {
                    products: [],
                    isLoading: true, // Set to true to show skeletons
                    error: null
                };
            });
            setCategoryData(initialData);

            // 2. Asynchronously fetch data for each category
            CATEGORY_COLLECTIONS.forEach(async (collectionName) => {
                const displayName = formatCategoryName(collectionName);
                try {
                    const snapshot = await getDocs(collection(db, collectionName));
                    const loadedProducts: Product[] = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        // Ensure product is visible before adding
                        if (data.is_visible) {
                            loadedProducts.push({
                                id: doc.id,
                                name: data.name,
                                price: data.price,
                                imageUrl: data.imageUrl,
                                is_available: data.is_available,
                                is_visible: data.is_visible,
                                orderId: data.orderId, // Ensure orderId is included
                                stock: data.stock ?? 0,
                                createdAt: data.createdAt ?? null,
                                updatedAt: data.updatedAt ?? null,

                            });
                        }
                    });

                    // Update state for this specific category with fetched data
                    setCategoryData(prevData => ({
                        ...prevData,
                        [displayName]: { products: loadedProducts, isLoading: false, error: null }
                    }));
                } catch (err) {
                    console.error(`Failed to fetch ${displayName}:`, err);
                    // Update state with an error message for this category
                    setCategoryData(prevData => ({
                        ...prevData,
                        [displayName]: { ...prevData[displayName], isLoading: false, error: `Could not load ${displayName}.` }
                    }));
                }
            });
        };

        initializeAndFetchCategories();
    }, []); // Empty dependency array ensures this runs only once on mount

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="min-h-screen bg-white font-roc-grotesk-compressed">
            <Header />

            <div className="px-4 sm:px-8 py-4 pb-32">
                <div className="max-w-md mx-auto lg:max-w-6xl">

                    <section className="mb-20">
                        <div className="mt-12 lg:mt-0 flex justify-center">
                            <img src={Heroimg} alt="Pip Beach Plug Hero" className="w-full max-w-sm lg:max-w-md" />
                        </div>
                    </section>

                    {/* CHANGED: This main section now renders all categories immediately */}
                    <main className="mb-24">
                        {CATEGORY_COLLECTIONS.map((collectionName) => {
                            const displayName = formatCategoryName(collectionName);
                            const categoryState = categoryData[displayName];

                            // This check prevents errors if the initial state isn't set yet
                            if (!categoryState) return null;

                            return (
                                <div key={displayName} className="border-b border-gray-200 mb-8">
                                    <button onClick={() => toggleSection(displayName)} className="w-full flex items-center justify-between py-4 text-left">
                                        <span className="text-5xl text-black font-roc-grotesk-compressed">{displayName}</span>
                                        <CustomTriangle isOpen={!!openSections[displayName]} />
                                    </button>
                                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openSections[displayName] ? 'max-h-[500px]' : 'max-h-0'}`}>
                                        <div className="flex space-x-4 overflow-x-auto py-4 px-1 scrollbar-thin">
                                            {/* Conditionally render skeletons, errors, or products */}
                                            {categoryState.isLoading && (
                                                <>
                                                    <ProductCardSkeleton />
                                                    <ProductCardSkeleton />
                                                    <ProductCardSkeleton />
                                                </>
                                            )}
                                            {categoryState.error && (
                                                <p className="text-red-500 px-2 font-sans">{categoryState.error}</p>
                                            )}
                                            {!categoryState.isLoading && !categoryState.error && (
                                                categoryState.products.length > 0 ? (
                                                    categoryState.products.map(product => (
                                                        <ProductCard key={product.id} product={product} />
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 px-2 font-sans">No products in this category yet.</p>
                                                )
                                            )}
                                            <div className="flex-shrink-0 w-1 lg:hidden"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </main>

                    <section className="mt-24">
                        <div>
                            <div className="text-center mb-8">
                                <h2 className="text-5xl text-black font-roc-grotesk-compressed">
                                    Get In Touch
                                </h2>
                                <p className="mt-2 text-gray-600 font-sans">
                                    Have a question or a special request? Drop us a line.
                                </p>
                            </div>
                            <ContactForm />
                        </div>
                        <div className="">
                            <PageFooter />
                        </div>
                    </section>
                </div>
            </div>
            <ConfirmOrderBar />
        </div>
    );
}