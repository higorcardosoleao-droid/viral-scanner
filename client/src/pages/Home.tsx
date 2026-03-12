import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Video, Download, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">Viral Scanner</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-slate-300">{user?.name}</span>
                <Button variant="outline" onClick={() => logout()}>Sair</Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = getLoginUrl()}>Entrar</Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-4">Crie Vídeos Virais em Segundos</h2>
        <p className="text-xl text-slate-300 mb-8">Gerador de vídeos inteligente para TikTok, Instagram Reels e YouTube Shorts</p>
        {isAuthenticated ? (
          <Button
            size="lg"
            onClick={() => setLocation("/generate")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Video className="mr-2 h-5 w-5" />
            Começar Agora
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Entrar para Começar
          </Button>
        )}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Como Funciona</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                IA Gera Roteiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Nossa IA cria roteiros virais otimizados com hooks de atenção e estrutura narrativa comprovada.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Áudio em Português
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Síntese de fala natural em português brasileiro com voz profissional.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Download className="h-5 w-5 text-green-500" />
                Pronto para Publicar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">Vídeos em formato 9:16 otimizado para redes sociais, prontos para download.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      {isAuthenticated && (
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-bold text-white mb-4">Pronto para criar seu primeiro vídeo viral?</h3>
              <Button
                size="lg"
                onClick={() => setLocation("/generate")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Gerar Vídeo Agora
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
