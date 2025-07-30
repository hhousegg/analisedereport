
import React, { useState, useCallback } from 'react';
import { SlaThresholds, AnalysisResult } from './types';
import { parseSlaReport } from './services/csvParser';
import SlaConfig from './components/SlaConfig';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [slaThresholds, setSlaThresholds] = useState<SlaThresholds>({
    sdwan: 99.95,
    wan1: 99.90,
    wan2: 99.90,
  });
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSlaChange = useCallback((newSlas: SlaThresholds) => {
    setSlaThresholds(newSlas);
  }, []);

  const handleFileProcess = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Formato de arquivo inválido. Por favor, carregue um arquivo .csv.');
      setAnalysisResult(null);
      setFileName(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileName(file.name);

    try {
      const content = await file.text();
      const result = parseSlaReport(content, slaThresholds);
      setAnalysisResult(result);
    } catch (e) {
      setError('Ocorreu um erro ao processar o arquivo. Verifique se o formato está correto.');
      console.error(e);
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [slaThresholds]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-blue-400">
            Analisador de Relatório de SLA SD-WAN
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Carregue seu relatório CSV do FortiAnalyzer para uma análise instantânea.
          </p>
        </header>

        <main className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 bg-gray-medium/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-light/20">
              <SlaConfig thresholds={slaThresholds} onChange={handleSlaChange} />
            </div>
            <div className="lg:col-span-2 bg-gray-medium/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-light/20">
              <FileUpload onFileProcess={handleFileProcess} isLoading={isLoading} fileName={fileName} />
            </div>
          </div>
          
          {error && (
             <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Erro: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center flex-col p-8 bg-gray-medium/50 rounded-xl shadow-lg border border-gray-light/20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-secondary"></div>
                <p className="mt-4 text-lg text-gray-300">Analisando o relatório...</p>
            </div>
          )}

          {analysisResult && !isLoading && (
            <ResultsDisplay result={analysisResult} slaThresholds={slaThresholds} />
          )}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>Desenvolvido com React, Tailwind CSS e Gemini API.</p>
            <p>Versão 1.0.0 &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
