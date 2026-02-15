import { useEffect, useState } from "react"

export default function ProductForm({product,onSave,onClose}){

    const[formData,setFormData]=useState({
        title:"",
        image:"",
        price:{H:"",F:""},
        category:"",
        stock:"",
    });
    //    Setting Pro Details in Form

       useEffect(()=>{
        if(product){
            setFormData({
                ...product,price:
                typeof product.price==="object"? product.price:{H:product.price,F:""},
                stock: product.stock||"",
            })
        }
       },[product])

            //  only assign formData.price to H because that’s the existing price.
            //  leave F blank ("") to let the user enter it if needed.
           // If  adding a new product and don’t enter stock, the form shows blank.
           // If the product’s stock is 0, the current code still shows blank, which is misleading.

    // Handling User Change
    const handleChange=(e)=>{
        const{name,value}=e.target;

        if(name==="H"||name=="F"){
            setFormData({
                ...formData,
                price:{...formData.price,[name]:value}
            })
        }else{
            setFormData({...formData,[name]:value})
        }
    }

    // Handling User Submit button
    
    const handleSubmit=(e)=>{
        e.preventDefault();
        onSave({
            ...formData,
            id:product?.id,
            stock:String(formData.stock)||"0",
            price:{
                H:Number(formData.price.H)||0,
                F:Number(formData.price.F)||0,
            }
        })
    }

     return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {product ? "Edit Product" : "Add Product"}
        </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Product Title"
            className="w-full border p-2 rounded"
            required
          />

          {/* Price H */}
          <input
            type="number"
            name="H"
            value={formData.price.H}
            onChange={handleChange}
            placeholder="Price (H)"
            className="w-full border p-2 rounded"
            min="0"
            step="0.01"
            required
          />

          {/* Price F */}
          <input
            type="number"
            name="F"
            value={formData.price.F}
            onChange={handleChange}
            placeholder="Price (F)"
            className="w-full border p-2 rounded"
            min="0"
            step="0.01"
            required
          />

          {/* Stock */}
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="Stock Quantity"
            className="w-full border p-2 rounded"
            min="0"
            required
          />

          {/* Category */}
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category"
            className="w-full border p-2 rounded"
          />

          {/* Image URL */}
          <input
            type="text"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full border p-2 rounded"
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
   
}