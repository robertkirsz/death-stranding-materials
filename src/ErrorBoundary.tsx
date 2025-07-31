import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log additional information for debugging
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)

    // Check if localStorage is available and working
    try {
      localStorage.setItem('error-test', 'test')
      localStorage.removeItem('error-test')
    } catch (localStorageError) {
      console.error('localStorage is not available:', localStorageError)
    }
  }

  handleReset = () => {
    // Clear localStorage
    localStorage.removeItem('death-stranding-materials')

    // Reload the page
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ds-dark flex items-center justify-center p-4">
          <div className="max-w-md w-full ds-card text-center">
            <h1 className="text-2xl font-bold text-ds-red mb-4">Something went wrong</h1>

            <p className="text-ds-cyan mb-6">
              An error occurred while running the app. This might be due to corrupted data in localStorage.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-ds-orange cursor-pointer mb-2">Error Details</summary>
                <div className="bg-ds-gray p-3 rounded text-xs text-white font-mono overflow-auto">
                  {this.state.error.message}
                </div>
              </details>
            )}

            <button
              onClick={this.handleReset}
              className="bg-ds-red border border-ds-red text-white px-6 py-3 rounded-lg 
                       hover:bg-red-700 hover:border-red-700 transition-all duration-200
                       focus:outline-none focus:ring-2 focus:ring-ds-red focus:ring-opacity-50"
            >
              Clear Data & Reload
            </button>

            <p className="text-ds-cyan text-sm mt-4">This will clear all saved data and restart the app</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
