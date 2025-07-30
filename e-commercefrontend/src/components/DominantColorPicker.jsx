import { useEffect, useState } from "react";

const product = {
  colors: ['#4B371C', '#8000ff', '#ff0000', '#0000ff'],
  imagesByColor: {
    '#4B371C': ['brown1.jpg', 'brown2.jpg'],
    '#8000ff': ['purple1.jpg', 'purple2.jpg'],
    '#ff0000': ['red1.jpg', 'red2.jpg'],
    '#0000ff': ['blue1.jpg', 'blue2.jpg'],
  },
};

const IMAGE_BASE_URL = "https://localhost:3000/uploads/";

export default function ColorImageSwitcher() {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedImage, setSelectedImage] = useState(
    IMAGE_BASE_URL + product.imagesByColor[product.colors[0]][0]
  );

  // When color changes, update main image to first image of that color
  useEffect(() => {
    const imgs = product.imagesByColor[selectedColor] || [];
    if (imgs.length > 0) {
      setSelectedImage(IMAGE_BASE_URL + imgs[0]);
    }
  }, [selectedColor]);

  const images = product.imagesByColor[selectedColor] || [];

  return (
    <div>
      {/* Main Preview */}
      <div style={{ marginBottom: 16 }}>
        <img
          src={selectedImage}
          alt="Selected"
          style={{
            width: 400,
            height: 400,
            objectFit: "cover",
            border: "2px solid #8B6B3E",
            borderRadius: 12,
            background: "#fff",
          }}
        />
      </div>
      {/* Color Swatches */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {product.colors.map((color) => (
          <button
            key={color}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: color,
              border: selectedColor === color ? "2px solid #000" : "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => setSelectedColor(color)}
            title={color}
          />
        ))}
      </div>
      {/* Thumbnails */}
      <div style={{ display: "flex", gap: 8 }}>
        {images.map((img, idx) => (
          <img
            key={img}
            src={IMAGE_BASE_URL + img}
            alt={selectedColor + " " + idx}
            style={{
              width: 120,
              height: 120,
              objectFit: "cover",
              border: selectedImage === IMAGE_BASE_URL + img ? "2px solid #8B6B3E" : "1px solid #eee",
              borderRadius: 8,
              cursor: "pointer",
            }}
            onClick={() => setSelectedImage(IMAGE_BASE_URL + img)}
          />
        ))}
      </div>
    </div>
  );
}