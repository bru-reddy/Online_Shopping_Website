import User from "./models/User.js";
import Product from "./models/Product.js";

const demoProducts = [
  {
    name: "Apple AirPods Max",
    description: "Apple AirPods Max wireless over-ear headphones with high-fidelity audio and active noise cancellation.",
    category: "Electronics",
    price: 54999,
    imageQuery: "Apple AirPods Max"
  },
  {
    name: "MacBook Pro",
    description: "Apple MacBook Pro laptop designed for professional work, coding, creative tasks and everyday computing.",
    category: "Computers & Accessories",
    price: 149999,
    imageQuery: "MacBook Pro"
  },
  {
    name: "iPhone 13",
    description: "Apple iPhone 13 smartphone with a dual-camera system, OLED display and 5G connectivity.",
    category: "Mobiles",
    price: 49999,
    imageQuery: "iPhone 13"
  },
  {
    name: "Samsung Galaxy S21 FE 5G",
    description: "Samsung Galaxy S21 FE 5G smartphone with a high-refresh-rate display, multiple cameras and 5G connectivity.",
    category: "Mobiles",
    price: 29999,
    imageQuery: "Samsung Galaxy S21 FE 5G"
  },
  {
    name: "Black Whisk",
    description: "Black kitchen whisk for mixing, beating and preparing sauces, batters and other recipes.",
    category: "Home & Kitchen",
    price: 399,
    imageQuery: "Black Whisk"
  },
  {
    name: "Red Lipstick",
    description: "Classic red lipstick with a smooth finish for everyday makeup and special occasions.",
    category: "Beauty",
    price: 499,
    imageQuery: "Red Lipstick"
  },
  {
    name: "Blue & Black Check Shirt",
    description: "Blue and black checked casual shirt suitable for everyday wear and relaxed outings.",
    category: "Fashion",
    price: 999,
    imageQuery: "Blue & Black Check Shirt"
  },
  {
    name: "Football",
    description: "Durable football designed for recreational games, training sessions and outdoor play.",
    category: "Sports",
    price: 899,
    imageQuery: "Football"
  },
  {
    name: "Essence Mascara Lash Princess",
    description: "Essence Lash Princess mascara for defined, lengthened and voluminous-looking eyelashes.",
    category: "Beauty",
    price: 699,
    imageQuery: "Essence Mascara Lash Princess"
  },
  {
    name: "Wooden Bathroom Vanity",
    description: "Wooden bathroom vanity cabinet providing practical storage and a clean furniture finish for bathrooms.",
    category: "Home & Kitchen",
    price: 8999,
    imageQuery: "Wooden Bathroom Vanity"
  }
];

const fallbackImage = (name) =>
  "https://placehold.co/800x800/png?text=" + encodeURIComponent(name);

async function fetchImage(product) {
  try {
    const response = await fetch(
      "https://dummyjson.com/products/search?q=" + encodeURIComponent(product.imageQuery) + "&limit=10"
    );

    if (!response.ok) return fallbackImage(product.name);

    const data = await response.json();
    const exact = (data.products || []).find(
      item => String(item.title || "").toLowerCase() === product.imageQuery.toLowerCase()
    );

    // Never use an unrelated product image. If there is no exact match, use a named placeholder.
    return exact?.images?.[0] || exact?.thumbnail || fallbackImage(product.name);
  } catch {
    return fallbackImage(product.name);
  }
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

  const legacyDemoProducts = await Product.find({
    seller: seller._id,
    description: { $regex: /practical Cartiva marketplace listing/i }
  });

  if (legacyDemoProducts.length) {
    await Product.deleteMany({
      _id: { $in: legacyDemoProducts.map(product => product._id) }
    });
  }

  const expectedNames = new Set(demoProducts.map(product => product.name));
  const existingDemoProducts = await Product.find({
    seller: seller._id,
    isDemo: true
  });

  const keepExisting =
    existingDemoProducts.length === demoProducts.length &&
    existingDemoProducts.every(product => expectedNames.has(product.name));

  if (keepExisting) {
    for (const product of demoProducts) {
      const existing = existingDemoProducts.find(item => item.name === product.name);
      existing.description = product.description;
      existing.category = product.category;
      existing.price = product.price;
      existing.stock = 15;
      existing.active = true;
      if (!existing.images?.length) {
        existing.images = [await fetchImage(product)];
      }
      await existing.save();
    }

    console.log("Demo catalog verified: 10 products for " + seller.email + ".");
    return;
  }

  if (existingDemoProducts.length) {
    await Product.deleteMany({
      _id: { $in: existingDemoProducts.map(product => product._id) }
    });
  }

  for (const product of demoProducts) {
    await Product.create({
      seller: seller._id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: [await fetchImage(product)],
      category: product.category,
      stock: 15,
      active: true,
      isDemo: true
    });
  }

  console.log("Demo catalog seeded: 10 products for " + seller.email + ".");
}
