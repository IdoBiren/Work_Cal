import { Component, type ErrorInfo, type ReactNode } from 'react'

/** Last-resort net so a render crash shows a message instead of a blank white page. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm w-full">
          <h1 className="text-xl font-bold text-slate-800 mb-2">משהו נשבר</h1>
          <p className="text-slate-500 mb-4 text-sm">
            נתקלנו בתקלה בלתי צפויה. נסו לרענן את הדף; אם זה חוזר, צלמו את המסך ושלחו למנהל.
          </p>
          <p className="text-xs text-slate-400 mb-4 break-words">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white w-full"
          >
            רענון הדף
          </button>
        </div>
      </div>
    )
  }
}
