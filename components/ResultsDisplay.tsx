
import React, { useState, useCallback } from 'react';
import { AnalysisResult, FailedDeviceDetail, SlaThresholds } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface ResultsDisplayProps {
  result: AnalysisResult;
  slaThresholds: SlaThresholds;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-gray-medium/70 p-4 rounded-lg flex items-center shadow-md border-l-4 ${color}`}>
    {icon}
    <div className="ml-4">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, slaThresholds }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copiar Resultados');
  
  const generateReportText = useCallback(() => {
    let report = `Resumo da Análise:\n`;
    report += `- Total de Unidades Verificadas: ${result.totalDevices}\n`;
    report += `- Unidades em Conformidade: ${result.compliantDevices}\n`;
    report += `- Unidades Fora de Conformidade: ${result.nonCompliantDevices}\n\n`;

    if(result.failedDeviceDetails.length > 0) {
      report += `--- DETALHES DAS FALHAS ---\n\n`;
      result.failedDeviceDetails.forEach(device => {
        report += `Device: ${device.deviceName}\n`;
        if (device.status === 'DATA_UNAVAILABLE') {
          report += `- Status: Dados de disponibilidade não encontrados no relatório.\n`;
        } else {
          device.failures.forEach(failure => {
            report += `- Interface: ${failure.interfaceName} | Disponibilidade: ${failure.availability.toFixed(4)}% (SLA esperado: ${failure.expectedSla.toFixed(4)}%)\n`;
          });
        }
        report += `\n`;
      });
    }
    return report;
  }, [result]);

  const handleCopy = useCallback(() => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText).then(() => {
      setCopyButtonText('Copiado!');
      setTimeout(() => setCopyButtonText('Copiar Resultados'), 2000);
    });
  }, [generateReportText]);

  return (
    <div className="bg-gray-medium/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-light/20 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold text-white mb-4">Resultados da Análise</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total de Unidades" value={result.totalDevices} icon={<div className="p-2 bg-blue-500/20 rounded-full"><ExclamationTriangleIcon className="h-8 w-8 text-blue-400" /></div>} color="border-blue-500" />
          <StatCard title="Em Conformidade" value={result.compliantDevices} icon={<div className="p-2 bg-green-500/20 rounded-full"><CheckCircleIcon className="h-8 w-8 text-green-400" /></div>} color="border-green-500" />
          <StatCard title="Fora de Conformidade" value={result.nonCompliantDevices} icon={<div className="p-2 bg-red-500/20 rounded-full"><XCircleIcon className="h-8 w-8 text-red-400" /></div>} color="border-red-500" />
        </div>
      </div>

      {result.failedDeviceDetails.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-red-400">Detalhamento de Unidades Fora de Conformidade</h3>
            <button
                onClick={handleCopy}
                className="flex items-center bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-brand-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-dark focus:ring-brand-primary"
            >
                <ClipboardIcon className="h-5 w-5 mr-2" />
                {copyButtonText}
            </button>
          </div>
          <div className="space-y-4">
            {result.failedDeviceDetails.map((device) => (
              <div key={device.deviceName} className="bg-gray-dark p-4 rounded-lg border border-gray-light">
                <h4 className="font-bold text-lg text-yellow-400">{device.deviceName}</h4>
                {device.status === 'DATA_UNAVAILABLE' ? (
                   <p className="text-orange-400 mt-2">Dados de disponibilidade (SD-WAN Availability) não encontrados para este dispositivo.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-gray-300">
                  {device.failures.map((failure, index) => (
                    <li key={index} className="flex items-center">
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                      <span>
                        Interface: <span className="font-semibold">{failure.interfaceName}</span> | 
                        Disponibilidade: <span className="font-semibold text-red-400">{failure.availability.toFixed(4)}%</span> 
                        (SLA esperado: <span className="text-gray-400">{failure.expectedSla.toFixed(4)}%</span>)
                      </span>
                    </li>
                  ))}
                </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
       {result.failedDeviceDetails.length === 0 && result.totalDevices > 0 && (
          <div className="text-center py-8 bg-gray-dark rounded-lg">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-400">Excelente!</h3>
            <p className="text-gray-300">Todas as unidades verificadas estão em conformidade com os SLAs definidos.</p>
          </div>
        )}
    </div>
  );
};

export default ResultsDisplay;
