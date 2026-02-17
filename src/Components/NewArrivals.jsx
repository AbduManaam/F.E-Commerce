import React from 'react';
import Title from './Title';
import Items from './Items';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Autoplay } from 'swiper/modules';

const NewArrivals = ({ products }) => {

  if (!products || products.length === 0) {
    return <div className="text-center py-20">No products found</div>;
  }

  // ✅ Transform products to match Items component expectations
  const transformProduct = (product) => {
    console.log("new arrivals",product);
    
    // Extract image URLs
    let imageUrls = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrls = product.images[0]
    }
    
    if (imageUrls.length === 0) {
      imageUrls = ["/images/placeholder.png"];
    }

    return {
      id: product.ID || product.id,
      title: product.Name || product.title,
      description: product.Description || product.description || "",
      images:imageUrls,
      price: product.FinalPrice || product.Price || product.price || 0,
      stock: product.Stock || product.stock,
      category_name: product.CategoryName || product.category_name,
      _original: product
    };
  };

  // ✅ Transform all products
  const transformedProducts = products.map(transformProduct);

  return (
    // <section className="max-padd-containerr py-22 xl:py-45 bg-white">
    <section className="max-padd-containerr py-5 xl:py-45 bg-	bg-[#FFFBF0]">
      <Title title1="New" title2="Arrivals" titleStyles="pb-10" />

      <Swiper
        spaceBetween={30}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        breakpoints={{
          500: { slidesPerView: 2 },
          700: { slidesPerView: 3 },
          1022: { slidesPerView: 4 },
          1350: { slidesPerView: 5 },
        }}
        modules={[Autoplay]}
        className="min-h-[599px]"
      >
        {transformedProducts.map((product) => (
          <SwiperSlide
            key={product.id}
            className="flex justify-center"
          >
            <div className="w-full max-w-[380px] h-[550px] mx-auto">
              <Items product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default NewArrivals;