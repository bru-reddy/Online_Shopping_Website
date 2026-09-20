import User from "./models/User.js";
import Product from "./models/Product.js";

const catalog = {
  "Electronics": [
    ["Bluetooth Speaker","electronics speaker",1499],
    ["Wireless Earbuds","electronics earbuds",2199],
    ["Smart LED Desk Lamp","electronics desk lamp",899],
    ["Portable Power Bank 20000mAh","power bank electronics",1299],
    ["USB-C Fast Charger","usb c charger electronics",799],
    ["Noise Cancelling Headphones","headphones electronics",3499],
    ["Smartwatch","smartwatch electronics",2799],
    ["Mini Projector","mini projector electronics",4999],
    ["Wireless Keyboard","wireless keyboard electronics",1199],
    ["Digital Alarm Clock","digital alarm clock electronics",699]
  ],
  "Computers & Accessories": [
    ["Wireless Mouse","computer wireless mouse",699],
    ["Laptop Stand","laptop stand computer",1299],
    ["Mechanical Keyboard","mechanical keyboard computer",2499],
    ["USB-C Hub","usb c hub computer",1599],
    ["Laptop Sleeve","laptop sleeve computer",899],
    ["Webcam Full HD","webcam computer",1799],
    ["Gaming Mouse Pad","gaming mouse pad computer",599],
    ["Bluetooth Keyboard","bluetooth keyboard computer",1399],
    ["External SSD 500GB","external ssd computer",3999],
    ["Cooling Pad","laptop cooling pad computer",1099]
  ],
  "Mobiles": [
    ["Samsung Galaxy A56","smartphone mobile",31999],
    ["OnePlus Nord CE","smartphone mobile",24999],
    ["Google Pixel 9a","google pixel smartphone",42999],
    ["Nothing Phone","nothing phone smartphone",29999],
    ["Redmi Note Pro","redmi smartphone",22999],
    ["Motorola Edge","motorola smartphone",27999],
    ["Realme Number Series","realme smartphone",21999],
    ["iPhone 16 Case","iphone phone case",899],
    ["65W Mobile Charger","mobile charger",1299],
    ["Tempered Glass Pack","mobile tempered glass",399]
  ],
  "Tablets": [
    ["Samsung Galaxy Tab","tablet",28999],
    ["Apple iPad","ipad tablet",35999],
    ["Lenovo Tab M Series","lenovo tablet",17999],
    ["OnePlus Pad","oneplus tablet",29999],
    ["Xiaomi Pad","xiaomi tablet",24999],
    ["Tablet Keyboard Case","tablet keyboard case",1499],
    ["Universal Tablet Stand","tablet stand",799],
    ["Stylus Pen for Tablet","tablet stylus",1299],
    ["Tablet Sleeve","tablet sleeve",699],
    ["USB-C Tablet Adapter","tablet usb c adapter",899]
  ],
  "Fashion": [
    ["Oversized Cotton T-Shirt","fashion t shirt",799],
    ["Classic Denim Jacket","fashion denim jacket",1899],
    ["Relaxed Fit Jeans","fashion jeans",1699],
    ["Cotton Kurti","fashion kurti",999],
    ["Floral Summer Dress","fashion summer dress",1499],
    ["Casual Hoodie","fashion hoodie",1599],
    ["Linen Shirt","fashion linen shirt",1299],
    ["Wide Leg Trousers","fashion trousers",1399],
    ["Everyday Sneakers","fashion sneakers",1999],
    ["Canvas Tote Bag","fashion tote bag",699]
  ],
  "Home & Kitchen": [
    ["Ceramic Dinner Set","home kitchen dinner set",2499],
    ["Non-Stick Frying Pan","kitchen frying pan",899],
    ["Stainless Steel Water Bottle","kitchen water bottle",699],
    ["Cotton Cushion Covers","home cushion covers",499],
    ["Bamboo Storage Basket","home storage basket",799],
    ["Electric Kettle","kitchen electric kettle",1499],
    ["Glass Food Storage Set","kitchen food containers",1099],
    ["Table Lamp","home table lamp",1299],
    ["Kitchen Knife Set","kitchen knife set",1199],
    ["Microfiber Cleaning Set","home cleaning set",599]
  ],
  "Beauty": [
    ["Vitamin C Face Serum","beauty skincare serum",699],
    ["Hydrating Face Moisturizer","beauty moisturizer",599],
    ["Daily Sunscreen SPF 50","beauty sunscreen",749],
    ["Gentle Face Cleanser","beauty face cleanser",499],
    ["Lip Care Set","beauty lip care",399],
    ["Makeup Brush Set","beauty makeup brushes",899],
    ["Aloe Vera Gel","beauty aloe vera skincare",349],
    ["Hair Repair Serum","beauty hair serum",699],
    ["Body Care Gift Set","beauty body care",999],
    ["Clay Face Mask","beauty face mask",449]
  ],
  "Books": [
    ["Atomic Habits","book reading",599],
    ["The Psychology of Money","book reading",499],
    ["The Alchemist","book reading",399],
    ["Ikigai","book reading",349],
    ["Clean Code","programming book",799],
    ["Introduction to Algorithms","computer science book",1299],
    ["The Pragmatic Programmer","programming book",899],
    ["Rich Dad Poor Dad","book reading",449],
    ["Deep Work","book reading",499],
    ["The 7 Habits of Highly Effective People","book reading",549]
  ],
  "Sports": [
    ["Football","sports football",899],
    ["Cricket Bat","sports cricket bat",1899],
    ["Badminton Racket","sports badminton",1299],
    ["Yoga Mat","sports yoga mat",699],
    ["Skipping Rope","sports skipping rope",299],
    ["Resistance Bands Set","sports fitness bands",599],
    ["Adjustable Dumbbells","sports dumbbells",2499],
    ["Running Shoes","sports running shoes",2199],
    ["Tennis Balls Pack","sports tennis balls",499],
    ["Gym Training Gloves","sports gym gloves",449]
  ],
  "Other": [
    ["Reusable Water Bottle","lifestyle water bottle",599],
    ["Travel Organizer","travel organizer",799],
    ["Minimal Desk Organizer","desk organizer",499],
    ["LED Keychain Light","lifestyle keychain",299],
    ["Travel Neck Pillow","travel neck pillow",699],
    ["Reusable Shopping Bags","reusable shopping bags",399],
    ["Cable Organizer Pouch","cable organizer pouch",599],
    ["Portable Umbrella","umbrella",699],
    ["Notebook Gift Set","notebook stationery",449],
    ["Multi-Purpose Storage Box","storage box",799]
  ]
};

const imageSources = {
  "Electronics": ["laptops", "mobile-accessories", "smartphones"],
  "Computers & Accessories": ["laptops"],
  "Mobiles": ["smartphones", "mobile-accessories"],
  "Tablets": ["tablets"],
  "Fashion": ["mens-shirts", "mens-shoes", "tops", "womens-dresses", "womens-shoes", "womens-bags"],
  "Home & Kitchen": ["kitchen-accessories", "home-decoration", "furniture"],
  "Beauty": ["beauty", "skin-care"],
  "Sports": ["sports-accessories"],
  "Books": ["books"],
  "Other": ["home-decoration", "kitchen-accessories", "womens-bags"]
};

const fallbackImage = (name) =>
  "https://placehold.co/800x800/png?text=" + encodeURIComponent(name);

async function fetchImagePool(category) {
  if (category === "Books") {
    const isbns = [
      "9780735211292", "9780857197689", "9780062315007", "9781786330895",
      "9780132350884", "9780262046305", "9780135957059", "9781612681139",
      "9781455586691", "9781982137274"
    ];
    return isbns.map(isbn => "https://covers.openlibrary.org/isbn/" + isbn + "-L.jpg");
  }

  const slugs = imageSources[category] || ["home-decoration"];
  const responses = await Promise.all(slugs.map(async slug => {
    try {
      const response = await fetch(
        "https://dummyjson.com/products/category/" + encodeURIComponent(slug) + "?limit=30"
      );
      if (!response.ok) return [];
      const data = await response.json();
      return (data.products || []).map(product => product.thumbnail || product.images?.[0]).filter(Boolean);
    } catch {
      return [];
    }
  }));

  return [...new Set(responses.flat())];
}

export async function seedDemoCatalog() {
  if (String(process.env.DEMO_CATALOG_SEED).toLowerCase() !== "true") return;

  const sellerQuery = process.env.DEMO_SELLER_EMAIL
    ? { email: process.env.DEMO_SELLER_EMAIL.trim().toLowerCase(), role: "seller" }
    : { role: "seller" };

  const seller = await User.findOne(sellerQuery);
  if (!seller) {
    console.warn("Demo catalog seed skipped: no seller account found.");
    return;
  }

  let created = 0;

  for (const [category, items] of Object.entries(catalog)) {
    const imagePool = await fetchImagePool(category);
    const getImage = (index, name) => imagePool[index % imagePool.length] || fallbackImage(name);
    const existingProducts = await Product.find({
      seller: seller._id,
      category,
      active: true
    }).sort({ createdAt: 1 });

    for (let index = 0; index < existingProducts.length; index += 1) {
      const product = existingProducts[index];
      if (String(product.description || "").includes("practical Cartiva marketplace listing")) {
        product.images = [getImage(index, product.name)];
        await product.save();
      }
    }

    const existing = existingProducts.length;
    const missing = Math.max(0, 10 - existing);
    if (!missing) continue;

    for (let i = existing; i < 10; i += 1) {
      const [name, imageQuery, price] = items[i];
      await Product.create({
        seller: seller._id,
        name,
        description: `${name} is a practical Cartiva marketplace listing selected for everyday use. Quality-focused, useful and ready to order.`,
        price,
        images: [getImage(i, name)],
        category,
        stock: 10 + ((i * 3) % 16),
        active: true
      });
      created += 1;
    }
  }

  console.log(`Demo catalog seed complete: added ${created} products for ${seller.email}.`);
}
