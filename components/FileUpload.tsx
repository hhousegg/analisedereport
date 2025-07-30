
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
  onFileProcess: (file: File) => void;
  isLoading: boolean;
  fileName: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcess, isLoading, fileName }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileProcess(e.dataTransfer.files[0]);
    }
  }, [onFileProcess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileProcess(e.target.files[0]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-brand-secondary">2. Carregar Relatório</h2>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-colors ${
          isDragging ? 'border-brand-primary bg-gray-light/30' : 'border-gray-light hover:border-brand-secondary'
        }`}
      >
        <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-dark focus:ring-brand-primary"
        >
          Escolher Arquivo CSV
        </label>
        <p className="mt-2 text-sm text-gray-400">ou arraste e solte o arquivo aqui</p>
        {fileName && !isLoading && (
            <p className="mt-4 text-sm text-green-400">Arquivo carregado: <span className="font-semibold">{fileName}</span></p>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Por favor, carregue o relatório de disponibilidade gerado pelo FortiAnalyzer. A análise é feita localmente no seu navegador; nenhum dado é enviado para servidores.
      </p>
    </div>
  );
};

export default FileUpload;
