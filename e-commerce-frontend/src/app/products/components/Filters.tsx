"use client";
import React, { useCallback, useState, useRef } from 'react';

const Filters: React.FC<{
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  selectedSizes: string[];
  onSizesSelected: (value: string[]) => void;
  selectedCategories: string[];
  onCategoriesSelected: (value: string[]) => void;
}> = ({
  priceRange,
  onPriceRangeChange,
  selectedSizes,
  onSizesSelected,
  selectedCategories,
  onCategoriesSelected
}) => {
    const sizes = [
      { id: '30x40', label: '11 ¾ x 15 ¾ in (30×40 cm)', count: 2 },
      { id: '40x50', label: '15 ¾ x 19 ¾ in (40×50 cm)', count: 2 },
      { id: '50x70', label: '19 ¾ x 27 ½ in (50×70 cm)', count: 1 },
      { id: '21x30', label: '8 ¼ x 11 ¾ in (21×30 cm)', count: 1 }
    ];

    const categories = [
      { id: 'abstract', label: 'Abstract', count: 3 },
      { id: 'landscape', label: 'Landscape', count: 2 },
      { id: 'portrait', label: 'Portrait', count: 2 },
      { id: 'modern', label: 'Modern', count: 2 },
      { id: 'vintage', label: 'Vintage', count: 1 }
    ];

    const handleCategoryChange = useCallback((categoryId: string) => {
      onCategoriesSelected(
        selectedCategories.includes(categoryId)
          ? selectedCategories.filter(id => id !== categoryId)
          : [...selectedCategories, categoryId]
      );
    }, [selectedCategories, onCategoriesSelected]);

    const handleSizeChange = useCallback((size: string) => {
      if (selectedSizes.includes(size)) {
        onSizesSelected(selectedSizes.filter(s => s !== size));
      } else {
        onSizesSelected([...selectedSizes, size]);
      }
    }, [selectedSizes, onSizesSelected]);

    const minPrice = 50;
    const maxPrice = 300;
    const range = maxPrice - minPrice;

    const [activeHandle, setActiveHandle] = useState<'left' | 'right' | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const handlePriceChange = useCallback((newMin: number, newMax: number) => {
      newMin = Math.min(newMin, priceRange[1]);
      newMax = Math.max(newMax, priceRange[0]);
      newMin = Math.max(minPrice, Math.min(maxPrice, newMin));
      newMax = Math.max(minPrice, Math.min(maxPrice, newMax));
      onPriceRangeChange([newMin, newMax]);
    }, [priceRange, minPrice, maxPrice, onPriceRangeChange]);

    const handleMouseDown = useCallback((handle: 'left' | 'right') => (e: React.MouseEvent) => {
      e.preventDefault();
      setActiveHandle(handle);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
      if (!activeHandle || !sliderRef.current) return;

      const sliderRect = sliderRef.current.getBoundingClientRect();
      const percentage = Math.min(Math.max(0, (e.clientX - sliderRect.left) / sliderRect.width * 100), 100);
      const value = Math.round((percentage / 100) * range + minPrice);

      if (activeHandle === 'left') {
        handlePriceChange(value, priceRange[1]);
      } else {
        handlePriceChange(priceRange[0], value);
      }
    }, [activeHandle, priceRange, range, minPrice, handlePriceChange]);

    const handleMouseUp = useCallback(() => {
      setActiveHandle(null);
    }, []);

    React.useEffect(() => {
      if (activeHandle) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [activeHandle, handleMouseMove, handleMouseUp]);

    const leftPosition = ((priceRange[0] - minPrice) / range) * 100;
    const rightPosition = ((priceRange[1] - minPrice) / range) * 100;

    return (
      <div className="bg-white rounded-lg p-6 sticky top-4 mb-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
        <h2 className="text-xl font-semibold mb-6 pb-3 border-b border-gray-200">Filters</h2>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Price Range</h3>
          <div className="relative h-2 mt-4 mb-6" ref={sliderRef}>
            <div className="absolute h-2 bg-gray-200 rounded-full w-full"></div>
            <div
              className="absolute h-2 bg-blue-500 rounded-full transition-all duration-200"
              style={{ left: `${leftPosition}%`, width: `${rightPosition - leftPosition}%` }}
            ></div>
            <div
              className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-y-1/2 top-1/2 transition-transform duration-200 hover:scale-110 hover:shadow-md"
              style={{ left: `${leftPosition}%` }}
              onMouseDown={handleMouseDown('left')}
            ></div>
            <div
              className="absolute w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-pointer transform -translate-y-1/2 top-1/2 transition-transform duration-200 hover:scale-110 hover:shadow-md"
              style={{ left: `${rightPosition}%` }}
              onMouseDown={handleMouseDown('right')}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="w-24 transition-all duration-200 hover:transform hover:scale-105">
              <label className="block text-xs text-gray-500 mb-1">Min Price</label>
              <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-md font-medium shadow-sm hover:shadow transition-shadow duration-200">
                ${priceRange[0]}
              </div>
            </div>
            <div className="w-24 transition-all duration-200 hover:transform hover:scale-105">
              <label className="block text-xs text-gray-500 mb-1">Max Price</label>
              <div className="bg-gray-50 border border-gray-300 px-3 py-2 rounded-md font-medium shadow-sm hover:shadow transition-shadow duration-200">
                ${priceRange[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Categories</h3>
          <div className="space-y-3">
            {categories.map(category => (
              <div
                key={category.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-102 ${
                  selectedCategories.includes(category.id)
                    ? 'border-blue-500 bg-blue-50 shadow-inner'
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
                onClick={() => handleCategoryChange(category.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded mr-3 border flex items-center justify-center transition-colors duration-200 ${
                      selectedCategories.includes(category.id) 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : 'border-gray-400'
                    }`}>
                      {selectedCategories.includes(category.id) && (
                        <svg className="w-3 h-3 text-white transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{category.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Size</h3>
          <div className="space-y-3">
            {sizes.map(size => (
              <div
                key={size.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-102 ${selectedSizes.includes(size.id)
                    ? 'border-blue-500 bg-blue-50 shadow-inner'
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-md'
                  }`}
                onClick={() => handleSizeChange(size.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded mr-3 border flex items-center justify-center transition-colors duration-200 ${
                      selectedSizes.includes(size.id) 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-gray-400'
                      }`}>
                      {selectedSizes.includes(size.id) && (
                        <svg className="w-3 h-3 text-white transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{size.label}</span>
                  </div>
                  <span className="text-xs text-gray-500">({size.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset Filters Button */}
        <button
          className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-50 hover:shadow-md transform hover:scale-102"
          onClick={() => {
            onPriceRangeChange([minPrice, maxPrice]);
            onSizesSelected([]);
            onCategoriesSelected([]);
          }}
        >
          Reset All Filters
        </button>
      </div>
    );
  };

export default Filters;