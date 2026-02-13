import { useState } from 'react';
import { scanLibrary, ScanLibraryResult } from '@/api/books.api';

export function useLibraryScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanLibraryResult | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);

  const handleScanLibrary = async (onSuccess?: () => void) => {
    try {
      setIsScanning(true);
      const results = await scanLibrary();
      setScanResults(results);
      setShowResults(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error al escanear biblioteca:', error);
      alert(
        'Error al escanear la biblioteca. Revisa la consola para más detalles.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const closeResults = () => {
    setShowResults(false);
  };

  return {
    isScanning,
    scanResults,
    showResults,
    setShowResults,
    handleScanLibrary,
    closeResults,
  };
}
