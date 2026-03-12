import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play, Download } from "lucide-react";
import { toast } from "sonner";

export default function GenerateVideo() {
  const [theme, setTheme] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [duration, setDuration] = useState("15");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoId, setGeneratedVideoId] = useState<number | null>(null);
  const [videoStatus, setVideoStatus] = useState<"processing" | "ready" | "failed" | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Buscar templates disponíveis
  const { data: templates, isLoading: templatesLoading } = trpc.videos.listTemplates.useQuery();

  // Gerar vídeo
  const generateMutation = trpc.videos.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedVideoId(data.videoId);
      setVideoStatus("processing");
      toast.success(data.message);
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
      setIsGenerating(false);
    }
  });

  // Verificar status do vídeo
  const statusQuery = trpc.videos.getStatus.useQuery(
    { videoId: generatedVideoId || 0 },
    { enabled: !!generatedVideoId && videoStatus === "processing", refetchInterval: 3000 }
  );

  useEffect(() => {
    if (statusQuery.data) {
      setVideoStatus(statusQuery.data.status as any);
      if (statusQuery.data.status === "ready" && statusQuery.data.videoUrl) {
        setVideoUrl(statusQuery.data.videoUrl);
        toast.success("Vídeo pronto para download!");
      } else if (statusQuery.data.status === "failed") {
        toast.error(`Erro: ${statusQuery.data.errorMessage}`);
      }
    }
  }, [statusQuery.data]);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      toast.error("Por favor, insira um tema");
      return;
    }

    if (!templateId) {
      toast.error("Por favor, selecione um template");
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({
      theme: theme.trim(),
      templateId: parseInt(templateId),
      duration: parseInt(duration)
    });
  };

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `viral-video-${generatedVideoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Gerador de Vídeos Virais</h1>
          <p className="text-lg text-slate-600">Crie vídeos incríveis para TikTok, Reels e YouTube Shorts</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Criar Novo Vídeo</CardTitle>
            <CardDescription>Preencha os dados abaixo para gerar seu vídeo viral</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme" className="text-base font-semibold">Tema do Vídeo</Label>
              <Textarea
                id="theme"
                placeholder="Ex: 5 curiosidades sobre o espaço que você não sabia"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="min-h-20 resize-none"
                disabled={isGenerating}
              />
              <p className="text-sm text-slate-500">{theme.length}/500 caracteres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template" className="text-base font-semibold">Estilo de Vídeo</Label>
              <Select value={templateId} onValueChange={setTemplateId} disabled={isGenerating || templatesLoading}>
                <SelectTrigger id="template">
                  <SelectValue placeholder="Selecione um template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id.toString()}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-base font-semibold">Duração (segundos)</Label>
              <Select value={duration} onValueChange={setDuration} disabled={isGenerating}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 segundos</SelectItem>
                  <SelectItem value="15">15 segundos</SelectItem>
                  <SelectItem value="30">30 segundos</SelectItem>
                  <SelectItem value="60">60 segundos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || templatesLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gerando vídeo...
                </>
              ) : (
                "Gerar Vídeo"
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedVideoId && (
          <Card className="shadow-lg border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {videoStatus === "processing" && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                {videoStatus === "ready" && <Play className="h-5 w-5 text-green-600" />}
                {videoStatus === "failed" && <div className="h-5 w-5 text-red-600">✕</div>}
                Status: {videoStatus === "processing" ? "Processando..." : videoStatus === "ready" ? "Pronto!" : "Erro"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {videoStatus === "processing" && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Seu vídeo está sendo processado. Isso pode levar alguns minutos...</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                  </div>
                </div>
              )}

              {videoStatus === "ready" && videoUrl && (
                <div className="space-y-4">
                  <p className="text-sm text-green-700 font-semibold">✓ Vídeo gerado com sucesso!</p>
                  <video
                    src={videoUrl}
                    controls
                    className="w-full rounded-lg bg-black max-h-96"
                  />
                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Baixar Vídeo
                  </Button>
                </div>
              )}

              {videoStatus === "failed" && (
                <p className="text-sm text-red-700 font-semibold">
                  ✕ Erro ao processar vídeo. Tente novamente.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
