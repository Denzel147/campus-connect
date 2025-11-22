// Image generator utility for items
const generateRandomImage = (itemName, category, condition) => {
  // Create a seed based on item name for consistency
  const seed = itemName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Base image collections by category
  const imageCollections = {
    books: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=200&fit=crop',
    ],
    electronics: [
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop',
    ],
    clothing: [
      'https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop',
    ],
    furniture: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1519947486511-46149fa0138d?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1555004878-6fb00837c260?w=300&h=200&fit=crop',
    ],
    sports: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1577212017184-80cc0da11082?w=300&h=200&fit=crop',
    ],
    default: [
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1542728928-1413d1894ed1?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=300&h=200&fit=crop',
      'https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=300&h=200&fit=crop',
    ]
  };

  // Determine category key
  const categoryKey = getCategoryKey(category, itemName);
  const images = imageCollections[categoryKey] || imageCollections.default;
  
  // Use seed to select consistent image
  const imageIndex = seed % images.length;
  
  return {
    url: images[imageIndex],
    alt: `${itemName} - ${condition} condition`,
    placeholder: `https://via.placeholder.com/300x200/6366F1/ffffff?text=${encodeURIComponent(itemName.substring(0, 10))}`
  };
};

const getCategoryKey = (category, itemName) => {
  const itemLower = itemName.toLowerCase();
  
  // Category-based mapping
  if (category === 1 || itemLower.includes('book') || itemLower.includes('novel') || itemLower.includes('textbook')) {
    return 'books';
  }
  if (category === 2 || itemLower.includes('laptop') || itemLower.includes('phone') || itemLower.includes('tablet') || itemLower.includes('electronic')) {
    return 'electronics';
  }
  if (category === 3 || itemLower.includes('shirt') || itemLower.includes('jacket') || itemLower.includes('pants') || itemLower.includes('dress')) {
    return 'clothing';
  }
  if (category === 4 || itemLower.includes('chair') || itemLower.includes('desk') || itemLower.includes('table') || itemLower.includes('lamp')) {
    return 'furniture';
  }
  if (category === 5 || itemLower.includes('ball') || itemLower.includes('sport') || itemLower.includes('gym') || itemLower.includes('equipment')) {
    return 'sports';
  }
  
  return 'default';
};

// Generate multiple image sizes
const generateImageSizes = (itemName, category, condition) => {
  const base = generateRandomImage(itemName, category, condition);
  const baseUrl = base.url.split('?')[0]; // Remove existing params
  
  return {
    thumbnail: `${baseUrl}?w=150&h=150&fit=crop`,
    medium: `${baseUrl}?w=300&h=200&fit=crop`,
    large: `${baseUrl}?w=600&h=400&fit=crop`,
    original: base.url,
    alt: base.alt,
    placeholder: base.placeholder
  };
};

module.exports = {
  generateRandomImage,
  generateImageSizes,
  getCategoryKey
};
