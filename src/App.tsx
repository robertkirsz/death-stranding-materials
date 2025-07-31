import { useState, useEffect, useRef } from 'react'
import pkg from '../package.json'
import ErrorTest from './ErrorTest'

const APP_VERSION = pkg.version

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
    sizes: [40, 80, 160, 320]
    // sizes: [40, 80, 160, 320, 480, 640, 800]
  },
  {
    name: 'Chemicals',
    sizes: [30, 60, 120, 240]
    // sizes: [30, 60, 120, 240, 360, 480, 600]
  },
  {
    name: 'Metals',
    sizes: [50, 100, 200, 400]
    // sizes: [50, 100, 200, 400, 600, 800, 1000]
  },
  {
    name: 'Resins',
    sizes: [40, 80, 160, 320]
    // sizes: [40, 80, 160, 320, 480, 640, 800]
  },
  {
    name: 'Special Alloys',
    sizes: [60, 120, 240, 480]
    // sizes: [60, 120, 240, 480, 720, 960, 1200]
  }
]

function App() {
  // Load initial state from localStorage or use default
  const getInitialMaterials = (): Material[] => {
    try {
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
          // Clear corrupted data
          localStorage.removeItem('death-stranding-materials')
        }
      }
    } catch (error) {
      console.error('localStorage is not available:', error)
    }

    // Default state if no saved data or error occurred
    return MATERIALS_CONFIG.map(config => ({
      name: config.name,
      sizes: config.sizes,
      selected: {},
      submittedValues: []
    }))
  }

  const [materials, setMaterials] = useState<Material[]>(getInitialMaterials)
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showErrorTest, setShowErrorTest] = useState<string | false>(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Handle initialization errors
  useEffect(() => {
    try {
      // Test if the app can access localStorage
      localStorage.setItem('app-test', 'test')
      localStorage.removeItem('app-test')
    } catch (error) {
      console.error('localStorage is not available during initialization:', error)
    }
  }, [])

  // Handle click outside to close settings menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isSettingsOpen &&
        settingsRef.current &&
        event.target instanceof Node &&
        !settingsRef.current.contains(event.target)
      ) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isSettingsOpen])

  // Save materials to localStorage whenever they change
  const saveMaterials = (newMaterials: Material[]) => {
    try {
      localStorage.setItem('death-stranding-materials', JSON.stringify(newMaterials))
    } catch (error) {
      console.error('Failed to save materials to localStorage:', error)
      // If localStorage fails, we can't save but the app should still work
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
      <div className="fixed bottom-1 left-1 text-xs text-slate-400 z-50 pointer-events-none">v{APP_VERSION}</div>

      {/* Settings Button */}
      <div className="fixed top-2 right-2 z-50" ref={settingsRef}>
        <button
          id="settings-button"
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="bg-ds-gray border border-ds-light-gray text-white p-2 sm:p-3 rounded-lg 
                   opacity-60 hover:opacity-100 hover:bg-ds-light-gray hover:border-ds-blue
                   transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ds-blue focus:ring-opacity-50
                   flex items-center justify-center"
          aria-label="Settings"
          aria-expanded={isSettingsOpen}
          aria-haspopup="menu"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Settings Dropdown Menu */}
        {isSettingsOpen && (
          <div
            role="menu"
            aria-labelledby="settings-button"
            className="absolute right-0 top-full mt-2 w-48 sm:w-56 bg-ds-gray border border-ds-light-gray rounded-lg shadow-lg py-2 z-50"
          >
            <button
              role="menuitem"
              onClick={() => {
                resetMaterials()
                setIsSettingsOpen(false)
              }}
              className="w-full text-left px-4 py-3 text-white hover:bg-ds-light-gray transition-colors duration-200
                       flex items-center gap-3 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-ds-red"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-ds-red">Reset All Materials</span>
            </button>

            <button
              role="menuitem"
              onClick={() => {
                setShowErrorTest('test')
                setIsSettingsOpen(false)
              }}
              className="w-full text-left px-4 py-3 text-white hover:bg-ds-light-gray transition-colors duration-200
                       flex items-center gap-3 text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-ds-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-ds-orange">Test ErrorBoundary</span>
            </button>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
        {/* Error Boundary Test */}
        {showErrorTest === 'test' && <ErrorTest />}

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
      </div>
    </div>
  )
}

export default App
