import { useEffect, useMemo, useState } from 'react'

function StarRating({ value = 0 }) {
  const full = Math.round(value)
  return (
    <div className="flex items-center gap-1 text-amber-500 text-sm" aria-label={`Rated ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < full ? 'currentColor' : 'none'} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.2 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.987 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557L3.05 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.116-5.111z" />
        </svg>
      ))}
    </div>
  )
}

function ProductCard({ item, onAdd }) {
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
        {item.image ? (
          <img src={item.image} alt={item.title} className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      <div className="mt-3 space-y-2">
        <h3 className="line-clamp-2 font-medium text-gray-800">{item.title}</h3>
        <StarRating value={item.rating || 4} />
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">₹{Number(item.price).toFixed(2)}</span>
          <button onClick={() => onAdd(item)} className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">Add to Cart</button>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4">
      <div className="aspect-square w-full rounded-lg bg-gray-100" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-100 rounded" />
        <div className="h-4 w-1/2 bg-gray-100 rounded" />
        <div className="h-8 w-full bg-gray-100 rounded" />
      </div>
    </div>
  )
}

export default function App() {
  const baseUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${baseUrl}/categories`)
        const data = await res.json()
        setCategories(data.items || [])
      } catch (e) {
        setCategories([])
      }
    }
    fetchCategories()
  }, [baseUrl])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        if (query) params.append('q', query)
        const res = await fetch(`${baseUrl}/products?${params.toString()}`, { signal: controller.signal })
        const data = await res.json()
        setItems(data.items || [])
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [baseUrl, category, query])

  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.id === item.id)
      if (exists) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p))
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <a href="/" className="text-2xl font-black tracking-tight text-blue-600">VibeKart</a>
          <div className="flex-1">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and more"
                className="w-full pl-4 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>
          <button className="relative inline-flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 text-xs bg-white text-blue-700 border border-blue-600 rounded-full px-2 py-0.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Filters */}
        <aside className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              <button onClick={() => setCategory('')} className={`block w-full text-left px-3 py-2 rounded-md border ${category === '' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>All</button>
              {categories.map((c) => (
                <button key={c.id || c.slug} onClick={() => setCategory(c.slug)} className={`block w-full text-left px-3 py-2 rounded-md border ${category === c.slug ? 'bg-blue-50 text-blue-700 border-blue-200' : 'border-gray-200 hover:bg-gray-50'}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <h3 className="font-semibold mb-2">Price</h3>
            <p className="text-sm text-gray-500">Use search to find what you need.</p>
          </div>
        </aside>

        {/* Products */}
        <section className="md:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-600">No products found.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <ProductCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} VibeKart — A simple demo store</footer>
    </div>
  )
}
