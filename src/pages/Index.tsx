
import React, { useState } from "react";
import FileUploader from "@/components/FileUploader";
import { analyzeChatFile, ChatAnalysis } from "@/utils/chatAnalyzer";
import ChatStats from "@/components/ChatStats";
import WrappedCard from "@/components/WrappedCard";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCard, setShowCard] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileUpload = async (content: string) => {
    setIsLoading(true);
    setFileContent(content);
    
    try {
      console.log("Prima riga del file:", content.split('\n')[0]);
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      const chatAnalysis = analyzeChatFile(content);
      setAnalysis(chatAnalysis);
      console.log("Analisi completata:", chatAnalysis);
      
      toast({
        title: "Analisi completata",
        description: "I tuoi messaggi sono stati analizzati con successo",
      });
    } catch (error) {
      console.error("Error analyzing chat:", error);
      toast({
        title: "Errore nell'analisi",
        description: "Formato del file non riconosciuto o contenuto non valido",
        variant: "destructive",
      });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 md:py-6 px-4">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white tracking-tight drop-shadow-md">
            ChatWrapped
          </h1>
          <p className="text-center text-white/90 mt-1 md:mt-2 text-base md:text-lg font-medium">
            Scopri le statistiche delle tue conversazioni
          </p>
        </div>
      </header>

      <main className="flex-1 py-6 md:py-12 px-4">
        <div className="container app-container p-4 md:p-6">
          {!fileContent ? (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8 md:mb-12 animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-3 md:mb-4 tracking-tight">
                  La tua chat, <span className="text-primary">visualizzata.</span>
                </h2>
                <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
                  Carica un file di chat e scopri statistiche interessanti sulla tua conversazione.
                </p>
              </div>

              <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />

              <div className="mt-8 md:mt-12 space-y-4 md:space-y-6 animate-fade-in">
                <div className="glass-card rounded-lg p-4 md:p-6">
                  <h3 className="font-medium mb-2">Formati supportati:</h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    • WhatsApp iOS: [25/07/24, 7:49:06 PM] Nonna Pinuccia: Ok 12/15 va bene. ciao
                  </p>
                  <p className="text-muted-foreground text-xs md:text-sm mt-1">
                    • WhatsApp Android: 22/10/23, 15:20 - nico: Sto arrivando
                  </p>
                </div>

                <div className="text-xs md:text-sm text-muted-foreground text-center">
                  <p>I tuoi dati rimangono sul tuo computer, nessun dato viene inviato a server esterni.</p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 md:py-16">
              <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3 md:mb-4"></div>
              <p className="text-sm md:text-base text-muted-foreground">Analisi in corso...</p>
            </div>
          ) : showCard && analysis ? (
            <WrappedCard 
              analysis={analysis} 
              onBack={() => setShowCard(false)}
            />
          ) : analysis ? (
            <ChatStats 
              analysis={analysis} 
              onGenerateCard={() => setShowCard(true)}
            />
          ) : null}
        </div>
      </main>
      
      <footer className="py-3 md:py-4">
        <div className="container">
          <p className="text-center text-xs md:text-sm text-white/80">
            ChatWrapped - Ispirato da Spotify Wrapped. Creato con ❤️
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
