import { useState } from 'react'

interface Material {
  name: string
  sizes: number[]
  selected: { [key: number]: number }
}

function App() {
  const [materials, setMaterials] = useState<Material[]>([
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
  ])

  const toggleMaterial = (materialIndex: number, size: number) => {
    setMaterials(prev => {
      const newMaterials = [...prev]
      const material = { ...newMaterials[materialIndex] }
      const selected = { ...material.selected }

      if (selected[size]) {
        // Decrease count or remove if count is 1
        if (selected[size] === 1) {
          delete selected[size]
        } else {
          selected[size] = selected[size] - 1
        }
      } else {
        // Add new selection
        selected[size] = 1
      }

      material.selected = selected
      newMaterials[materialIndex] = material
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

  const formatSelection = (material: Material) => {
    const entries = Object.entries(material.selected)
    if (entries.length === 0) return ''

    return entries
      .map(([size, count]) => {
        return count > 1 ? `${count} x ${size}` : size
      })
      .join(' + ')
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
                  {Object.keys(material.selected).length > 0 && (
                    <span className="text-ds-green text-sm">{formatSelection(material)}</span>
                  )}
                  <span className="text-ds-orange font-semibold">Total: {getTotalForMaterial(material)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {material.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleMaterial(materialIndex, size)}
                    className={`ds-button ${material.selected[size] ? 'ds-button-active' : ''}`}
                  >
                    {size}
                    {material.selected[size] && material.selected[size] > 1 && (
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
      </div>
    </div>
  )
}

export default App
