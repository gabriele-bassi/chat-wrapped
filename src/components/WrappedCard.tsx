
import React, { useRef, useState } from "react";
import { ChatAnalysis } from "@/utils/chatAnalyzer";
import { Button } from "@/components/ui/button";
import { Download, Instagram } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";

interface WrappedCardProps {
  analysis: ChatAnalysis;
  onBack: () => void;
}

const WrappedCard: React.FC<WrappedCardProps> = ({ analysis, onBack }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTheme, setCardTheme] = useState<string>("purple");
  const { toast } = useToast();
  
  const formatResponseTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.round(seconds)} secondi`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)} minuti`;
    } else {
      return `${Math.round(seconds / 3600)} ore`;
    }
  };

  const getTimeOfDayStats = () => {
    const timeOfDay = Object.entries(analysis.timeOfDayStats).reduce(
      (max, [key, value]) => (value > max.value ? { key, value } : max),
      { key: "", value: 0 }
    );
    
    const periodMap: Record<string, string> = {
      morning: "mattina",
      afternoon: "pomeriggio",
      evening: "sera",
      night: "notte",
    };
    
    return periodMap[timeOfDay.key];
  };
  
  const getMostFrequentUsers = () => {
    return Object.entries(analysis.userStats)
      .sort(([, a], [, b]) => b.messageCount - a.messageCount)
      .map(([name]) => name);
  };

  const downloadCard = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: null,
          logging: false
        });
        
        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement("a");
        link.href = image;
        link.download = "ChatWrapped.jpg";
        link.click();
        
        toast({
          title: "Card scaricata con successo!",
          description: "Ora puoi condividerla sui social media",
        });
      } catch (error) {
        console.error("Error generating image:", error);
        toast({
          title: "Errore durante il download",
          description: "Si è verificato un problema durante la generazione dell'immagine",
          variant: "destructive",
        });
      }
    }
  };

  const getCardClass = () => {
    switch (cardTheme) {
      case "green":
        return "bg-gradient-green";
      case "pink":
        return "bg-gradient-pink";
      case "blue":
        return "bg-gradient-blue";
      default:
        return "bg-gradient-purple";
    }
  };

  const users = getMostFrequentUsers();
  const mostActiveUser = users.length ? users[0] : "nessuno";
  const secondMostActiveUser = users.length > 1 ? users[1] : "";
  
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">La tua ChatWrapped</h2>
        <p className="text-muted-foreground">
          Scaricala e condividila sui social media!
        </p>
      </div>
      
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <Button
          variant={cardTheme === "purple" ? "default" : "outline"}
          onClick={() => setCardTheme("purple")}
          className="bg-gradient-purple text-white border-none hover:opacity-90"
        >
          Viola
        </Button>
        <Button
          variant={cardTheme === "green" ? "default" : "outline"}
          onClick={() => setCardTheme("green")}
          className="bg-gradient-green text-white border-none hover:opacity-90"
        >
          Verde
        </Button>
        <Button
          variant={cardTheme === "pink" ? "default" : "outline"}
          onClick={() => setCardTheme("pink")}
          className="bg-gradient-pink text-white border-none hover:opacity-90"
        >
          Rosa
        </Button>
        <Button
          variant={cardTheme === "blue" ? "default" : "outline"}
          onClick={() => setCardTheme("blue")}
          className="bg-gradient-blue text-white border-none hover:opacity-90"
        >
          Blu
        </Button>
      </div>
      
      <div className="phone-mockup">
        <div
          ref={cardRef}
          className={`wrapped-card text-white ${getCardClass()}`}
        >
          <div className="mb-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black mb-2">ChatWrapped</h1>
              <p className="text-sm opacity-70">Il tuo anno in chat</p>
            </div>
            
            <div className="stat-highlight">
              Hai scambiato <span className="text-yellow-200 font-black">{analysis.totalMessages}</span> messaggi
            </div>
            
            <div className="stat-highlight">
              {secondMostActiveUser ? (
                <>
                  Tu e <span className="text-yellow-200 font-black">{mostActiveUser}</span> avete chattato come non ci fosse un domani
                </>
              ) : (
                <>
                  <span className="text-yellow-200 font-black">{mostActiveUser}</span> è stato il più attivo nella chat
                </>
              )}
            </div>
            
            <div className="stat-highlight">
              La tua parola preferita è stata <span className="text-yellow-200 font-black">"{analysis.mostUsedWord.word}"</span>
              <div className="text-base font-normal opacity-70">
                L'hai usata {analysis.mostUsedWord.count} volte
              </div>
            </div>
            
            {analysis.mostUsedEmoji.emoji && (
              <div className="stat-highlight">
                La tua emoji del cuore <span className="text-3xl">{analysis.mostUsedEmoji.emoji}</span>
              </div>
            )}
            
            <div className="stat-highlight">
              Ami chattare di <span className="text-yellow-200 font-black">{getTimeOfDayStats()}</span>
            </div>
            
            <div className="stat-highlight">
              Rispondi in media in <span className="text-yellow-200 font-black">{formatResponseTime(analysis.averageResponseTime)}</span>
            </div>
          </div>
            
          <div className="text-center text-sm opacity-70 mt-6">
            Generato con ChatWrapped
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={onBack} variant="outline">
          Torna alle statistiche
        </Button>
        <Button onClick={downloadCard} className="gap-2">
          <Download className="h-4 w-4" />
          Scarica Card
        </Button>
      </div>
    </div>
  );
};

export default WrappedCard;
