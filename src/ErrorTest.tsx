import { useState } from 'react'

const ErrorTest = () => {
  const [errorType, setErrorType] = useState<string>('')

  const throwError = (type: string) => {
    setErrorType(type)

    switch (type) {
      case 'syntax':
        throw new SyntaxError('Test syntax error')
      case 'reference':
        throw new ReferenceError('Test reference error')
      case 'type':
        throw new TypeError('Test type error')
      case 'range':
        throw new RangeError('Test range error')
      case 'custom':
        throw new Error('Test custom error')
      default:
        throw new Error('Unknown error type')
    }
  }

  return (
    <div className="ds-card p-4">
      <h2 className="text-xl font-semibold text-white mb-4">ErrorBoundary Test Suite</h2>
      <p className="text-ds-cyan mb-4">
        Test different types of errors to verify the ErrorBoundary catches them properly.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => throwError('syntax')}
          className="bg-ds-red border border-ds-red text-white px-3 py-2 rounded text-sm
                   hover:bg-red-700 transition-all duration-200"
        >
          Syntax Error
        </button>
        <button
          onClick={() => throwError('reference')}
          className="bg-ds-red border border-ds-red text-white px-3 py-2 rounded text-sm
                   hover:bg-red-700 transition-all duration-200"
        >
          Reference Error
        </button>
        <button
          onClick={() => throwError('type')}
          className="bg-ds-red border border-ds-red text-white px-3 py-2 rounded text-sm
                   hover:bg-red-700 transition-all duration-200"
        >
          Type Error
        </button>
        <button
          onClick={() => throwError('range')}
          className="bg-ds-red border border-ds-red text-white px-3 py-2 rounded text-sm
                   hover:bg-red-700 transition-all duration-200"
        >
          Range Error
        </button>
        <button
          onClick={() => throwError('custom')}
          className="bg-ds-red border border-ds-red text-white px-3 py-2 rounded text-sm
                   hover:bg-red-700 transition-all duration-200"
        >
          Custom Error
        </button>
      </div>

      <div className="text-ds-orange text-sm">
        <p>Current error type: {errorType || 'None'}</p>
      </div>
    </div>
  )
}

export default ErrorTest
