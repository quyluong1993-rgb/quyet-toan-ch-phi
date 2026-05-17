import { useRef, useState } from 'react';
import { gasClient } from '../../api/gasClient';

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});
interface InvoiceProcessingProps {
  onItemsAdded?: (items: any[]) => void;
  onItemRemoved?: (id: string) => void;
  exchangeRate: number;
}

interface FileState {
  id: string;
  file: File;
  url: string;
}

export function InvoiceProcessing({ onItemsAdded, onItemRemoved, exchangeRate }: InvoiceProcessingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [filesState, setFilesState] = useState<FileState[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const newFileStates = files.map(file => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
      return { id, file, url };
    });

    setFilesState(prev => [...prev, ...newFileStates]);
    
    // XỬ LÝ SONG SONG DÀNH CHO TÀI KHOẢN TRẢ PHÍ (Tốc độ cực nhanh)
    setIsScanning(true);
    
    const scanPromises = newFileStates.map(async (fs) => {
      try {
        const base64 = await toBase64(fs.file);
        const result = await gasClient('SCAN_INVOICE', { imageBase64: base64 });
        
        // Kiểm tra xem backend có báo lỗi quota hay không (nếu lỡ hết tiền hoặc lỗi)
        const isQuotaError = result.items && result.items.length > 0 && 
                            result.items[0].content && 
                            result.items[0].content.includes('quota');
        
        if (isQuotaError) {
          throw new Error("Vượt quá hạn mức Google API. Vui lòng nạp thêm tiền hoặc nâng cấp hạn mức.");
        }

        return result.items.map((item: any) => {
           const vnPrice = item.unitPriceRMB * exchangeRate;
           return {
             id: fs.id, // ID matched with file
             content: item.content || `Chi phí công tác (Quét từ ${fs.file.name})`,
             quantity: item.quantity || 1,
             unitPriceRMB: item.unitPriceRMB || 0,
             unitPriceVND: vnPrice,
             totalAmount: vnPrice * (item.quantity || 1),
             date: item.date !== undefined && item.date !== null ? item.date : new Date().toISOString().split('T')[0]
           };
        });
      } catch (err) {
        console.error("OCR Failed for", fs.file.name, err);
        // Fallback for this image
        return [{
          id: fs.id,
          content: `Lỗi hoặc Quota Exceeded (Quét từ ${fs.file.name})\n出差费用`,
          quantity: 1,
          unitPriceRMB: 0,
          unitPriceVND: 0,
          totalAmount: 0,
          date: new Date().toISOString().split('T')[0]
        }];
      }
    });

    Promise.all(scanPromises).then((resultsArray) => {
       setIsScanning(false);
       const newItems = resultsArray.flat();
       if (onItemsAdded) {
         onItemsAdded(newItems);
       }
    });
  };

  const removeFile = (e: React.MouseEvent, idToRemove: string) => {
    e.stopPropagation(); 
    setFilesState(prev => {
      const fileToRemove = prev.find(fs => fs.id === idToRemove);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(fs => fs.id !== idToRemove);
    });
    
    if (onItemRemoved) {
      onItemRemoved(idToRemove);
    }
  };

  return (
    <section className="bg-surface p-lg rounded-xl card-shadow border border-gray-200">
        <h2 className="font-headline-md text-headline-md text-primary mb-md">Invoice Processing</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-lg">
            <div className="lg:col-span-3">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-3xl flex flex-col items-center justify-center transition-all duration-300 group cursor-pointer min-h-[300px] h-full overflow-hidden
                        ${isDragging ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low'}
                        ${isScanning ? 'opacity-80 pointer-events-none' : ''}
                    `}>
                    
                    {/* Scanning overlay animation */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center z-10 backdrop-blur-[1px]">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="font-headline-sm text-primary animate-pulse">Đang dùng AI trích xuất dữ liệu...</p>
                      </div>
                    )}

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileInput} 
                        accept="image/png, image/jpeg, application/pdf" 
                        className="hidden" 
                        multiple
                    />

                    {filesState.length > 0 ? (
                        <div className="w-full">
                            <div className="flex flex-wrap gap-md justify-center mb-md">
                                {filesState.map((fs) => (
                                    <div key={fs.id} className="relative group/item flex flex-col items-center w-32">
                                        {fs.url ? (
                                            <div className="w-32 h-32 rounded-lg shadow-sm border border-outline-variant overflow-hidden bg-surface relative">
                                                <img src={fs.url} alt={`Preview`} className="w-full h-full object-cover" />
                                                <button 
                                                    onClick={(e) => removeFile(e, fs.id)}
                                                    className="absolute top-1 right-1 bg-error text-on-error w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:scale-110 z-20"
                                                    title="Remove"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-lg shadow-sm border border-outline-variant bg-surface-container flex flex-col items-center justify-center relative">
                                                <span className="material-symbols-outlined text-[32px] text-outline">description</span>
                                                <span className="text-[10px] mt-1 text-outline px-2 truncate w-full text-center">{fs.file.name.split('.').pop()?.toUpperCase()}</span>
                                                <button 
                                                    onClick={(e) => removeFile(e, fs.id)}
                                                    className="absolute top-1 right-1 bg-error text-on-error w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity hover:scale-110 z-20"
                                                    title="Remove"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                                </button>
                                            </div>
                                        )}
                                        <p className="font-body-sm text-[11px] text-outline mt-2 truncate w-full text-center" title={fs.file.name}>{fs.file.name}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="font-body-sm text-center text-outline-variant hover:text-primary transition-colors">
                                + Click or drag more files to add
                            </p>
                        </div>
                    ) : (
                        <>
                            <span className={`material-symbols-outlined text-[48px] mb-md transition-colors ${isDragging ? 'text-primary' : 'text-outline-variant group-hover:text-primary'}`} data-icon="cloud_upload">cloud_upload</span>
                            <p className="font-headline-md text-headline-md text-on-surface-variant mb-xs">
                                Drag and drop invoice images here
                            </p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">Supports PDF, PNG, JPG (Max 10MB per file)</p>
                        </>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-md">
                <div className="flex-1 bg-primary-container rounded-xl p-lg text-on-primary-container flex flex-col items-center justify-center text-center">
                    <button className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center mb-md hover:scale-105 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[32px]" data-icon="mic">mic</span>
                    </button>
                    <p className="font-label-md text-label-md uppercase tracking-widest mb-xs">Voice Input</p>
                    <p className="font-body-sm text-body-sm opacity-80">Dictate expense details for instant processing</p>
                </div>
                <div className="p-md bg-secondary-container rounded-xl flex items-center gap-md">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-on-secondary">
                        <span className="material-symbols-outlined" data-icon="bolt">bolt</span>
                    </div>
                    <div>
                        <p className="font-label-md text-label-md text-on-secondary-container">AI Status</p>
                        <p className={`font-body-sm text-body-sm font-bold ${isScanning ? 'text-primary animate-pulse' : 'text-on-secondary-container'}`}>
                          {isScanning ? 'Processing...' : 'Engine: High Precision'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
  );
}
