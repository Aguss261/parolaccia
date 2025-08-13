"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomBar } from "@/components/bottom-bar"
import { ChatWidget } from "@/components/chat-widget"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MenuCategory, type Category } from "@/components/menu-category"

// Local type definitions to ensure proper TypeScript resolution
type MenuItem = { sku: string; name: string; price: number }
type LocalCategory = { id: string; name: string; items: MenuItem[] }
type MenuJSON = { currency: string; categories: LocalCategory[] }

// Interface for API product data
interface ApiProduct {
  categoria?: string;
  categoryId?: string;
  categoryName?: string;
  nombreCategoria?: string;
  sku?: string;
  id?: string;
  name?: string;
  nombre?: string;
  price?: number;
  precio?: number;
}

// Interface for API response
interface ApiResponse {
  currency?: string;
  categories?: Category[];
  productos?: ApiProduct[];
}

// Function to transform API response to expected format if needed
const transformApiResponse = (data: unknown): MenuJSON => {
  // If the API response already matches the expected format, return as is
  const apiData = data as ApiResponse;
  if (apiData && apiData.currency && Array.isArray(apiData.categories)) {
    return apiData as MenuJSON
  }
  
  // If the API response is just an array of products, transform it
  if (Array.isArray(data)) {
    // Group products by category
    const categoriesMap: Record<string, LocalCategory> = {}
    
    (data as ApiProduct[]).forEach((product: ApiProduct) => {
      // Usar el campo categoria de la API y asegurarse de que sea consistente
      const categoryId = String(product.categoria || product.categoryId || 'Otros')
      
      // Formatear el nombre de la categoría para mostrar (primera letra mayúscula, resto minúsculas)
      let categoryName = String(product.categoria || product.categoryName || product.nombreCategoria || 'Otros')
      
      // Convertir el nombre de la categoría a un formato más legible (primera letra mayúscula, resto minúsculas)
      if (categoryName === categoryName.toUpperCase()) {
        categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
      }
      
      // Reemplazar guiones por espacios para categorías como "PASTA-RIPIENA"
      categoryName = categoryName.replace(/-/g, ' ')
      
      if (!categoriesMap[categoryId]) {
        categoriesMap[categoryId] = {
          id: categoryId,
          name: categoryName,
          items: []
        }
      }
      
      const category = categoriesMap[categoryId]!
      category.items.push({
        sku: String(product.sku || product.id || `PROD-${Date.now()}`),
        name: String(product.name || product.nombre || 'Producto sin nombre'),
        price: Number(product.price || product.precio || 0)
      })
    })
    
    return {
      currency: 'ARS',
      categories: Object.values(categoriesMap)
    }
  }
  
  // If the API response has a different structure, try to adapt
  if (apiData && apiData.productos) {
    return transformApiResponse(apiData.productos)
  }
  
  // Fallback: return empty menu
  return {
    currency: 'ARS',
    categories: []
  }
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuJSON | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Removed unused variable to fix eslint error

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Use the current origin to ensure the request goes to the correct Next.js server
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const response = await fetch(`${baseUrl}/api/productos`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Raw Response:', data)
        
        // Log raw data for debugging
        console.log('Raw API data:', data)
        
        // Mostrar un ejemplo del primer producto para depuración
        if (Array.isArray(data) && data.length > 0) {
          console.log('First Product Example:', data[0])
        }
        
        const transformedMenu = transformApiResponse(data)
        setMenu(transformedMenu)
        
      } catch (error) {
        console.error("Error fetching products from API:", error)
        setError("Error al cargar los productos. Intentando cargar menú local...")
        
        // Fallback to local menu.json if API fails
        try {
          const fallbackResponse = await fetch("/menu.json")
          const fallbackData = await fallbackResponse.json()
          setMenu(fallbackData)
        } catch (fallbackError) {
          console.error("Error loading fallback menu:", fallbackError)
          setError("No se pudieron cargar los productos")
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-md mx-auto p-4 pt-20 pb-32">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Cargando menú...</p>
          </div>
        ) : error ? (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        ) : menu ? (
          <Accordion type="single" collapsible defaultValue={menu.categories[0]?.id}>
            {menu.categories.map((cat) => (
              <AccordionItem key={cat.id} value={cat.id} className="border-b-[#eadfbf] dark:border-b-neutral-800">
                <AccordionTrigger className="text-base">
                  <span className="font-[family-name:var(--font-display)] bg-gradient-to-r from-[#7a1c1c] to-[#d4af37] bg-clip-text text-transparent">
                    {cat.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="py-2">
                    <MenuCategory category={cat as Category} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : null}
        {menu && menu.categories.length === 0 && !loading && (
          <p className="text-sm text-neutral-500">No se encontraron productos en la API.</p>
        )}
      </main>
      <BottomBar />
      <ChatWidget />
    </div>
  )
}
