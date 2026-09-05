"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';

type WishlistItem = {
  id: number;
  brand: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  image: string;
  addedToCanvas: boolean;
};

type Notification = {
  show: boolean;
  message: string;
  link: string;
};

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      brand: 'Louis Vuitton',
      name: "Louis Vuitton's emblematic Star Trail ankle boot 8CM",
      price: 1350,
      originalPrice: 1450,
      discount: '10% Off',
      image: '/images/lv-boots.jpg',
      addedToCanvas: false
    },
    {
      id: 2,
      brand: 'Prada',
      name: 're-edition 2005 saffiano leather bag-medium size bag',
      price: 1990,
      image: '/images/prada-bag.jpg',
      addedToCanvas: true
    },
    {
      id: 3,
      brand: 'Valentino',
      name: 'Small roman stud the handle bag in nappa',
      price: 3150,
      image: '/images/valentino-bag.jpg',
      addedToCanvas: false
    },
    {
      id: 4,
      brand: 'Balmain',
      name: 'Black calfskin and suede B-Bold low-top sneakers',
      price: 1100,
      image: '/images/balmain-sneakers.jpg',
      addedToCanvas: true
    },
    {
      id: 5,
      brand: 'Dior',
      name: 'Knitted Double-Breasted Bar Jacket With Stripes',
      price: 1980,
      image: '/images/dior-jacket.jpg',
      addedToCanvas: false
    },
    {
      id: 6,
      brand: 'Gucci',
      name: 'GG Supreme holdall',
      price: 2200,
      image: '/images/gucci-bag.jpg',
      addedToCanvas: false
    },
    {
      id: 7,
      brand: 'Valentino',
      name: 'Boat-neck sleeveless midi dress',
      price: 788,
      image: '/images/valentino-dress.jpg',
      addedToCanvas: false
    },
    {
      id: 8,
      brand: 'Alexander McQueen',
      name: 'Chunky sole Chelsea boots',
      price: 720,
      image: '/images/mcqueen-boots.jpg',
      addedToCanvas: false
    },
    {
      id: 9,
      brand: 'Balmain',
      name: 'Bootcut skinny jeans',
      price: 985,
      image: '/images/balmain-jeans.jpg',
      addedToCanvas: false
    }
  ]);

  const [notification, setNotification] = useState<Notification>({
    show: true,
    message: 'Your order #481293 will arrive soon!',
    link: 'View Shipping Details'
  });

  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'On Canvas' | 'Not On Canvas'>('All');
  const [animations, setAnimations] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Initialize animations on mount
    const initialAnimations: Record<number, boolean> = {};
    wishlistItems.forEach(item => {
      initialAnimations[item.id] = false;
    });
    setAnimations(initialAnimations);
  }, [wishlistItems]);

  const toggleAddToCanvas = (id: number) => {
    setAnimations(prev => ({...prev, [id]: true}));
    
    setTimeout(() => {
      setWishlistItems(prev =>
        prev.map(item => 
          item.id === id ? { ...item, addedToCanvas: !item.addedToCanvas } : item
        )
      );
      setAnimations(prev => ({...prev, [id]: false}));
    }, 300);
  };

  const removeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const removeFromWishlist = (id: number) => {
    setAnimations(prev => ({...prev, [id]: true}));
    
    setTimeout(() => {
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    }, 300);
  };

  const moveAllToCanvas = () => {
    setWishlistItems(prev =>
      prev.map(item => ({ ...item, addedToCanvas: true }))
    );
  };

  const filterItems = (filter: 'All' | 'On Canvas' | 'Not On Canvas') => {
    setActiveFilter(filter);
    setShowFilter(false);
  };

  const filteredItems = activeFilter === 'All' 
    ? wishlistItems 
    : activeFilter === 'On Canvas' 
      ? wishlistItems.filter(item => item.addedToCanvas)
      : wishlistItems.filter(item => !item.addedToCanvas);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Head>
        <title>Luxury Wishlist</title>
        <meta name="description" content="Your luxury fashion wishlist" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-3xl font-light tracking-wide text-gray-900">MY WISHLIST</h1>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="p-1 rounded-full hover:bg-gray-100 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistItems.filter(item => item.addedToCanvas).length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {notification.show && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-lg mb-8 flex justify-between items-center shadow-md transition-all duration-300 ease-in-out">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{notification.message}</span>
              <button className="ml-2 font-semibold underline hover:text-blue-100 transition-colors duration-150">
                {notification.link}
              </button>
            </div>
            <button 
              onClick={removeNotification} 
              className="text-white hover:text-blue-100 transition-colors duration-150"
              aria-label="Close notification"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-medium text-gray-900 mr-2">Wishlist</h2>
            <span className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)} 
                className="bg-white border border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 flex items-center gap-2 transition-all duration-150 shadow-sm hover:shadow"
                aria-expanded={showFilter}
                aria-haspopup="true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="font-medium">{activeFilter}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showFilter && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1">
                  <button 
                    onClick={() => filterItems('All')} 
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${activeFilter === 'All' ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => filterItems('On Canvas')} 
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${activeFilter === 'On Canvas' ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    On Canvas
                  </button>
                  <button 
                    onClick={() => filterItems('Not On Canvas')} 
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${activeFilter === 'Not On Canvas' ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    Not On Canvas
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={moveAllToCanvas}
              className="bg-black hover:bg-gray-900 text-white rounded-md px-4 py-2 flex items-center gap-2 transition-all duration-150 shadow-sm"
              disabled={wishlistItems.every(item => item.addedToCanvas)}
              aria-label="Move all items to canvas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Move all to Canvas</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 
                ${animations[item.id] ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} 
                hover:shadow-md group`}
              aria-label={`${item.brand} ${item.name}`}
            >
              <div className="relative aspect-square">
                <button 
                  onClick={() => removeFromWishlist(item.id)} 
                  className="absolute top-3 right-3 bg-white bg-opacity-80 rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100 z-10"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {item.discount && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded z-10">
                    {item.discount}
                  </div>
                )}
                
                <div className="w-full h-full bg-gray-50 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-400">[Product Image]</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-5 transition-opacity duration-300">
                    <button 
                      className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded shadow hover:bg-gray-100 transition-colors"
                      aria-label="Quick view"
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="font-medium text-gray-900">{item.brand}</div>
                <div className="text-sm text-gray-600 mt-1 line-clamp-2 h-10" title={item.name}>
                  {item.name}
                </div>
                <div className="mt-3 flex items-center">
                  <span className="font-semibold text-gray-900">${item.price.toLocaleString()}</span>
                  {item.originalPrice && (
                    <span className="text-gray-400 line-through text-sm ml-2">
                      ${item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => toggleAddToCanvas(item.id)}
                  className={`w-full mt-3 py-2.5 rounded-md flex items-center justify-center transition-all duration-200
                    ${item.addedToCanvas 
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300' 
                      : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  aria-label={item.addedToCanvas ? `Remove ${item.name} from canvas` : `Add ${item.name} to canvas`}
                >
                  {item.addedToCanvas ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Added to Canvas</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Add to Canvas</span>
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center mt-3">
                  <button 
                    className="text-sm text-gray-500 hover:text-gray-800 hover:underline transition-colors duration-150"
                    aria-label="Save for later"
                  >
                    Save for Later
                  </button>
                  <span className="text-gray-300 mx-2">|</span>
                  <button 
                    className="text-sm text-gray-500 hover:text-gray-800 hover:underline transition-colors duration-150"
                    aria-label="View similar items"
                  >
                    Similar Items
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {activeFilter === 'All' ? 'Your wishlist is empty.' : `No items matching the "${activeFilter}" filter.`}
            </p>
            {activeFilter !== 'All' && (
              <button 
                onClick={() => setActiveFilter('All')} 
                className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-150"
              >
                View all items
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}