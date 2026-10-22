import React, { ErrorInfo, ReactNode } from 'react';
import { KeyRound, AlertTriangle, RefreshCw, ArrowRight, ShieldAlert, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { getStoredApiKey, saveApiKey, clearApiKey } from '../utils/apiKeyManager';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  is401: boolean;
  errorMessage: string;
  userApiKey: string;
  showKeyInput: boolean;
  saveSuccess: boolean;
  safeModeActive: boolean;
  showPassword: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      is401: false,
      errorMessage: '',
      userApiKey: getStoredApiKey(),
      showKeyInput: false,
      saveSuccess: false,
      safeModeActive: false,
      showPassword: false,
    };
  }

  private unhandledRejectionListener = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || JSON.stringify(reason);
    const is401 =
      msg?.includes('401') ||
      msg?.toLowerCase().includes('unauthorized') ||
      msg?.toLowerCase().includes('api key not valid') ||
      msg?.toLowerCase().includes('api_key_invalid');

    if (is401) {
      console.warn('[ErrorBoundary] Caught 401 Unauthorized in unhandled promise:', msg);
      this.setState({
        hasError: true,
        is401: true,
        errorMessage: msg,
        showKeyInput: true,
      });
      // Prevent browser default white screen
      event.preventDefault();
    }
  };

  private custom401Listener = (event: Event) => {
    const customEvent = event as CustomEvent;
    this.setState({
      hasError: true,
      is401: true,
      errorMessage: customEvent.detail?.error || '401 Unauthorized - API Key invalid sau expirat',
      showKeyInput: true,
    });
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const msg = error.message || '';
    const is401 =
      msg.includes('401') ||
      msg.toLowerCase().includes('unauthorized') ||
      msg.toLowerCase().includes('api key') ||
      msg.toLowerCase().includes('apikey');

    return {
      hasError: true,
      is401,
      errorMessage: msg,
      showKeyInput: is401 || msg.includes('key'),
    };
  }

  public override componentDidMount() {
    window.addEventListener('unhandledrejection', this.unhandledRejectionListener);
    window.addEventListener('sandwichef_api_401', this.custom401Listener);
  }

  public override componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.unhandledRejectionListener);
    window.removeEventListener('sandwichef_api_401', this.custom401Listener);
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Sandwichef ErrorBoundary caught an exception]:', error, errorInfo);
  }

  private handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const success = saveApiKey(this.state.userApiKey);
    if (success) {
      this.setState({ saveSuccess: true });
      setTimeout(() => {
        // Attempt clean recovery
        this.setState({
          hasError: false,
          is401: false,
          saveSuccess: false,
        });
        window.location.reload();
      }, 800);
    }
  };

  private handleBypassToSafeMode = () => {
    // Allows loading the standard visual catalogue, ordering, and artisan builder without crashing
    this.setState({
      hasError: false,
      is401: false,
      safeModeActive: true,
    });
  };

  private handleReset = () => {
    clearApiKey();
    this.setState({
      userApiKey: '',
      hasError: false,
      is401: false,
    });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError && !this.state.safeModeActive) {
      return (
        <div className="min-h-screen bg-[#1F1714] text-[#FAF7F2] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#C44E36] selection:text-white">
          {/* Decorative Warm Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#C44E36]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-lg bg-[#2A1F1B] border border-[#E4D9CA]/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Header Icon */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  this.state.is401 ? 'bg-[#F0BE2C]/20 text-[#F0BE2C] border border-[#F0BE2C]/30' : 'bg-[#C44E36]/20 text-[#E0654B] border border-[#C44E36]/30'
                }`}
              >
                {this.state.is401 ? <KeyRound className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#F0BE2C]">
                  {this.state.is401 ? 'Autentificare API Necesară (401)' : 'Recuperare Stare Aplicație'}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  {this.state.is401 ? 'Configurare Cheie API' : 'A apărut o întrerupere temporară'}
                </h2>
              </div>
            </div>

            {/* Explanatory Note */}
            <p className="text-sm text-[#E4D9CA]/80 leading-relaxed mb-6">
              {this.state.is401
                ? 'Apelul inițial a primit un răspuns 401 (Unauthorized) sau cheia API este absentă / invalidă. Poți introduce propria cheie sau poți continua direct în modul Meniu & Comandă WhatsApp.'
                : 'Aplicația a interceptat o eroare la randare și a prevenit afișarea unui ecran alb. Poți continua navigarea în modul protejat sau poți reîncărca pagina.'}
            </p>

            {/* Error Detail Pill (if exists) */}
            {this.state.errorMessage && (
              <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-stone-300 break-all flex items-start gap-2 max-h-24 overflow-y-auto">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="flex-1">{this.state.errorMessage}</span>
              </div>
            )}

            {/* API Key Form */}
            <form onSubmit={this.handleSaveKey} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#E4D9CA] uppercase tracking-wider mb-2">
                  Cheie API (Gemini / AI Studio / Custom)
                </label>
                <div className="relative">
                  <input
                    type={this.state.showPassword ? 'text' : 'password'}
                    value={this.state.userApiKey}
                    onChange={(e) => this.setState({ userApiKey: e.target.value })}
                    placeholder="Introdu cheia ta (AIzaSy...)"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-[#1F1714] border border-[#E4D9CA]/25 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#F0BE2C] focus:ring-1 focus:ring-[#F0BE2C] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors"
                  >
                    {this.state.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#A89F91] mt-1.5">
                  Cheia este salvată exclusiv local în browserul tău (<code className="text-amber-300">localStorage</code>) și nu este transmisă către terți.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#C44E36] to-[#E0654B] hover:from-[#A83D28] hover:to-[#C44E36] text-white font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  {this.state.saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Salvat! Se repornește...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Salvează & Reîncarcă</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={this.handleBypassToSafeMode}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-sm transition-all active:scale-98 cursor-pointer"
                >
                  <span>Meniu & Comandă</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Footer Secondary Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#A89F91]">
              <button
                type="button"
                onClick={this.handleReset}
                className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resetează cheia stocată</span>
              </button>

              <span className="text-[11px] text-stone-500">Sandwichef Craiova Guard</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
