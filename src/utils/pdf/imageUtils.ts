
export const waitForImage = (img: HTMLImageElement): Promise<void> => {
  return new Promise((resolve) => {
    if (img.complete && img.naturalHeight !== 0) {
      console.log('Imagem já carregada:', img.src);
      resolve();
      return;
    }
    
    const timeout = setTimeout(() => {
      console.warn('Timeout ao carregar imagem, continuando mesmo assim:', img.src);
      resolve();
    }, 15000);

    img.onload = () => {
      console.log('Imagem carregada com sucesso:', img.src);
      clearTimeout(timeout);
      resolve();
    };
    
    img.onerror = (error) => {
      console.error('Erro ao carregar imagem, continuando mesmo assim:', img.src, error);
      clearTimeout(timeout);
      resolve();
    };
  });
};

export const preloadImages = async (element: HTMLElement): Promise<void> => {
  console.log('=== INICIANDO PRÉ-CARREGAMENTO DE IMAGENS ===');
  const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
  console.log(`Encontradas ${images.length} imagens para carregar`);
  
  if (images.length === 0) {
    console.log('Nenhuma imagem encontrada, prosseguindo');
    return;
  }

  // Configurar todas as imagens primeiro
  images.forEach((img, index) => {
    console.log(`Configurando imagem ${index + 1}:`, img.src);
    img.crossOrigin = 'anonymous';
    
    // Cache busting mais simples
    if (!img.src.includes('?t=')) {
      const separator = img.src.includes('?') ? '&' : '?';
      img.src = img.src + separator + 't=' + Date.now();
    }
  });

  // Aguardar carregamento em lotes menores para evitar sobrecarga
  const batchSize = 3;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    console.log(`Processando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.length/batchSize)}`);
    
    const batchPromises = batch.map(async (img, batchIndex) => {
      const globalIndex = i + batchIndex;
      console.log(`Aguardando carregamento da imagem ${globalIndex + 1}/${images.length}`);
      await waitForImage(img);
      console.log(`Imagem ${globalIndex + 1} processada`);
    });

    await Promise.allSettled(batchPromises);
    
    // Pequena pausa entre lotes
    if (i + batchSize < images.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('Aguardando tempo adicional para renderização...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  console.log('Pré-carregamento concluído');
};
