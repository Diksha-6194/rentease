import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../services/propertyService';

const CreatePropertyPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', property_type: 'Apartment', 
    rent_amount: '', deposit_amount: '', address: '', 
    city: '', state: '', country: '', bedrooms: '', bathrooms: ''
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      images.forEach(img => data.append('uploaded_images', img));
      
      const res = await propertyService.createProperty(data);
      navigate(`/properties/${res.id}`);
    } catch (error) {
      console.error(error);
      alert('Failed to create property. Ensure you are logged in as a Landlord.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">List Your Property</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
            <input required type="text" name="title" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" placeholder="e.g. Beautiful Downtown Loft" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea required name="description" onChange={handleChange} rows="4" className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Describe the property..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
            <select name="property_type" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all">
              <option>Apartment</option>
              <option>House</option>
              <option>Condo</option>
              <option>Townhouse</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rent Amount ($)</label>
            <input required type="number" name="rent_amount" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Deposit Amount ($)</label>
            <input required type="number" name="deposit_amount" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms</label>
              <input required type="number" name="bedrooms" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms</label>
              <input required type="number" name="bathrooms" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input required type="text" name="address" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
            <input required type="text" name="city" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
            <input required type="text" name="state" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
            <input required type="text" name="country" onChange={handleChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Property Images</label>
            <input required type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full bg-gray-50 border-transparent rounded-xl p-4 focus:bg-white border focus:ring-2 focus:ring-blue-500 transition-all" />
            <p className="text-xs text-gray-500 mt-2">You can select multiple images. The first image will be the primary thumbnail.</p>
          </div>
        </div>
        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md text-lg mt-4">
          {loading ? 'Publishing...' : 'Publish Listing'}
        </button>
      </form>
    </div>
  );
};

export default CreatePropertyPage;
