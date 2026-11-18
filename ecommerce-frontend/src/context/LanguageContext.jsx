import { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  en: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    cart: 'Cart',
    wishlist: 'Wishlist',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    myAccount: 'My Account',
    myOrders: 'My Orders',
    admin: 'Admin',
    search: 'Search products...',
    addToCart: 'Add to Cart',
    checkout: 'Checkout',
    total: 'Total',
    subtotal: 'Subtotal',
    featuredProducts: 'Featured Products',
    bestSellers: 'Best Sellers',
    newArrivals: 'New Arrivals',
    heroTitle: 'Shop Smart, Live Better',
    heroSubtitle: 'Discover quality products, great deals, and fast checkout.',
    shopNow: 'Shop Now',
    welcome: 'Welcome',
    language: 'Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
  },
  km: {
    home: 'ទំព័រដើម',
    shop: 'ហាង',
    categories: 'ប្រភេទ',
    cart: 'កន្ត្រក',
    wishlist: 'បញ្ជីចង់បាន',
    login: 'ចូល',
    register: 'ចុះឈ្មោះ',
    logout: 'ចាកចេញ',
    myAccount: 'គណនីរបស់ខ្ញុំ',
    myOrders: 'ការបញ្ជាទិញរបស់ខ្ញុំ',
    admin: 'អ្នកគ្រប់គ្រង',
    search: 'ស្វែងរកផលិតផល...',
    addToCart: 'ដាក់ក្នុងកន្ត្រក',
    checkout: 'បង់ប្រាក់',
    total: 'សរុប',
    subtotal: 'សរុបរង',
    featuredProducts: 'ផលិតផលពិសេស',
    bestSellers: 'លក់ដាច់បំផុត',
    newArrivals: 'មកដល់ថ្មី',
    heroTitle: 'ទិញឆ្លាតវៃ រស់នៅប្រសើរ',
    heroSubtitle: 'ស្វែងរកផលិតផលគុណភាព ល្អ និងការបង់ប្រាក់រហ័ស។',
    shopNow: 'ទិញឥឡូវនេះ',
    welcome: 'សូមស្វាគមន៍',
    language: 'ភាសា',
    darkMode: 'របៀបងងឹត',
    lightMode: 'របៀបភ្លឺ',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');

  const changeLang = (next) => {
    setLang(next);
    localStorage.setItem('lang', next);
  };

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  const value = useMemo(() => ({ lang, changeLang, t }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
