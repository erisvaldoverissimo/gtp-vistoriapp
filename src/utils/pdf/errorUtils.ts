
export const getErrorMessage = (error: any): string => {
  let errorMessage = "Não foi possível gerar o PDF.";
  
  if (error.message.includes('imagem') || error.message.includes('image')) {
    errorMessage = "Erro ao processar imagens. Algumas fotos podem estar corrompidas ou inacessíveis.";
  } else if (error.message.includes('página') || error.message.includes('page')) {
    errorMessage = "Erro ao processar páginas do relatório. Tente aguardar o carregamento completo antes de gerar o PDF.";
  } else if (error.message.includes('Nenhuma página')) {
    errorMessage = "Nenhum conteúdo encontrado para gerar o PDF. Verifique se a vistoria possui dados e fotos.";
  } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    errorMessage = "Timeout durante o processamento. Tente novamente com uma conexão mais estável.";
  } else if (error.message.includes('canvas') || error.message.includes('Canvas')) {
    errorMessage = "Erro na renderização do conteúdo. Tente recarregar a página e gerar novamente.";
  }
  
  return errorMessage;
};

export const logPageDetails = (pages: HTMLElement[]) => {
  console.log(`=== ANÁLISE DAS PÁGINAS ===`);
  console.log(`Páginas encontradas: ${pages.length}`);
  
  pages.forEach((page, index) => {
    const pageInfo = {
      index: index + 1,
      className: page.className,
      scrollHeight: page.scrollHeight,
      scrollWidth: page.scrollWidth,
      offsetHeight: page.offsetHeight,
      offsetWidth: page.offsetWidth,
      childrenCount: page.children.length,
      hasImages: page.querySelectorAll('img').length,
      visibility: window.getComputedStyle(page).visibility,
      display: window.getComputedStyle(page).display
    };
    console.log(`Página ${index + 1} detalhes:`, pageInfo);
  });
};

export const validatePages = (reportElement: HTMLElement): HTMLElement[] => {
  const pages = Array.from(
    reportElement.querySelectorAll(".page")
  ) as HTMLElement[];

  logPageDetails(pages);

  if (pages.length === 0) {
    console.error('ERRO: Nenhuma página encontrada!');
    console.log('Tentando buscar elementos alternativos...');
    
    const allDivs = Array.from(reportElement.querySelectorAll('div'));
    console.log(`Total de divs encontradas: ${allDivs.length}`);
    
    const possiblePages = allDivs.filter(div => 
      div.offsetHeight > 500 || 
      div.scrollHeight > 500 ||
      div.className.includes('min-h-screen')
    );
    console.log(`Possíveis páginas encontradas: ${possiblePages.length}`);
    
    throw new Error('Nenhuma página encontrada para processar. Verifique se o conteúdo foi carregado corretamente.');
  }

  return pages;
};
