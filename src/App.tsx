import { useState } from 'react'

interface Material {
  name: string
  sizes: number[]
  selected: { [key: number]: number }
}

function App() {
  // Load initial state from localStorage or use default
  const getInitialMaterials = (): Material[] => {
    const saved = localStorage.getItem('death-stranding-materials')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all materials have the correct structure
        return [
          {
            name: 'Ceramics',
            sizes: [40, 80, 160, 320, 480, 640, 800],
            selected: parsed[0]?.selected || {}
          },
          {
            name: 'Chemicals',
            sizes: [30, 60, 120, 240, 360, 480, 600],
            selected: parsed[1]?.selected || {}
          },
          {
            name: 'Metals',
            sizes: [50, 100, 200, 400, 600, 800, 1000],
            selected: parsed[2]?.selected || {}
          },
          {
            name: 'Resins',
            sizes: [40, 80, 160, 320, 480, 640, 800],
            selected: parsed[3]?.selected || {}
          },
          {
            name: 'Special Alloys',
            sizes: [60, 120, 240, 480, 720, 960, 1200],
            selected: parsed[4]?.selected || {}
          }
        ]
      } catch (error) {
        console.error('Failed to parse saved materials:', error)
      }
    }

    // Default state if no saved data
    return [
      {
        name: 'Ceramics',
        sizes: [40, 80, 160, 320, 480, 640, 800],
        selected: {}
      },
      {
        name: 'Chemicals',
        sizes: [30, 60, 120, 240, 360, 480, 600],
        selected: {}
      },
      {
        name: 'Metals',
        sizes: [50, 100, 200, 400, 600, 800, 1000],
        selected: {}
      },
      {
        name: 'Resins',
        sizes: [40, 80, 160, 320, 480, 640, 800],
        selected: {}
      },
      {
        name: 'Special Alloys',
        sizes: [60, 120, 240, 480, 720, 960, 1200],
        selected: {}
      }
    ]
  }

  const [materials, setMaterials] = useState<Material[]>(getInitialMaterials)

  // Save materials to localStorage whenever they change
  const saveMaterials = (newMaterials: Material[]) => {
    try {
      localStorage.setItem('death-stranding-materials', JSON.stringify(newMaterials))
    } catch (error) {
      console.error('Failed to save materials to localStorage:', error)
    }
  }

  const addMaterial = (materialIndex: number, size: number) => {
    // Update materials state to show count
    setMaterials(prev => {
      const newMaterials = [...prev]
      const material = { ...newMaterials[materialIndex] }
      const selected = { ...material.selected }

      selected[size] = (selected[size] || 0) + 1

      material.selected = selected
      newMaterials[materialIndex] = material

      // Save to localStorage
      saveMaterials(newMaterials)

      return newMaterials
    })
  }

  const getTotalForMaterial = (material: Material) => {
    return Object.entries(material.selected).reduce((total, [size, count]) => {
      return total + parseInt(size) * count
    }, 0)
  }

  const getTotalForAllMaterials = () => {
    return materials.reduce((total, material) => {
      return total + getTotalForMaterial(material)
    }, 0)
  }

  const removeWeight = (materialIndex: number, size: number) => {
    setMaterials(prev => {
      const newMaterials = [...prev]
      const material = { ...newMaterials[materialIndex] }
      const selected = { ...material.selected }

      if (selected[size]) {
        if (selected[size] === 1) {
          delete selected[size]
        } else {
          selected[size] = selected[size] - 1
        }
      }

      material.selected = selected
      newMaterials[materialIndex] = material

      // Save to localStorage
      saveMaterials(newMaterials)

      return newMaterials
    })
  }

  const resetMaterials = () => {
    const resetMaterials: Material[] = [
      {
        name: 'Ceramics',
        sizes: [40, 80, 160, 320, 480, 640, 800],
        selected: {}
      },
      {
        name: 'Chemicals',
        sizes: [30, 60, 120, 240, 360, 480, 600],
        selected: {}
      },
      {
        name: 'Metals',
        sizes: [50, 100, 200, 400, 600, 800, 1000],
        selected: {}
      },
      {
        name: 'Resins',
        sizes: [40, 80, 160, 320, 480, 640, 800],
        selected: {}
      },
      {
        name: 'Special Alloys',
        sizes: [60, 120, 240, 480, 720, 960, 1200],
        selected: {}
      }
    ]

    setMaterials(resetMaterials)
    localStorage.removeItem('death-stranding-materials')
  }

  return (
    <div className="min-h-screen bg-ds-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ds-blue ds-text-glow mb-2">Death Stranding Materials Tracker</h1>
          <p className="text-ds-cyan text-lg">Track your materials for the journey ahead</p>
        </div>

        {/* Materials Grid */}
        <div className="space-y-6">
          {materials.map((material, materialIndex) => (
            <div key={material.name} className="ds-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2 className="text-xl font-semibold text-white mb-2 sm:mb-0">{material.name}</h2>
                <div className="flex items-center space-x-4">
                  {/* Selection Summary */}
                  {Object.keys(material.selected).length > 0 && (
                    <div className="flex flex-wrap gap-1 text-sm">
                      {Object.entries(material.selected).map(([size, count]) => (
                        <button
                          key={size}
                          onClick={() => removeWeight(materialIndex, parseInt(size))}
                          className="text-ds-green hover:text-ds-red transition-colors duration-200 cursor-pointer"
                        >
                          {count > 1 ? `${count} x ${size}` : size}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-ds-orange font-semibold">Total: {getTotalForMaterial(material)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {material.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => addMaterial(materialIndex, size)}
                    className="ds-button hover:bg-ds-blue hover:border-ds-blue transition-all duration-200"
                  >
                    {size}
                    {material.selected[size] && material.selected[size] > 0 && (
                      <span className="ml-1 text-xs">({material.selected[size]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total Section */}
        <div className="ds-card mt-8 text-center">
          <h3 className="text-2xl font-bold text-ds-green mb-2">Total Materials: {getTotalForAllMaterials()}</h3>
          <p className="text-ds-cyan text-sm">Keep on keeping on, Sam</p>
        </div>

        {/* Reset Button */}
        <div className="text-center mt-6">
          <button
            onClick={resetMaterials}
            className="bg-ds-red border border-ds-red text-white px-6 py-3 rounded-lg 
                     hover:bg-red-700 hover:border-red-700 transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-ds-red focus:ring-opacity-50"
          >
            Reset All Materials
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
