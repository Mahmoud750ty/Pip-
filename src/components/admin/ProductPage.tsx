import React, { useState, useEffect } from 'react';
// Import necessary functions from Firestore SDK
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, limit, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { FaEdit, FaTrash, FaPlus, FaImage, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { type Product } from '../../types';

// Alert Message Type
interface AlertMessage {
    type: 'success' | 'error';
    message: string;
}

// Validation Errors Type
interface ValidationErrors {
    orderId?: string;
    name?: string;
    price?: string;
    image?: string;
    stock?: string;
}

// ToggleSwitch Component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
        <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </div>
);


// --- MAIN COMPONENT ---
interface ProductPageProps {
    categoryName: string;
    collectionName: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ categoryName, collectionName }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [formData, setFormData] = useState({
        orderId: '',
        name: '',
        price: '',
        imageFile: null as File | null,
        is_available: true,
        is_visible: true,
        stock: '',
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [alertMessage, setAlertMessage] = useState<AlertMessage | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, [collectionName]);

    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => setAlertMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [alertMessage]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const productsRef = collection(db, collectionName);
            const q = query(productsRef, orderBy("orderId", "asc"));
            const querySnapshot = await getDocs(q);
            const productList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productList);
        } catch (error) {
            console.error("Error fetching products:", error);
            setAlertMessage({ type: 'error', message: `Failed to fetch ${categoryName}.` });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFormData({ orderId: '', name: '', price: '', imageFile: null, is_available: true, is_visible: true, stock: '' });
        setPreviewImage(null);
        setEditingProduct(null);
        setValidationErrors({});
    };

    const validateForm = (): boolean => {
        const errors: ValidationErrors = {};
        if (!formData.name.trim()) errors.name = "Product name is required.";
        if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            errors.price = "A valid positive price is required.";
        }
        if (!editingProduct && !formData.imageFile) {
            errors.image = "An image is required for new products.";
        }
        if (formData.orderId.trim() && (isNaN(Number(formData.orderId)) || Number(formData.orderId) < 0)) {
            errors.orderId = "Order ID must be a positive number.";
        }
        if (formData.stock === '' || isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
            errors.stock = "Stock must be a non-negative integer.";
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name as keyof ValidationErrors]) {
            setValidationErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (file: File | null) => {
        if (file) {
            setFormData(prev => ({ ...prev, imageFile: file }));
            if (previewImage) URL.revokeObjectURL(previewImage);
            setPreviewImage(URL.createObjectURL(file));
            setValidationErrors(prev => ({ ...prev, image: undefined }));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            if (!formData.imageFile) throw new Error("Image file is missing.");

            const storageRef = ref(storage, `${collectionName}_images/${Date.now()}_${formData.imageFile.name}`);
            await uploadBytes(storageRef, formData.imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            let finalOrderId: number;
            const customOrderIdStr = formData.orderId.trim();

            if (customOrderIdStr) {
                const customOrderId = parseInt(customOrderIdStr, 10);
                const q = query(collection(db, collectionName), where("orderId", "==", customOrderId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    throw new Error(`Order ID ${customOrderId} is already in use.`);
                }
                finalOrderId = customOrderId;
            } else {
                const q = query(collection(db, collectionName), orderBy("orderId", "desc"), limit(1));
                const querySnapshot = await getDocs(q);
                finalOrderId = querySnapshot.empty ? 1 : querySnapshot.docs[0].data().orderId + 1;
            }

            const productData = {
                orderId: finalOrderId,
                name: formData.name,
                price: Number(formData.price),
                imageUrl: imageUrl,
                is_available: formData.is_available,
                is_visible: formData.is_visible,
                stock: Number(formData.stock),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            await addDoc(collection(db, collectionName), productData);

            setAlertMessage({ type: 'success', message: 'Product added successfully!' });
            resetForm();
            fetchProducts();

        } catch (err: any) {
            console.error(err);
            setAlertMessage({ type: 'error', message: err.message || 'Failed to add product. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (product: Product) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setEditingProduct(product);
        setFormData({
            orderId: String(product.orderId),
            name: product.name,
            price: String(product.price),
            imageFile: null,
            is_available: product.is_available,
            is_visible: product.is_visible,
            stock: String(product.stock ?? ''),
        });
        setPreviewImage(product.imageUrl);
        setValidationErrors({});
    };

    // --- HEAVILY MODIFIED to allow editing the orderId ---
    const handleUpdate = async () => {
        if (!editingProduct || !validateForm()) return;

        setIsLoading(true);
        try {
            let newOrderId = Number(formData.orderId);
            const originalOrderId = editingProduct.orderId;

            // Step 1: Check if the Order ID was changed and if the new one is taken, or if it's being set to blank
            if (formData.orderId.trim() && newOrderId !== originalOrderId) {
                const q = query(collection(db, collectionName), where("orderId", "==", newOrderId));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    // This new ID is already used by another document. Stop the update.
                    setValidationErrors(prev => ({ ...prev, orderId: `Order ID ${newOrderId} is already taken.` }));
                    throw new Error(`Order ID ${newOrderId} is already taken.`);
                }
            } else if (!formData.orderId.trim()) {
                // Handle the case where the orderId is being cleared.  Find the highest existing ID and increment.
                const q = query(collection(db, collectionName), orderBy("orderId", "desc"), limit(1));
                const querySnapshot = await getDocs(q);
                newOrderId = querySnapshot.empty ? 1 : querySnapshot.docs[0].data().orderId + 1;
            }


            // Step 2: Handle image upload if a new image was provided
            let imageUrl = editingProduct.imageUrl;
            if (formData.imageFile) {
                const storageRef = ref(storage, `${collectionName}_images/${Date.now()}_${formData.imageFile.name}`);
                await uploadBytes(storageRef, formData.imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            // Step 3: Prepare the final data object for the update
            const updatedData = {
                orderId: newOrderId, // This can be the same or the new, validated ID
                name: formData.name,
                price: Number(formData.price),
                imageUrl: imageUrl,
                is_available: formData.is_available,
                is_visible: formData.is_visible,
                stock: Number(formData.stock),
                updatedAt: serverTimestamp(),
            };

            // Step 4: Perform the update
            const productRef = doc(db, collectionName, editingProduct.id);
            await updateDoc(productRef, updatedData);

            setAlertMessage({ type: 'success', message: 'Product updated successfully!' });
            resetForm();
            fetchProducts();

        } catch (err: any) {
            console.error(err);
            setAlertMessage({ type: 'error', message: err.message || 'Failed to update product.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id);
        setShowConfirmDialog(true);
    };

    const handleDeleteConfirm = async () => {
        if (!productToDelete) return;

        setIsLoading(true);
        try {
            await deleteDoc(doc(db, collectionName, productToDelete));
            setAlertMessage({ type: 'success', message: 'Product deleted successfully.' });
            fetchProducts();
        } catch (err) {
            console.error(err);
            setAlertMessage({ type: 'error', message: 'Failed to delete product.' });
        } finally {
            setIsLoading(false);
            setShowConfirmDialog(false);
            setProductToDelete(null);
        }
    };

    return (
        <div className="space-y-8">
            {alertMessage && (
                <div className={`flex items-center p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {alertMessage.type === 'success' ? <FaCheckCircle className="mr-3" /> : <FaExclamationCircle className="mr-3" />}
                    <span className="font-medium">{alertMessage.message}</span>
                </div>
            )}

            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-4">
                    {editingProduct ? `Edit Product` : `Add New ${categoryName}`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
                        <div
                            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onDrop={handleDrop}
                            className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors flex flex-col items-center justify-center aspect-square
                                ${isDragging ? 'border-indigo-600 bg-indigo-50' : validationErrors.image ? 'border-red-500' : 'border-gray-300 hover:border-indigo-500'}`}
                        >
                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} className="hidden" id="fileInput" />
                            <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                                {previewImage ? (
                                    <img src={previewImage} alt="Preview" className="w-full h-full rounded-md object-contain" />
                                ) : (
                                    <div className="text-slate-500 space-y-2">
                                        <FaImage className="mx-auto h-12 w-12 text-slate-400" />
                                        <p>Drag & drop image here, or</p>
                                        <p className="text-indigo-600 font-semibold">click to browse</p>
                                    </div>
                                )}
                            </label>
                        </div>
                        {validationErrors.image && <p className="text-red-600 text-sm mt-1">{validationErrors.image}</p>}
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="md:col-span-2 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                            <input id="name" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Classic White Tee" className={`w-full p-3 border rounded-lg transition-shadow focus:outline-none focus:ring-2 ${validationErrors.name ? 'border-red-400 ring-red-200' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`} required />
                            {validationErrors.name && <p className="text-red-600 text-sm mt-1">{validationErrors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price ($)</label>
                            <input id="price" type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="e.g., 29.99" step="0.01" className={`w-full p-3 border rounded-lg transition-shadow focus:outline-none focus:ring-2 ${validationErrors.price ? 'border-red-400 ring-red-200' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`} required />
                            {validationErrors.price && <p className="text-red-600 text-sm mt-1">{validationErrors.price}</p>}
                        </div>

                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-slate-700 mb-1">Stock</label>
                            <input
                                id="stock"
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                placeholder="e.g., 100"
                                min="0"
                                step="1"
                                className={`w-full p-3 border rounded-lg transition-shadow focus:outline-none focus:ring-2 ${validationErrors.stock ? 'border-red-400 ring-red-200' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                                required
                            />
                            {validationErrors.stock && <p className="text-red-600 text-sm mt-1">{validationErrors.stock}</p>}
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"><label className="font-medium text-slate-700">Available for purchase</label><ToggleSwitch checked={formData.is_available} onChange={(c) => setFormData(p => ({ ...p, is_available: c }))} /></div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"><label className="font-medium text-slate-700">Visible on site</label><ToggleSwitch checked={formData.is_visible} onChange={(c) => setFormData(p => ({ ...p, is_visible: c }))} /></div>

                        <div>
                            <label htmlFor="orderId" className="block text-sm font-medium text-slate-700 mb-1">Order ID (for sorting)</label>
                            <input
                                id="orderId"
                                type="number"
                                name="orderId"
                                value={formData.orderId}
                                onChange={handleInputChange}
                                placeholder={"e.g., 10 (auto-increments if blank for new products)"}
                                className={`w-full p-3 border rounded-lg transition-shadow focus:outline-none focus:ring-2 ${validationErrors.orderId ? 'border-red-400 ring-red-200' : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'}`}
                            />
                            {validationErrors.orderId && <p className="text-red-600 text-sm mt-1">{validationErrors.orderId}</p>}
                        </div>


                        <div className="flex justify-end space-x-4 pt-4">
                            {editingProduct ? (
                                <>
                                    <button type="button" onClick={resetForm} className="px-6 py-2 text-sm font-semibold text-slate-800 bg-white rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                                    <button type="button" onClick={handleUpdate} disabled={isLoading} className="px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400">{isLoading ? 'Saving...' : 'Update Product'}</button>
                                </>
                            ) : (
                                <button type="button" onClick={handleSubmit} disabled={isLoading} className="px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 flex items-center"><FaPlus className="mr-2" /> {isLoading ? 'Adding...' : 'Add Product'}</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col group relative transition-all hover:shadow-lg">
                        <div className="absolute top-2 right-2 z-20 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button onClick={() => handleEditClick(product)} className="p-2 bg-white/80 backdrop-blur-sm text-slate-600 hover:text-indigo-600 hover:bg-white rounded-full shadow-md transition-colors"><FaEdit size={16} /></button>
                            <button onClick={() => handleDeleteClick(product.id)} className="p-2 bg-white/80 backdrop-blur-sm text-slate-600 hover:text-red-600 hover:bg-white rounded-full shadow-md transition-colors"><FaTrash size={16} /></button>
                        </div>

                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-sm font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg z-10">
                            {product.orderId}
                        </div>

                        <img src={product.imageUrl} alt={product.name} className="w-full h-52 object-contain" />
                        <div className="p-4 flex-grow flex flex-col">
                            <h3 className="text-lg font-semibold text-slate-800 flex-grow pt-2">{product.name}</h3>
                            <p className="text-xl font-bold text-indigo-600 mt-2">${product.price.toFixed(2)}</p>
                            <p className="text-sm text-slate-600 mt-1">Stock: {product.stock}</p>
                            <div className="flex items-center mt-3 space-x-2">
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.is_available ? 'Available' : 'Out of Stock'}</span>
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${product.is_visible ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'}`}>{product.is_visible ? 'Visible' : 'Hidden'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 transform transition-all">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Confirm Deletion</h2>
                        <p className="text-slate-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setShowConfirmDialog(false)} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;