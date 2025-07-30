
import { SlaThresholds, AnalysisResult, FailedDeviceDetail, FailedInterface } from '../types';

export const parseSlaReport = (csvContent: string, slas: SlaThresholds): AnalysisResult => {
  const lines = csvContent.split(/\r?\n/).map(line => line.trim().replace(/"/g, ''));

  const deviceBlocks: string[][] = [];
  let currentBlock: string[] = [];

  for (const line of lines) {
    if (line.startsWith('###Section Title###')) {
      if (currentBlock.length > 0) {
        deviceBlocks.push(currentBlock);
      }
      currentBlock = [];
    }
    if (line) {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    deviceBlocks.push(currentBlock);
  }

  const failedDeviceDetails: FailedDeviceDetail[] = [];
  let compliantCount = 0;
  const totalDevices = deviceBlocks.length;

  for (const block of deviceBlocks) {
    const nameIndex = block.indexOf('Name');
    if (nameIndex === -1 || nameIndex + 1 >= block.length) continue;
    
    const deviceName = block[nameIndex + 1].trim();

    const availabilitySectionIndex = block.findIndex(line => line.startsWith('###SD-WAN Availability###'));

    if (availabilitySectionIndex === -1) {
      failedDeviceDetails.push({ deviceName, failures: [], status: 'DATA_UNAVAILABLE' });
      continue;
    }

    const failures: FailedInterface[] = [];
    const availabilityBlock = block.slice(availabilitySectionIndex + 1);
    
    // Regex to match "Interface,Available,Value,Value "
    const lineRegex = /^(SD-WAN|wan1|wan2|a|wan),Available,([\d\.]+),/;

    for (const line of availabilityBlock) {
      if (line.startsWith('###')) break; // End of current section

      const match = line.match(lineRegex);
      if (match) {
        const interfaceName = match[1].trim();
        const availability = parseFloat(match[2]);
        let expectedSla: number | null = null;

        if (interfaceName === 'SD-WAN') {
          expectedSla = slas.sdwan;
        } else if (interfaceName === 'wan1' || interfaceName === 'wan') {
          expectedSla = slas.wan1;
        } else if (interfaceName === 'wan2' || interfaceName === 'a') {
          expectedSla = slas.wan2;
        }

        if (expectedSla !== null && availability < expectedSla) {
          failures.push({ interfaceName, availability, expectedSla });
        }
      }
    }

    if (failures.length > 0) {
      failedDeviceDetails.push({ deviceName, failures, status: 'OUT_OF_SLA' });
    } else {
      compliantCount++;
    }
  }

  return {
    totalDevices,
    compliantDevices: compliantCount,
    nonCompliantDevices: failedDeviceDetails.length,
    failedDeviceDetails,
  };
};