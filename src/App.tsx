import { useState } from 'react'

interface Material {
  name: string
  sizes: number[]
  selected: { [key: number]: number }
  submittedValues: number[]
}

// Single source of truth for materials configuration
const MATERIALS_CONFIG = [
  {
    name: 'Ceramics',
    sizes: [40, 80, 160, 320, 480, 640, 800]
  },
  {
    name: 'Chemicals',
    sizes: [30, 60, 120, 240, 360, 480, 600]
  },
  {
    name: 'Metals',
    sizes: [50, 100, 200, 400, 600, 800, 1000]
  },
  {
    name: 'Resins',
    sizes: [40, 80, 160, 320, 480, 640, 800]
  },
  {
    name: 'Special Alloys',
    sizes: [60, 120, 240, 480, 720, 960, 1200]
  }
]

function App() {
  // Load initial state from localStorage or use default
  const getInitialMaterials = (): Material[] => {
    const saved = localStorage.getItem('death-stranding-materials')

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all materials have the correct structure
        return MATERIALS_CONFIG.map((config, index) => ({
          name: config.name,
          sizes: config.sizes,
          selected: parsed[index]?.selected || {},
          submittedValues: parsed[index]?.submittedValues || []
        }))
      } catch (error) {
        console.error('Failed to parse saved materials:', error)
      }
    }

    // Default state if no saved data
    return MATERIALS_CONFIG.map(config => ({
      name: config.name,
      sizes: config.sizes,
      selected: {},
      submittedValues: []
    }))
  }

  const [materials, setMaterials] = useState<Material[]>(getInitialMaterials)
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})

  // Save materials to localStorage whenever they change
  const saveMaterials = (newMaterials: Material[]) => {
    try {
      localStorage.setItem('death-stranding-materials', JSON.stringify(newMaterials))
    } catch (error) {
      console.error('Failed to save materials to localStorage:', error)
    }
  }

  const calculateRecommendedSizes = (targetValue: number, sizes: number[]): { [key: number]: number } => {
    const sortedSizes = [...sizes].sort((a, b) => b - a) // Sort descending
    let remaining = targetValue
    const result: { [key: number]: number } = {}

    for (const size of sortedSizes) {
      if (remaining >= size) {
        const count = Math.floor(remaining / size)
        result[size] = count
        remaining -= count * size
      }
    }

    // If we still have remaining value, add the smallest size to get above target
    if (remaining > 0) {
      const smallestSize = Math.min(...sizes)
      result[smallestSize] = (result[smallestSize] || 0) + 1
    }

    return result
  }

  const submitValue = (materialIndex: number) => {
    const material = materials[materialIndex]
    const inputValue = inputValues[material.name]

    if (!inputValue || isNaN(Number(inputValue)) || Number(inputValue) <= 0) return

    const value = Number(inputValue)

    setMaterials(prev => {
      const newMaterials = [...prev]
      const updatedMaterial = { ...newMaterials[materialIndex] }

      // Add to submitted values
      updatedMaterial.submittedValues = [...updatedMaterial.submittedValues, value]

      // Calculate recommended sizes for the new total
      const totalSubmitted = updatedMaterial.submittedValues.reduce((sum, val) => sum + val, 0)
      updatedMaterial.selected = calculateRecommendedSizes(totalSubmitted, material.sizes)

      newMaterials[materialIndex] = updatedMaterial
      saveMaterials(newMaterials)
      return newMaterials
    })

    // Clear the input
    setInputValues(prev => ({ ...prev, [material.name]: '' }))
  }

  const removeSubmittedValue = (materialIndex: number, valueIndex: number) => {
    setMaterials(prev => {
      const newMaterials = [...prev]
      const updatedMaterial = { ...newMaterials[materialIndex] }

      // Remove the value
      updatedMaterial.submittedValues = updatedMaterial.submittedValues.filter((_, index) => index !== valueIndex)

      // Recalculate recommended sizes
      const totalSubmitted = updatedMaterial.submittedValues.reduce((sum, val) => sum + val, 0)
      updatedMaterial.selected = calculateRecommendedSizes(totalSubmitted, updatedMaterial.sizes)

      newMaterials[materialIndex] = updatedMaterial
      saveMaterials(newMaterials)
      return newMaterials
    })
  }

  const getTotalForMaterial = (material: Material) => {
    return Object.entries(material.selected).reduce((total, [size, count]) => {
      return total + parseInt(size) * count
    }, 0)
  }

  const resetMaterials = () => {
    const resetMaterials: Material[] = MATERIALS_CONFIG.map(config => ({
      name: config.name,
      sizes: config.sizes,
      selected: {},
      submittedValues: []
    }))

    setMaterials(resetMaterials)
    setInputValues({})
    localStorage.removeItem('death-stranding-materials')
  }

  return (
    <div className="min-h-screen bg-ds-dark p-2 sm:p-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
        {/* Materials Grid */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {materials.map((material, materialIndex) => (
            <div key={material.name} className="ds-card p-3 sm:p-4 flex flex-col gap-3">
              {/* Name and Total */}
              <div className="flex flex-row items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-white">{material.name}</h2>

                <span className="text-ds-orange font-semibold text-sm sm:text-base">
                  Total: {getTotalForMaterial(material)}
                  {(() => {
                    const requested = material.submittedValues.reduce((sum, val) => sum + val, 0)
                    const provided = getTotalForMaterial(material)
                    const surplus = provided - requested
                    return surplus > 0 ? ` (${surplus})` : ''
                  })()}
                </span>
              </div>

              {/* Input Field */}
              <div className="flex gap-2">
                <input
                  type="number"
                  value={inputValues[material.name] || ''}
                  onChange={e => setInputValues(prev => ({ ...prev, [material.name]: e.target.value }))}
                  placeholder="Enter value..."
                  className="min-w-0 flex-1 bg-ds-gray border border-ds-light-gray text-white px-3 py-2 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-ds-blue focus:ring-opacity-50"
                  onKeyDown={e => e.key === 'Enter' && submitValue(materialIndex)}
                />

                <button
                  onClick={() => submitValue(materialIndex)}
                  className="bg-ds-blue border border-ds-blue text-white px-4 py-2 rounded-lg 
                           hover:bg-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ds-blue focus:ring-opacity-50"
                >
                  Submit
                </button>
              </div>

              {/* Submitted Values */}
              {material.submittedValues.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {material.submittedValues.map((value, index) => (
                    <div key={index} className="flex items-center">
                      <button
                        onClick={() => removeSubmittedValue(materialIndex, index)}
                        className="bg-ds-green text-black px-2 py-1 rounded text-sm hover:bg-green-400 transition-colors duration-200"
                      >
                        {value}
                      </button>
                      {index < material.submittedValues.length - 1 && <span className="text-ds-green mx-1">+</span>}
                    </div>
                  ))}

                  <span className="text-ds-cyan ml-2">
                    = {material.submittedValues.reduce((sum, val) => sum + val, 0)}
                  </span>
                </div>
              )}

              {/* Recommended Sizes */}
              {Object.keys(material.selected).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(material.selected).map(([size, count]) => (
                    <span key={size} className="bg-ds-orange text-black px-2 py-1 rounded text-sm">
                      {count} x {size}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="text-center">
          <button
            onClick={resetMaterials}
            className="bg-ds-red border border-ds-red text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg 
                     hover:bg-red-700 hover:border-red-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-ds-red focus:ring-opacity-50 text-sm sm:text-base"
          >
            Reset All Materials
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
