import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

// Helper component for the accordion triangle icon
function CustomTriangle({ isOpen }: { isOpen: boolean }) {
  return <div className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-[#224ED1] transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />;
}

// Helper function to format collection slugs into titles (e.g., 'snack-attack' -> 'Snack Attack')
const formatCollectionName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CashierHomePage: React.FC = () => {
  const [groupedProducts, setGroupedProducts] = useState<{ [key: string]: Product[] }>({});
  const [openCollections, setOpenCollections] = useState<{ [key: string]: boolean }>({});
  const { addToCart, getCartItemCount, getCartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const allCollections = [
        'smokes',
        'snack-attack',
        'candy-boom',
        'super-nuts',
        'vibe-save',
        'game-on',
      ];

      const productsByCollection: { [key: string]: Product[] } = {};
      const initialOpenState: { [key: string]: boolean } = {};

      for (const col of allCollections) {
        const qRef = query(collection(db, col), where('is_visible', '==', true));
        const snap = await getDocs(qRef);
        const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), collectionName: col } as Product & { collectionName: string }));

        if (products.length > 0) {
          productsByCollection[col] = products;
          initialOpenState[col] = false; // Start all collections as closed
        }
      }
      setGroupedProducts(productsByCollection);
      setOpenCollections(initialOpenState);
    };
    fetchProducts();
  }, []);

  const toggleCollection = (collectionName: string) => {
    setOpenCollections(prev => ({
      ...prev,
      [collectionName]: !prev[collectionName],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Cashier: New Sale</h1>

      <div className="space-y-4">
        {Object.entries(groupedProducts).map(([collectionName, products]) => (
          <div key={collectionName}>
            <button
              title='Toggle Collection'
              onClick={() => toggleCollection(collectionName)}
              className="w-full flex justify-between items-center py-2 text-left focus:outline-none"
              aria-expanded={openCollections[collectionName]}
            >
              {/* The font style is adjusted to mimic the image */}
              <h2 className="text-4xl font-extrabold tracking-tight">
                {formatCollectionName(collectionName)}
              </h2>
              <CustomTriangle isOpen={!!openCollections[collectionName]} />
            </button>
            <hr className="border-t border-black mb-4" />

            {openCollections[collectionName] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
                {products.map(product => (
                  <div key={product.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                    <img src={product.imageUrl} alt={product.name} className="h-40 object-contain mb-2" />
                    <h2 className="font-bold text-lg">{product.name}</h2>
                    <p className="text-indigo-600 font-bold">EGP {product.price}</p>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    <button
                      className={`mt-auto px-4 py-2 rounded ${product.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      onClick={() => addToCart(product)}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cart Bar */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 shadow-lg animate-slide-up">
          <div className="max-w-md mx-auto lg:max-w-6xl flex justify-between items-center">
            <div>
              <p className="font-bold">{getCartItemCount()} item(s) in cart</p>
              <p className="text-sm">Total: EGP {getCartTotal()}</p>
            </div>
            <button
              onClick={() => navigate('/admin/confirm-order')}
              className="px-6 py-2 font-bold bg-[#224ED1] rounded-lg hover:bg-blue-600 transition-colors"
            >
              Proceed to Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierHomePage;