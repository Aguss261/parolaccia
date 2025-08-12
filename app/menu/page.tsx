"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { BottomBar } from "@/components/bottom-bar"
import { ChatWidget } from "@/components/chat-widget"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MenuCategory, type Category } from "@/components/menu-category"

type MenuJSON = { currency: string; categories: Category[] }

// Function to transform API response to expected format if needed
function transformApiResponse(data: any): MenuJSON {
  // If the API response already matches the expected format, return as is
  if (data && data.currency && Array.isArray(data.categories)) {
    return data as MenuJSON
  }
  
  // If the API response is just an array of products, transform it
  if (Array.isArray(data)) {
    // Group products by category
    const categoriesMap = new Map<string, Category>()
    
    data.forEach((product: any) => {
      // Usar el campo categoria de la API y asegurarse de que sea consistente
      const categoryId = product.categoria || product.categoryId || 'Otros'
      
      // Formatear el nombre de la categoría para mostrar (primera letra mayúscula, resto minúsculas)
      let categoryName = product.categoria || product.categoryName || product.nombreCategoria || 'Otros'
      
      // Convertir el nombre de la categoría a un formato más legible (primera letra mayúscula, resto minúsculas)
      if (categoryName === categoryName.toUpperCase()) {
        categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
      }
      
      // Reemplazar guiones por espacios para categorías como "PASTA-RIPIENA"
      categoryName = categoryName.replace(/-/g, ' ')
      
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          items: []
        })
      }
      
      const category = categoriesMap.get(categoryId)!
      category.items.push({
        sku: product.sku || product.id || `PROD-${Date.now()}`,
        name: product.name || product.nombre || 'Producto sin nombre',
        price: product.price || product.precio || 0
      })
    })
    
    return {
      currency: 'ARS',
      categories: Array.from(categoriesMap.values())
    }
  }
  
  // If the API response has a different structure, try to adapt
  if (data && data.productos) {
    return transformApiResponse(data.productos)
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
  const [rawApiData, setRawApiData] = useState<any>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch("/api/productos")
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Raw Response:', data)
        
        // Guardar los datos crudos para mostrarlos en la interfaz
        setRawApiData(data)
        
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
                    <MenuCategory category={cat} />
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
