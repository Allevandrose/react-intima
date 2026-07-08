/**
 * Image helper utilities for Cloudinary
 */

// Get optimized image URL based on size
export const getOptimizedImage = (imageUrl, size = "medium") => {
  if (!imageUrl) return "/placeholder-image.png";

  // If it's a Cloudinary URL, transform it
  if (imageUrl.includes("cloudinary.com")) {
    const transformations = {
      thumbnail: "w_150,h_150,c_thumb,q_auto,f_auto",
      small: "w_200,h_200,c_limit,q_auto,f_auto",
      medium: "w_400,h_400,c_limit,q_auto,f_auto",
      large: "w_800,h_800,c_limit,q_auto,f_auto",
      original: "",
    };

    const transform = transformations[size] || transformations.medium;

    // Insert transformation after /upload/
    const parts = imageUrl.split("/upload/");
    if (parts.length === 2 && transform) {
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
    return imageUrl;
  }

  // Local fallback (shouldn't be used with Cloudinary)
  return imageUrl;
};

// Get multiple image sizes for responsive images
export const getResponsiveImages = (imageUrl) => {
  if (!imageUrl) return null;

  if (imageUrl.includes("cloudinary.com")) {
    return {
      thumbnail: getOptimizedImage(imageUrl, "thumbnail"),
      small: getOptimizedImage(imageUrl, "small"),
      medium: getOptimizedImage(imageUrl, "medium"),
      large: getOptimizedImage(imageUrl, "large"),
      original: imageUrl,
    };
  }

  return {
    original: imageUrl,
    thumbnail: imageUrl,
    small: imageUrl,
    medium: imageUrl,
    large: imageUrl,
  };
};

// Get first image or fallback
export const getFirstImage = (product, size = "medium") => {
  if (!product) return "/placeholder-image.png";

  const images = product.images || [];
  if (images.length === 0) return "/placeholder-image.png";

  return getOptimizedImage(images[0], size);
};

// Check if product has images
export const hasImages = (product) => {
  return product?.images?.length > 0;
};

// Get image count
export const getImageCount = (product) => {
  return product?.images?.length || 0;
};
