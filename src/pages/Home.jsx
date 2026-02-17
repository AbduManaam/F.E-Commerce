import React, { useEffect, useState } from "react";
import Hero from "../Components/Hero";
import NewArrivals from "../Components/NewArrivals";
import Features from "../Components/Features";
import Review from "../Components/Review";
import homeApi from "../service/home.api";

const Home = () => {
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);

 
const transformProduct = (product) => {
  // ✅ Debug log
  console.log("🔍 TRANSFORMING:", {
    raw: product,
    has_image_url: !!product.image_url,
    image_url_value: product.image_url
  });
  
  let imageUrls = [];
  
  if (product.image_url) {
    imageUrls = [product.image_url];
  }if (product.image_url) {
    imageUrls = [product.image_url];
} else if (product.ImageURL) {  // ← Add this
    imageUrls = [product.ImageURL];
}
  
  console.log("📸 EXTRACTED IMAGES:", imageUrls);  // ✅ This will show what's extracted
  
  if (imageUrls.length === 0) {
    imageUrls = ["/images/placeholder.png"];
  }

  return {
    id: product.id || product.ID,
    title: product.name || product.Name,
    description: product.description || product.Description || "",
    images: imageUrls,
    price: product.price || product.FinalPrice || product.Price || 0,
    stock: product.stock || product.Stock,
    in_stock: product.in_stock,
    category_name: product.category || product.CategoryName || product.category_name,
    sizes: product.sizes || [],
    _original: product
  };
};

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await homeApi.getHome();

        console.log("HOME RESPONSE:", res);

        if (res.success) {
          
          
          
            // ✅ Transform new_arrivals products
           console.log("🔍 RAW NEW ARRIVALS FROM BACKEND:", res.data.new_arrivals);


          const transformedData = {
            ...res.data,
            new_arrivals: (res.data.new_arrivals || []).map(transformProduct)
          };
          
          console.log("TRANSFORMED NEW ARRIVALS:", transformedData.new_arrivals);





          console.log("🖼️ IMAGE URLS:", transformedData.new_arrivals.map(p => ({
          name: p.title,
          images: p.images
        })));





          setHomeData(transformedData);
        } else {
          console.error(res.message);
        }
      } catch (error) {
        console.error("Home fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, []);

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!homeData) {
    return <div className="text-center mt-20">No data found</div>;
  }

  return (
    <>
      <Hero hero={homeData.hero} />
      <NewArrivals products={homeData.new_arrivals} />
      <Features features={homeData.features} />
      <Review reviews={homeData.reviews} />
    </>
  );
};

export default Home;