
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const createPDF = () => {
  return new jsPDF({ 
    unit: "mm", 
    format: "a4",
    compress: true
  });
};

const waitForElementToBeReady = async (element: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 500);
      });
    });
  });
};

export const processPageElement = async (pageElement: HTMLElement, pageIndex: number): Promise<string> => {
  console.log(`🚀 === PROCESSANDO PÁGINA ${pageIndex + 1} ===`);
  
  try {
    if (!pageElement) {
      throw new Error(`Elemento da página ${pageIndex + 1} é nulo`);
    }
    
    console.log(`📋 Processando elemento:`, {
      tagName: pageElement.tagName,
      className: pageElement.className,
      isConnected: pageElement.isConnected,
      id: pageElement.id || 'sem-id'
    });
    
    if (!document.contains(pageElement)) {
      throw new Error(`Elemento da página ${pageIndex + 1} não está no DOM`);
    }
    
    // Aguardar estabilização
    console.log('⏳ Aguardando estabilização...');
    await waitForElementToBeReady(pageElement);
    
    const rect = pageElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error(`Página ${pageIndex + 1} não está visível (${rect.width}x${rect.height})`);
    }

    console.log('🎬 Iniciando captura...', {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      top: Math.round(rect.top),
      left: Math.round(rect.left)
    });

    // Configurações otimizadas para html2canvas
    const canvasOptions = {
      scale: 1.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 10000,
      removeContainer: true,
      height: rect.height,
      width: rect.width,
      x: 0,
      y: 0,
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        console.log('🔄 Configurando documento clonado...');
        
        if (!clonedElement) {
          console.error('❌ Elemento não encontrado no documento clonado');
          return;
        }
        
        // Garantir visibilidade
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        clonedElement.style.position = 'static';
        clonedElement.style.transform = 'none';
        
        // Configurar imagens
        const imgs = clonedDoc.querySelectorAll('img');
        imgs.forEach((img) => {
          if (img instanceof HTMLImageElement) {
            img.crossOrigin = 'anonymous';
            img.style.display = 'block';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
          }
        });
        
        console.log(`✅ Documento clonado configurado com ${imgs.length} imagens`);
      }
    };

    console.log('🎨 Criando canvas...');
    const canvas = await html2canvas(pageElement, canvasOptions);
    
    if (!canvas) {
      throw new Error(`Falha ao criar canvas para página ${pageIndex + 1}`);
    }
    
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    console.log(`✅ Canvas criado com sucesso - ${canvas.width}x${canvas.height}`);
    
    return imageData;
    
  } catch (error) {
    console.error(`❌ Erro ao processar página ${pageIndex + 1}:`, error);
    throw error;
  }
};

export const processPageWithFallback = async (pageElement: HTMLElement, pageIndex: number): Promise<string> => {
  try {
    return await processPageElement(pageElement, pageIndex);
  } catch (pageError) {
    console.error(`❌ Erro na página ${pageIndex + 1}:`, pageError);
    
    // Fallback simplificado
    if (pageIndex === 0) {
      console.log('🔄 Tentando fallback simplificado para primeira página...');
      
      try {
        if (!pageElement || !document.contains(pageElement)) {
          throw new Error('Elemento não está disponível para fallback');
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const rect = pageElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw new Error('Elemento não está visível para fallback');
        }
        
        console.log('🎨 Tentando captura simplificada...');
        const simpleCanvas = await html2canvas(pageElement, {
          scale: 1,
          useCORS: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
          imageTimeout: 5000
        });
        
        if (!simpleCanvas) {
          throw new Error('Fallback falhou ao criar canvas');
        }
        
        const simpleImg = simpleCanvas.toDataURL("image/jpeg", 0.8);
        console.log('✅ Primeira página processada com fallback');
        return simpleImg;
        
      } catch (simpleError) {
        console.error('❌ Fallback também falhou:', simpleError);
        throw new Error(`Erro crítico na primeira página: ${simpleError.message}`);
      }
    }
    
    throw pageError;
  }
};

export const addImageToPDF = (pdf: jsPDF, imageData: string, shouldAddPage: boolean = false) => {
  console.log(`📄 ${shouldAddPage ? 'Adicionando nova página' : 'Usando página atual'}`);
  
  if (shouldAddPage) {
    pdf.addPage();
  }
  
  try {
    pdf.addImage(
      imageData,
      "JPEG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight(),
      undefined,
      'FAST'
    );
    console.log('✅ Imagem adicionada ao PDF');
  } catch (error) {
    console.error('❌ Erro ao adicionar imagem ao PDF:', error);
    throw error;
  }
};
