
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
    // Aguardar múltiplos frames de renderização para garantir estabilidade
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Aguardar mais tempo para garantir que o layout esteja completamente estável
          setTimeout(resolve, 1000);
        });
      });
    });
  });
};

const validateElementForCapture = (element: HTMLElement | null): boolean => {
  // Primeira verificação: elemento existe e está no DOM
  if (!element) {
    console.error('Elemento é nulo ou undefined');
    return false;
  }

  if (!document.contains(element)) {
    console.error('Elemento não está no DOM');
    return false;
  }

  // Aguardar próximo frame para obter dimensões atualizadas
  const rect = element.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(element);
  
  const isVisible = rect.width > 0 && rect.height > 0;
  const isDisplayed = computedStyle.display !== 'none';
  const isNotHidden = computedStyle.visibility !== 'hidden';
  const hasContent = element.scrollHeight > 0 && element.scrollWidth > 0;
  
  console.log(`Validação do elemento:`, {
    isVisible,
    isDisplayed,
    isNotHidden,
    hasContent,
    rect: { width: rect.width, height: rect.height },
    scrollDimensions: { width: element.scrollWidth, height: element.scrollHeight },
    className: element.className,
    id: element.id
  });
  
  return isVisible && isDisplayed && isNotHidden && hasContent;
};

export const processPageElement = async (pageElement: HTMLElement, pageIndex: number): Promise<string> => {
  console.log(`=== PROCESSANDO PÁGINA ${pageIndex + 1} ===`);
  
  // Verificação crítica: elemento não pode ser nulo
  if (!pageElement) {
    throw new Error(`Elemento da página ${pageIndex + 1} é nulo ou undefined`);
  }
  
  // Verificar se o elemento ainda está no DOM
  if (!document.contains(pageElement)) {
    throw new Error(`Elemento da página ${pageIndex + 1} não está mais no DOM`);
  }
  
  // Aguardar estabilização do layout com tempo maior
  console.log('Aguardando estabilização do layout...');
  await waitForElementToBeReady(pageElement);
  
  // Validar elemento antes da captura com verificação de nulidade
  if (!validateElementForCapture(pageElement)) {
    throw new Error(`Página ${pageIndex + 1} não está válida para captura`);
  }

  console.log('Iniciando captura da página...', {
    scrollWidth: pageElement.scrollWidth,
    scrollHeight: pageElement.scrollHeight,
    offsetWidth: pageElement.offsetWidth,
    offsetHeight: pageElement.offsetHeight,
    clientWidth: pageElement.clientWidth,
    clientHeight: pageElement.clientHeight
  });

  // Configurações mais robustas para html2canvas
  const canvas = await html2canvas(pageElement, {
    scale: 1.5,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: false,
    logging: false,
    imageTimeout: 25000,
    removeContainer: true,
    width: pageElement.scrollWidth,
    height: pageElement.scrollHeight,
    windowWidth: Math.max(pageElement.scrollWidth, 1200),
    windowHeight: Math.max(pageElement.scrollHeight, 800),
    onclone: (clonedDoc, clonedElement) => {
      console.log('Processando documento clonado...');
      
      // CORREÇÃO CRÍTICA: Verificar se o elemento clonado existe antes de usar
      if (!clonedElement) {
        console.error('❌ ERRO CRÍTICO: Elemento não foi clonado corretamente!');
        throw new Error('Elemento não encontrado no documento clonado - possível problema de seletor');
      }
      
      console.log('✅ Elemento clonado com sucesso:', {
        tagName: clonedElement.tagName,
        className: clonedElement.className,
        id: clonedElement.id
      });
      
      // Verificar se é HTMLElement antes de aplicar estilos
      if (clonedElement instanceof HTMLElement) {
        // Garantir que o elemento clonado seja visível
        clonedElement.style.display = 'block';
        clonedElement.style.visibility = 'visible';
        clonedElement.style.opacity = '1';
        console.log('Elemento clonado configurado para visibilidade');
      }
      
      // Configurar imagens no documento clonado com verificação de nulidade
      const clonedImages = clonedDoc.querySelectorAll('img');
      console.log(`Configurando ${clonedImages.length} imagens no documento clonado`);
      
      clonedImages.forEach((img, idx) => {
        if (img instanceof HTMLImageElement) {
          img.crossOrigin = 'anonymous';
          img.style.display = 'block';
          img.style.maxWidth = '100%';
          console.log(`Imagem ${idx + 1} configurada:`, img.src);
        }
      });
    }
  });
  
  if (!canvas) {
    throw new Error(`Falha ao criar canvas para página ${pageIndex + 1}`);
  }
  
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
    
    // Fallback para primeira página - tentar com configurações mais simples
    if (pageIndex === 0) {
      console.log('Tentando fallback simplificado para a primeira página...');
      
      try {
        // Verificação adicional antes do fallback
        if (!pageElement) {
          throw new Error('Elemento da página é nulo no fallback');
        }
        
        // Aguardar mais tempo antes do fallback
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar novamente se o elemento está válido
        if (!document.contains(pageElement)) {
          throw new Error('Elemento não está mais no DOM após aguardar');
        }
        
        if (!validateElementForCapture(pageElement)) {
          throw new Error('Elemento não passou na validação durante fallback');
        }
        
        const simpleCanvas = await html2canvas(pageElement, {
          scale: 1,
          useCORS: false,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: true,
          imageTimeout: 10000,
          onclone: (clonedDoc, clonedElement) => {
            console.log('Fallback: configurando documento clonado...');
            if (clonedElement instanceof HTMLElement) {
              clonedElement.style.display = 'block';
              clonedElement.style.visibility = 'visible';
            }
          }
        });
        
        if (!simpleCanvas) {
          throw new Error('Fallback também falhou ao criar canvas');
        }
        
        const simpleImg = simpleCanvas.toDataURL("image/jpeg", 0.7);
        console.log('✅ Primeira página processada com fallback simplificado');
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
