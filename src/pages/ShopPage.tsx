import React, { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { ProductCard } from '../components/products/ProductCard';
import { Gender, FragranceFamily } from '../types';
import { SlidersHorizontal, X, RotateCcw, Sparkles } from 'lucide-react';

interface ShopPageProps {
  genderFilter?: Gender;
  initialFilter?: 'new' | 'bestseller' | 'discount';
  navigate: (path: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  genderFilter,
  initialFilter,
  navigate,
}) => {
  const { products, settings } = useStore();

  // Filter States
  const [selectedGender, setSelectedGender] = useState<Gender | 'ALL'>(
    genderFilter || 'ALL'
  );
  const [selectedFamily, setSelectedFamily] = useState<FragranceFamily | 'ALL'>('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discountOnly, setDiscountOnly] = useState(initialFilter === 'discount');
  const [maxPrice, setMaxPrice] = useState<number>(1400);
  const [sortBy, setSortBy] = useState<string>(
    initialFilter === 'new'
      ? 'new'
      : initialFilter === 'bestseller'
      ? 'bestseller'
      : 'featured'
  );
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const families: FragranceFamily[] = [
    'Oriental',
    'Boisé',
    'Floral',
    'Gourmand',
    'Frais',
    'Ambré',
    'Cuiré',
  ];

  // Filtering Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.isActive);

    if (selectedGender !== 'ALL') {
      result = result.filter((p) => p.gender === selectedGender);
    }
    if (selectedFamily !== 'ALL') {
      result = result.filter((p) => p.fragranceFamily === selectedFamily);
    }
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }
    if (discountOnly) {
      result = result.filter((p) => p.discount && p.discount > 0);
    }
    result = result.filter((p) => p.price <= maxPrice);

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'bestseller') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    } else if (sortBy === 'new') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [products, selectedGender, selectedFamily, inStockOnly, discountOnly, maxPrice, sortBy]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handleResetFilters = () => {
    setSelectedGender('ALL');
    setSelectedFamily('ALL');
    setInStockOnly(false);
    setDiscountOnly(false);
    setMaxPrice(1400);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const getPageTitle = () => {
    if (selectedGender === 'HOMME') return 'Parfums Homme';
    if (selectedGender === 'FEMME') return 'Parfums Femme';
    if (selectedGender === 'UNISEXE') return 'Fragrances Unisexes';
    if (initialFilter === 'new') return 'Nouveautés & Extraits';
    if (initialFilter === 'bestseller') return 'Les Meilleurs Ventes';
    if (initialFilter === 'discount') return 'Offres Privilèges';
    return 'Toutes Les Créations';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D8B08C]">
          CATALOGUE DE HAUTE PARFUMERIE
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#F5F1EB] mt-1">
          {getPageTitle()}
        </h1>
        <p className="text-xs sm:text-sm text-[#A7A3A0] mt-2">
          Des extraits de parfum puissants et raffinés, composés d’ingrédients d’une pureté absolue.
        </p>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#25252D]">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#141418] border border-[#2B2B38] text-xs text-[#F5F1EB] rounded-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#D8B08C]" />
            <span>Filtres &amp; Tri</span>
          </button>
          <span className="text-xs text-[#A7A3A0] font-mono">
            {filteredProducts.length} fragrances
          </span>
        </div>

        {/* Sidebar Filters (Desktop & Mobile Modal) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen
              ? 'fixed inset-0 z-50 bg-[#0E0E12] p-6 overflow-y-auto block'
              : 'hidden'
          }`}
        >
          {mobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#22222A] lg:hidden">
              <h3 className="font-serif text-lg text-[#F5F1EB]">Filtres</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-[#A7A3A0] hover:text-[#F5F1EB] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-6 bg-[#121216] border border-[#22222A] p-5 rounded-sm">
            {/* Header / Reset */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1E26]">
              <span className="text-xs uppercase tracking-[0.15em] font-semibold text-[#F5F1EB]">
                Filtrer
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-[#D8B08C] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Genre / Univers */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] font-medium block mb-2">
                Univers
              </label>
              <div className="flex flex-col gap-1.5 text-xs">
                {[
                  { label: 'Tous les parfums', val: 'ALL' },
                  { label: 'Homme', val: 'HOMME' },
                  { label: 'Femme', val: 'FEMME' },
                  { label: 'Unisexe', val: 'UNISEXE' },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => {
                      setSelectedGender(item.val as any);
                      setCurrentPage(1);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-sm transition-colors ${
                      selectedGender === item.val
                        ? 'bg-[#1D1D26] text-[#D8B08C] font-semibold border-l-2 border-[#D8B08C]'
                        : 'text-[#A7A3A0] hover:text-[#F5F1EB] hover:bg-[#16161C]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Famille Olfactive */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-[#A7A3A0] font-medium block mb-2">
                Famille Olfactive
              </label>
              <div className="flex flex-col gap-1 text-xs">
                <button
                  onClick={() => {
                    setSelectedFamily('ALL');
                    setCurrentPage(1);
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-sm transition-colors ${
                    selectedFamily === 'ALL'
                      ? 'bg-[#1D1D26] text-[#D8B08C] font-semibold'
                      : 'text-[#A7A3A0] hover:text-[#F5F1EB]'
                  }`}
                >
                  Toutes les familles
                </button>
                {families.map((fam) => (
                  <button
                    key={fam}
                    onClick={() => {
                      setSelectedFamily(fam);
                      setCurrentPage(1);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-sm transition-colors ${
                      selectedFamily === fam
                        ? 'bg-[#1D1D26] text-[#D8B08C] font-semibold border-l-2 border-[#D8B08C]'
                        : 'text-[#A7A3A0] hover:text-[#F5F1EB]'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#A7A3A0] mb-2">
                <span>Prix Maximum</span>
                <span className="font-mono text-[#D8B08C] font-semibold">
                  {maxPrice} {settings.currency}
                </span>
              </div>
              <input
                type="range"
                min="400"
                max="1400"
                step="20"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#D8B08C] bg-[#22222A]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#666] mt-1">
                <span>400 DH</span>
                <span>1 400 DH</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#1E1E26]">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A7A3A0] hover:text-[#F5F1EB]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded-sm bg-[#1A1A22] border-[#2F2F3D] text-[#D8B08C] focus:ring-0"
                />
                <span>En stock uniquement</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A7A3A0] hover:text-[#F5F1EB]">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => {
                    setDiscountOnly(e.target.checked);
                    setCurrentPage(1);
                  }}
                  className="rounded-sm bg-[#1A1A22] border-[#2F2F3D] text-[#D8B08C] focus:ring-0"
                />
                <span>En promotion</span>
              </label>
            </div>

            {mobileFilterOpen && (
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#D8B08C] to-[#C9A46C] text-[#0B0B0D] font-semibold text-xs uppercase tracking-widest rounded-sm"
              >
                Afficher {filteredProducts.length} résultats
              </button>
            )}
          </div>
        </aside>

        {/* Catalog Main Content */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar Sort & Count */}
          <div className="flex items-center justify-between pb-4 border-b border-[#22222A]">
            <p className="text-xs text-[#A7A3A0]">
              Affichage de <span className="font-mono text-[#F5F1EB]">{filteredProducts.length}</span> fragrances d’exception
            </p>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#A7A3A0] hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#121216] border border-[#2B2B38] text-xs text-[#F5F1EB] px-3 py-1.5 rounded-sm focus:outline-none focus:border-[#D8B08C]"
              >
                <option value="featured">Sélection signature</option>
                <option value="new">Nouveautés</option>
                <option value="bestseller">Meilleures ventes</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty State */}
          {products.length === 0 ? (
            <div className="py-20 text-center bg-[#111115] border border-[#22222A] rounded-sm p-10 space-y-4">
              <div className="w-12 h-12 rounded-full border border-[#D8B08C]/40 bg-[#1A1A22] text-[#D8B08C] flex items-center justify-center mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl text-[#F5F1EB]">
                Collection en cours de préparation
              </h3>
              <p className="text-sm text-[#A7A3A0] max-w-md mx-auto font-light leading-relaxed">
                Nos artisans parfumeurs assemblent actuellement les nouvelles créations olfactives. Le catalogue sera disponible très prochainement.
              </p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-20 text-center bg-[#111115] border border-[#22222A] rounded-sm p-8">
              <h3 className="font-serif text-xl text-[#F5F1EB]">Aucun parfum ne correspond à vos critères</h3>
              <p className="text-xs text-[#A7A3A0] max-w-md mx-auto mt-2 leading-relaxed">
                Modifiez vos filtres ou réinitialisez la recherche pour découvrir toutes les fragrances de la Maison Metanoïa.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-[#1A1A22] border border-[#D8B08C]/40 text-[#D8B08C] text-xs uppercase tracking-widest rounded-sm hover:border-[#D8B08C] transition-all"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={navigate} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-[#121216] border border-[#2A2A33] text-xs text-[#A7A3A0] disabled:opacity-40 rounded-sm hover:text-[#F5F1EB]"
              >
                Précédent
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-sm text-xs font-mono transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#D8B08C] text-[#0B0B0D] font-bold'
                        : 'bg-[#121216] border border-[#2A2A33] text-[#A7A3A0] hover:text-[#F5F1EB]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-[#121216] border border-[#2A2A33] text-xs text-[#A7A3A0] disabled:opacity-40 rounded-sm hover:text-[#F5F1EB]"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
