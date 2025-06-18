
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const createPDF = () => {
  return new jsPDF({ 
    unit: "mm", 
    format: "a4",
    compress: true
  });
};

export const processPageElement = async (pageElement: HTMLElement, pageIndex: number): Promise<string> => {
  console.log(`=== PROCESSANDO PÁGINA ${pageIndex + 1} ===`);
  
  // Verificar se a página é visível
  const pageStyle = window.getComputedStyle(pageElement);
  if (pageStyle.display === 'none' || pageStyle.visibility === 'hidden') {
    console.warn(`Página ${pageIndex + 1} está oculta, pulando...`);
    throw new Error(`Página ${pageIndex + 1} está oculta`);
  }

  // Aguardar mais tempo entre páginas
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Iniciando captura da página...', {
    scrollWidth: pageElement.scrollWidth,
    scrollHeight: pageElement.scrollHeight,
    offsetWidth: pageElement.offsetWidth,
    offsetHeight: pageElement.offsetHeight,
    clientWidth: pageElement.clientWidth,
    clientHeight: pageElement.clientHeight
  });

  // Configurações mais conservadoras para html2canvas
  const canvas = await html2canvas(pageElement, {
    scale: 1.2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: false,
    logging: false,
    imageTimeout: 20000,
    removeContainer: true,
    width: pageElement.scrollWidth,
    height: pageElement.scrollHeight,
    windowWidth: Math.max(pageElement.scrollWidth, 800),
    windowHeight: Math.max(pageElement.scrollHeight, 600),
    onclone: (clonedDoc) => {
      console.log('Clonando documento para captura...');
      const clonedImages = clonedDoc.querySelectorAll('img');
      clonedImages.forEach((img) => {
        img.crossOrigin = 'anonymous';
      });
    }
  });
  
  console.log(`Canvas da página ${pageIndex + 1} criado:`, {
    width: canvas.width,
    height: canvas.height,
    dataLength: canvas.toDataURL("image/jpeg", 0.8).length
  });
  
  return canvas.toDataURL("image/jpeg", 0.8);
};

export const processPageWithFallback = async (pageElement: HTMLElement, pageIndex: number): Promise<string> => {
  try {
    return await processPageElement(pageElement, pageIndex);
  } catch (pageError) {
    console.error(`❌ Erro ao processar página ${pageIndex + 1}:`, pageError);
    
    // Se é a primeira página e falhou, tentar uma abordagem mais simples
    if (pageIndex === 0) {
      console.log('Tentando abordagem simplificada para a primeira página...');
      try {
        const simpleCanvas = await html2canvas(pageElement, {
          scale: 1,
          useCORS: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false
        });
        
        const simpleImg = simpleCanvas.toDataURL("image/jpeg", 0.7);
        console.log('✅ Primeira página processada com abordagem simplificada');
        return simpleImg;
      } catch (simpleError) {
        console.error('❌ Falhou mesmo com abordagem simplificada:', simpleError);
        throw new Error(`Erro crítico na primeira página: ${simpleError.message}`);
      }
    }
    
    throw pageError;
  }
};

export const addImageToPDF = (pdf: jsPDF, imageData: string, shouldAddPage: boolean = false) => {
  if (shouldAddPage) {
    console.log(`Adicionando nova página ao PDF`);
    pdf.addPage();
  }
  
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
};
