
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Vistoria {
  id: string;
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  ambiente: string;
  status: string;
  responsavel: string;
  fotosCount: number;
  observacoes?: string;
  condominioId?: string;
  idSequencial?: number;
}

interface FotoComDescricao extends File {
  descricao?: string;
}

interface GrupoVistoria {
  id: string;
  ambiente: string;
  grupo: string;
  item: string;
  status: string;
  parecer: string;
  fotos: FotoComDescricao[];
}

interface VistoriaData {
  condominio: string;
  numeroInterno: string;
  dataVistoria: string;
  observacoes: string;
  responsavel: string;
  grupos: GrupoVistoria[];
}

export const generateVistoriaPDFFromPreview = async (data: VistoriaData) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  
  // Criar um elemento temporário no DOM com o layout do PreviewPDF
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '-9999px';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '210mm';
  tempDiv.style.background = '#fff';
  tempDiv.style.fontFamily = 'Arial, sans-serif';
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  let currentPageNumber = 0;
  
  // Gerar páginas para cada grupo
  for (const grupo of data.grupos) {
    for (let idx = 0; idx < grupo.fotos.length; idx += 2) {
      currentPageNumber++;
      
      const pageContent = `
        <div class="page" style="width: 210mm; height: 297mm; padding: 10mm; background: #fff; page-break-after: always; break-after: always; font-family: Arial, sans-serif;">
          ${idx === 0 ? `
            <!-- Cabeçalho -->
            <div style="background: #5845a3; color: white; padding: 16px; border-radius: 8px 8px 0 0; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center;">
                <img src="/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png" alt="GTP Logo Left" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
              <div style="text-align: center;">
                <h1 style="font-size: 21px; font-weight: bold; margin: 0;">Relatório de Vistoria Técnica - GTP</h1>
                <p style="color: #c4b5fd; font-size: 14px; margin: 4px 0 0 0;">Sistema de Vistorias Prediais</p>
              </div>
              <div style="display: flex; align-items: center;">
                <img src="/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png" alt="GTP Logo Right" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
            </div>

            <!-- Informações da Vistoria -->
            <div style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px;">
                <div>
                  <span style="font-weight: 600;">Data de emissão:</span>
                  <br />
                  ${formatDate(new Date().toISOString())}
                </div>
                <div>
                  <span style="font-weight: 600;">Hora:</span>
                  <br />
                  ${getCurrentTime()}
                </div>
                <div>
                  <span style="font-weight: 600;">Usuário:</span>
                  <br />
                  ${data.responsavel || 'Não informado'}
                </div>
                <div>
                  <span style="font-weight: 600;">Empreendimento:</span>
                  <br />
                  ${data.condominio}
                </div>
                <div style="grid-column: span 2;">
                  <span style="font-weight: 600;">Nº interno da vistoria:</span>
                  <br />
                  ${data.numeroInterno}
                </div>
                <div style="grid-column: span 2;">
                  <span style="font-weight: 600;">Data da vistoria:</span>
                  <br />
                  ${formatDate(data.dataVistoria)}
                </div>
              </div>
            </div>

            <!-- Sistema de Vistoria -->
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 8px; color: #5845a3;">
              Sistema de Vistoria ${data.grupos.indexOf(grupo) + 1}
            </h3>
            
            <!-- Tabela -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; font-size: 12px; margin-bottom: 16px;">
              <thead>
                <tr style="background: #5845a3; color: white;">
                  <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 15%;">Ambiente</th>
                  <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 15%;">Sistema</th>
                  <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 15%;">Subsistema</th>
                  <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 12%;">Status</th>
                  <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center; width: 43%;">Parecer</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle;">${grupo.ambiente}</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle;">${grupo.grupo}</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle;">${grupo.item}</td>
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; ${
                      grupo.status === 'N/A' ? 'background: #e5e7eb; color: #374151;' :
                      grupo.status === 'Conforme' ? 'background: #10b981; color: white;' :
                      grupo.status === 'Não Conforme' ? 'background: #ef4444; color: white;' :
                      'background: #f59e0b; color: white;'
                    }">${grupo.status}</span>
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center; vertical-align: middle; word-break: break-word;">${grupo.parecer.length > 200 ? grupo.parecer.substring(0, 200) + '...' : grupo.parecer}</td>
                </tr>
              </tbody>
            </table>
          ` : `
            <!-- Cabeçalho para páginas de continuação -->
            <div style="background: #5845a3; color: white; padding: 16px; border-radius: 8px 8px 0 0; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; align-items: center;">
                <img src="/lovable-uploads/9e07dcd0-b996-4996-9028-7daeb90e3140.png" alt="GTP Logo Left" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
              <div style="text-align: center;">
                <h1 style="font-size: 21px; font-weight: bold; margin: 0;">Relatório de Vistoria Técnica - GTP</h1>
                <p style="color: #c4b5fd; font-size: 14px; margin: 4px 0 0 0;">Sistema de Vistorias Prediais</p>
              </div>
              <div style="display: flex; align-items: center;">
                <img src="/lovable-uploads/bfe02df4-f545-4232-ad0a-e69690083a38.png" alt="GTP Logo Right" style="width: 80px; height: 80px; object-fit: contain;" />
              </div>
            </div>
          `}

          ${idx === 0 ? 
            `<h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #5845a3;">Evidências Fotográficas - Sistema ${data.grupos.indexOf(grupo) + 1}</h4>` :
            `<h4 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #5845a3;">Evidências Fotográficas - Sistema ${data.grupos.indexOf(grupo) + 1} (Continuação)</h4>`
          }
          
          <!-- Fotos -->
          <div style="display: flex; gap: 16px; margin-bottom: 16px; flex: 1;">
            ${grupo.fotos[idx] ? `
              <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; flex: 1;">
                <img src="${URL.createObjectURL(grupo.fotos[idx])}" alt="Foto ${idx + 1} - Sistema ${data.grupos.indexOf(grupo) + 1}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
                <div>
                  <p style="font-size: 12px; font-weight: 500; margin: 0 0 4px 0;">
                    Foto ${String(idx + 1).padStart(2, '0')} - Sistema ${data.grupos.indexOf(grupo) + 1}
                  </p>
                  <p style="font-size: 12px; color: #374151; line-height: 1.4; margin: 0; word-break: break-word;">
                    ${(grupo.fotos[idx] as any).descricao || 'Evidência fotográfica da vistoria'}
                  </p>
                </div>
              </div>
            ` : ''}
            
            ${grupo.fotos[idx + 1] ? `
              <div style="border: 1px solid #d1d5db; border-radius: 8px; padding: 8px; flex: 1;">
                <img src="${URL.createObjectURL(grupo.fotos[idx + 1])}" alt="Foto ${idx + 2} - Sistema ${data.grupos.indexOf(grupo) + 1}" style="width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
                <div>
                  <p style="font-size: 12px; font-weight: 500; margin: 0 0 4px 0;">
                    Foto ${String(idx + 2).padStart(2, '0')} - Sistema ${data.grupos.indexOf(grupo) + 1}
                  </p>
                  <p style="font-size: 12px; color: #374151; line-height: 1.4; margin: 0; word-break: break-word;">
                    ${(grupo.fotos[idx + 1] as any).descricao || 'Evidência fotográfica da vistoria'}
                  </p>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Observações Gerais (se houver) -->
          ${data.observacoes ? `
            <div style="margin-bottom: 8px;">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #5845a3;">Observações Gerais</h3>
              <p style="font-size: 12px; color: #374151; background: #f9fafb; padding: 8px; border-radius: 4px; line-height: 1.3; margin: 0; word-break: break-word;">
                ${data.observacoes.length > 150 ? data.observacoes.substring(0, 150) + '...' : data.observacoes}
              </p>
            </div>
          ` : ''}

          <!-- Rodapé -->
          <div style="margin-top: auto; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0;">Relatório gerado automaticamente pelo Sistema de Vistorias - ${formatDate(new Date().toISOString())} às ${getCurrentTime()}</p>
            <p style="font-weight: 500; margin: 0;">Página ${currentPageNumber}/${Math.ceil(data.grupos.reduce((acc, g) => acc + g.fotos.length, 0) / 2)}</p>
          </div>
        </div>
      `;
      
      tempDiv.innerHTML = pageContent;
      document.body.appendChild(tempDiv);
      
      // Converter para canvas e adicionar ao PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      
      const img = canvas.toDataURL("image/png");
      if (currentPageNumber > 1) pdf.addPage();
      pdf.addImage(
        img,
        "PNG",
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight()
      );
      
      document.body.removeChild(tempDiv);
    }
  }

  const fileName = `Relatorio-${data.numeroInterno}-${data.condominio.replace(/\s+/g, "-")}.pdf`;
  pdf.save(fileName);
  return fileName;
};

// Função para converter dados simples de Vistoria para formato completo
export const generateVistoriaPDF = (vistoria: Vistoria) => {
  // Criar dados mock no formato esperado pelo PreviewPDF
  const vistoriaData: VistoriaData = {
    condominio: vistoria.condominio,
    numeroInterno: vistoria.numeroInterno,
    dataVistoria: vistoria.dataVistoria,
    observacoes: vistoria.observacoes || 'Vistoria realizada conforme procedimentos',
    responsavel: vistoria.responsavel,
    grupos: [
      {
        id: '1',
        ambiente: vistoria.ambiente,
        grupo: 'Sistema Geral',
        item: 'Subsistema Geral',
        status: vistoria.status,
        parecer: vistoria.observacoes || 'Vistoria realizada conforme procedimentos',
        fotos: [] // Fotos não disponíveis neste contexto
      }
    ]
  };

  // Usar a função PDF simplificada para dados sem fotos
  return generateSimplePDF(vistoriaData);
};

// Função simplificada para PDFs sem fotos
const generateSimplePDF = (data: VistoriaData) => {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Cabeçalho com fundo roxo
  pdf.setFillColor(88, 69, 159);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text('Relatório de Vistoria Técnica - GTP', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('Sistema de Vistorias Prediais', pageWidth / 2, 32, { align: 'center' });
  
  // Informações da vistoria
  pdf.setTextColor(0, 0, 0);
  pdf.setFillColor(245, 245, 245);
  pdf.rect(20, 50, pageWidth - 40, 30, 'F');
  
  pdf.setFontSize(10);
  let yPos = 58;
  
  // Primeira linha
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data de emissão:', 25, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(new Date().toISOString()), 25, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Hora:', 70, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(getCurrentTime(), 70, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Usuário:', 115, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.responsavel, 115, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Empreendimento:', 160, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.condominio, 160, yPos + 5);
  
  // Segunda linha
  yPos += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Nº interno da vistoria:', 25, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.numeroInterno, 25, yPos + 5);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Data da vistoria:', 115, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(data.dataVistoria), 115, yPos + 5);
  
  // Sistema de Vistoria
  yPos = 95;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(88, 69, 159);
  pdf.text('Sistema de Vistoria 1', 20, yPos);
  
  yPos += 10;
  
  // Cabeçalho da tabela
  pdf.setFillColor(88, 69, 159);
  pdf.rect(20, yPos, pageWidth - 40, 8, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const colWidths = [30, 30, 30, 24, 56];
  let xPos = 20;
  
  pdf.text('Ambiente', xPos + colWidths[0]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[0];
  pdf.text('Sistema', xPos + colWidths[1]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[1];
  pdf.text('Subsistema', xPos + colWidths[2]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[2];
  pdf.text('Status', xPos + colWidths[3]/2, yPos + 5, { align: 'center' });
  xPos += colWidths[3];
  pdf.text('Parecer', xPos + colWidths[4]/2, yPos + 5, { align: 'center' });
  
  // Linha de dados
  yPos += 8;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(20, yPos, pageWidth - 40, 12, 'F');
  
  // Bordas da tabela
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(0.1);
  xPos = 20;
  for (let i = 0; i <= colWidths.length; i++) {
    pdf.line(xPos, yPos - 8, xPos, yPos + 12);
    if (i < colWidths.length) xPos += colWidths[i];
  }
  pdf.line(20, yPos - 8, pageWidth - 20, yPos - 8);
  pdf.line(20, yPos + 12, pageWidth - 20, yPos + 12);
  
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  const grupo = data.grupos[0];
  xPos = 20;
  pdf.text(grupo.ambiente, xPos + colWidths[0]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[0];
  pdf.text(grupo.grupo, xPos + colWidths[1]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[1];
  pdf.text(grupo.item, xPos + colWidths[2]/2, yPos + 6, { align: 'center' });
  xPos += colWidths[2];
  
  // Status com cor
  const statusColor = grupo.status === 'Conforme' ? [76, 175, 80] : 
                     grupo.status === 'Não Conforme' ? [244, 67, 54] : 
                     grupo.status === 'N/A' ? [158, 158, 158] : [255, 193, 7];
  pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.rect(xPos + 2, yPos + 2, colWidths[3] - 4, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.text(grupo.status, xPos + colWidths[3]/2, yPos + 6, { align: 'center' });
  
  xPos += colWidths[3];
  pdf.setTextColor(0, 0, 0);
  const parecerLines = pdf.splitTextToSize(grupo.parecer, colWidths[4] - 4);
  pdf.text(parecerLines, xPos + 2, yPos + 4);
  
  // Observações gerais se existirem
  if (data.observacoes) {
    yPos += 25;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(88, 69, 159);
    pdf.text('Observações Gerais', 20, yPos);
    
    yPos += 8;
    pdf.setFillColor(248, 249, 250);
    pdf.rect(20, yPos, pageWidth - 40, 20, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const obsLines = pdf.splitTextToSize(data.observacoes, pageWidth - 50);
    pdf.text(obsLines, 25, yPos + 5);
  }
  
  // Rodapé
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  pdf.text(
    `Relatório gerado automaticamente pelo Sistema de Vistorias - ${formatDate(new Date().toISOString())} às ${getCurrentTime()}`,
    20,
    pageHeight - 20
  );
  pdf.text('Página 1/1', pageWidth - 40, pageHeight - 20);
  
  const fileName = `Vistoria_${data.numeroInterno}_${data.condominio.replace(/\s+/g, '_')}.pdf`;
  pdf.save(fileName);
  
  return fileName;
};
