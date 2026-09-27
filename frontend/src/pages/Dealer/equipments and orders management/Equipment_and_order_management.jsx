import React, { useState } from 'react';
import './Equipment_and_order.css';
import {
  Package, Edit, Plus, Trash2, X
} from "lucide-react";
import Footer from '../../../components/common/Footer/Footer'

const TRANSMISSION_OPTIONS = ['automatic', 'manual', 'cvt', 'electric'];
const FUEL_TYPE_OPTIONS = ['diesel', 'gasoline', 'electric', 'hybrid', 'plug-in_hybrid'];
const RENT_STATUS_OPTIONS = ['available', 'rented', 'maintenance', 'cleaning', 'out_of_service'];

const emptyForm = {
  name: '',
  sku: '',
  category_id: '',
  brand_id: '',
  product_type: 'purchased_product',
  price: '',
  compare_price: '',
  stock_quantity: '',
  hourly_rate: '',
  daily_base_rate: '',
  weekly_base_rate: '',
  monthly_base_rate: '',
  transmission: TRANSMISSION_OPTIONS[0],
  fuel_type: FUEL_TYPE_OPTIONS[0],
  rent_product_status: RENT_STATUS_OPTIONS[0],
};

function productToForm(product) {
  if (!product) return emptyForm;

  return {
    name: product.name ?? '',
    sku: product.sku ?? '',
    category_id: product.category_id ?? '',
    brand_id: product.brand_id ?? '',
    product_type: product.product_type ?? 'purchased_product',
    price: product.purchased_product?.price ?? '',
    compare_price: product.purchased_product?.compare_price ?? '',
    stock_quantity: product.stock_quantity ?? '',
    hourly_rate: product.rental_product?.hourly_rate ?? '',
    daily_base_rate: product.rental_product?.daily_base_rate ?? '',
    weekly_base_rate: product.rental_product?.weekly_base_rate ?? '',
    monthly_base_rate: product.rental_product?.monthly_base_rate ?? '',
    transmission: product.rental_product?.transmission ?? TRANSMISSION_OPTIONS[0],
    fuel_type: product.rental_product?.fuel_type ?? FUEL_TYPE_OPTIONS[0],
    rent_product_status: product.rental_product?.rent_product_status ?? RENT_STATUS_OPTIONS[0],
  };
}

const ProductDialog = ({ product, categories, brands, saving, error, onSave, onClose }) => {
  const [form, setForm] = useState(() => productToForm(product));

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.name || !form.sku || !form.category_id) return;
    onSave(form);
  };

  return (
    <div className="Equipment_Dealer_dialog_overlay">
      <div className="Equipment_Dealer_dialog_content">
        <div className="Equipment_Dealer_dialog_header">
          <h3 className="Equipment_Dealer_dialog_title">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="Equipment_Dealer_dialog_close">
            <X className="Equipment_Dealer_icon Equipment_Dealer_icon_close" />
          </button>
        </div>
        <p className="Equipment_Dealer_dialog_desc">
          List an item for sale, or equipment available for rent.
        </p>

        {error && <p className="auth__error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="Equipment_Dealer_form_group">
            <label className="Equipment_Dealer_form_label">Listing Type</label>
            <select
              value={form.product_type}
              onChange={set('product_type')}
              className="Equipment_Dealer_form_select"
              disabled={Boolean(product)}
            >
              <option value="purchased_product">For sale</option>
              <option value="rental_product">For rent</option>
            </select>
          </div>

          <div className="Equipment_Dealer_form_group">
            <label className="Equipment_Dealer_form_label">Name</label>
            <input type="text" value={form.name} onChange={set('name')} className="Equipment_Dealer_form_input" required />
          </div>

          <div className="Equipment_Dealer_form_group">
            <label className="Equipment_Dealer_form_label">SKU</label>
            <input type="text" value={form.sku} onChange={set('sku')} className="Equipment_Dealer_form_input" required />
          </div>

          <div className="Equipment_Dealer_form_group">
            <label className="Equipment_Dealer_form_label">Category</label>
            <select value={form.category_id} onChange={set('category_id')} className="Equipment_Dealer_form_select" required>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="Equipment_Dealer_form_group">
            <label className="Equipment_Dealer_form_label">Brand</label>
            <select value={form.brand_id} onChange={set('brand_id')} className="Equipment_Dealer_form_select">
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.brand_id} value={brand.brand_id}>{brand.name}</option>
              ))}
            </select>
          </div>

          {form.product_type === 'purchased_product' ? (
            <>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Price</label>
                <input type="number" step="0.01" value={form.price} onChange={set('price')} className="Equipment_Dealer_form_input" required />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Compare Price</label>
                <input type="number" step="0.01" value={form.compare_price} onChange={set('compare_price')} className="Equipment_Dealer_form_input" />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={set('stock_quantity')} className="Equipment_Dealer_form_input" />
              </div>
            </>
          ) : (
            <>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Hourly Rate</label>
                <input type="number" step="0.01" value={form.hourly_rate} onChange={set('hourly_rate')} className="Equipment_Dealer_form_input" required />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Daily Rate</label>
                <input type="number" step="0.01" value={form.daily_base_rate} onChange={set('daily_base_rate')} className="Equipment_Dealer_form_input" required />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Weekly Rate</label>
                <input type="number" step="0.01" value={form.weekly_base_rate} onChange={set('weekly_base_rate')} className="Equipment_Dealer_form_input" required />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Monthly Rate</label>
                <input type="number" step="0.01" value={form.monthly_base_rate} onChange={set('monthly_base_rate')} className="Equipment_Dealer_form_input" required />
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Transmission</label>
                <select value={form.transmission} onChange={set('transmission')} className="Equipment_Dealer_form_select">
                  {TRANSMISSION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Fuel Type</label>
                <select value={form.fuel_type} onChange={set('fuel_type')} className="Equipment_Dealer_form_select">
                  {FUEL_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="Equipment_Dealer_form_group">
                <label className="Equipment_Dealer_form_label">Status</label>
                <select value={form.rent_product_status} onChange={set('rent_product_status')} className="Equipment_Dealer_form_select">
                  {RENT_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </>
          )}

          <div className="Equipment_Dealer_dialog_footer">
            <button type="button" onClick={onClose} className="Equipment_Dealer_cancel_button">Cancel</button>
            <button type="submit" className="Equipment_Dealer_add_button_dialog" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EquipmentAndOrdersPage = ({
  products,
  loading,
  error,
  categories,
  brands,
  categoryNameById,
  onCreate,
  onUpdate,
  onDelete,
  saving,
  saveError,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const openAddDialog = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSave = async (form) => {
    const success = editingProduct
      ? await onUpdate(editingProduct.product_id, form)
      : await onCreate(form);

    if (success) {
      setDialogOpen(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="Equipment_Dealer_container">
      <main className="Equipment_Dealer_main">
        <div className="Equipment_Dealer_header">
          <h1>Products & Equipment</h1>
          <p>Manage the items and equipment you sell or rent out to farmers</p>
        </div>

        <div className="Equipment_Dealer_card">
          <div className="Equipment_Dealer_section_header">
            <Package className="Equipment_Dealer_icon Equipment_Dealer_icon_tractor" />
            <h2>My Listings</h2>
          </div>
          <p className="Equipment_Dealer_section_desc">Everything you currently have listed for farmers to buy or rent</p>

          {loading && <p className="dashboard-page__state">Loading your listings…</p>}
          {!loading && error && <p className="auth__error-message">{error}</p>}
          {!loading && !error && products.length === 0 && (
            <p className="dashboard-page__state">You haven't listed any products yet.</p>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="Equipment_Dealer_table_container">
              <table className="Equipment_Dealer_table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Price / Rate</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.product_id}>
                      <td className="Equipment_Dealer_font_medium">{item.name}</td>
                      <td>{item.product_type === 'rental_product' ? 'For rent' : 'For sale'}</td>
                      <td>{categoryNameById[item.category_id] ?? '—'}</td>
                      <td>
                        {item.product_type === 'rental_product'
                          ? `${item.rental_product?.daily_base_rate ?? '—'} / day`
                          : `${item.purchased_product?.price ?? '—'} SYP`}
                      </td>
                      <td>
                        <span className="Equipment_Dealer_status_badge">
                          {item.product_type === 'rental_product'
                            ? item.rental_product?.rent_product_status ?? '—'
                            : (item.purchased_product?.is_active ? 'active' : 'inactive')}
                        </span>
                      </td>
                      <td>
                        <div className="Equipment_Dealer_actions_wrapper">
                          <button className="Equipment_Dealer_edit_button" onClick={() => openEditDialog(item)}>
                            <Edit className="Equipment_Dealer_icon Equipment_Dealer_icon_edit" />
                          </button>
                          <button className="Equipment_Dealer_edit_button" onClick={() => onDelete(item.product_id)}>
                            <Trash2 className="Equipment_Dealer_icon Equipment_Dealer_icon_edit" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="Equipment_Dealer_add_button_container">
            <button className="Equipment_Dealer_add_button" onClick={openAddDialog}>
              <Plus className="Equipment_Dealer_icon Equipment_Dealer_icon_plus" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {dialogOpen && (
          <ProductDialog
            product={editingProduct}
            categories={categories}
            brands={brands}
            saving={saving}
            error={saveError}
            onSave={handleSave}
            onClose={() => { setDialogOpen(false); setEditingProduct(null); }}
          />
        )}
      </main>
      <Footer/>
    </div>
  );
};

export default EquipmentAndOrdersPage;
