import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-space-xl font-sans">
        <div className="w-full max-w-md flex flex-col items-center text-center gap-space-xl">
          <div className="w-20 h-20 rounded-full bg-secondary-fixed flex items-center justify-center shadow-lg">
            <span
              className="material-symbols-outlined text-secondary text-[40px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
          </div>

          <div>
            <p className="text-label-lg text-primary font-bold uppercase tracking-wider mb-space-sm">
              Oops, something broke
            </p>
            <h1 className="text-headline-xl text-on-surface font-extrabold tracking-tight">
              App crashed
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-2 max-w-sm">
              An unexpected error occurred. Reloading the app usually fixes it.
            </p>
          </div>

          <div className="w-full bg-surface-container-low rounded-xl p-space-md text-left">
            <p className="text-label-sm text-on-surface-variant font-mono break-all">
              {this.state.error?.message ?? 'Unknown error'}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary-container text-on-primary text-label-lg font-bold shadow-[0_4px_0_0_#5a00c6] active:translate-y-1 active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Reload SayIt
          </button>
        </div>
      </div>
    )
  }
}
