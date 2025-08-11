import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface RelatorioVistoriaEmailProps {
  nomeCondominio: string
  numeroInterno: string
  dataVistoria: string
  accessUrl: string
}

export const RelatorioVistoriaEmail = ({
  nomeCondominio,
  numeroInterno, 
  dataVistoria,
  accessUrl,
}: RelatorioVistoriaEmailProps) => (
  <Html>
    <Head />
    <Preview>Relatório de Vistoria - {nomeCondominio} ({numeroInterno})</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header com logo e título */}
        <Section style={header}>
          <Row>
            <Column style={headerContent}>
              <Heading style={headerTitle}>Sistema GTP</Heading>
              <Text style={headerSubtitle}>Relatório de Vistoria Técnica</Text>
            </Column>
          </Row>
        </Section>

        {/* Conteúdo principal */}
        <Section style={content}>
          <Heading style={h2}>Relatório Disponível</Heading>
          
          <Text style={greeting}>Olá!</Text>
          
          <Text style={paragraph}>
            O relatório de vistoria técnica foi finalizado e está disponível para download.
            Você pode acessar o documento completo através do link seguro abaixo.
          </Text>

          {/* Informações da vistoria */}
          <Section style={infoBox}>
            <Row>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>📍 Empreendimento:</Text>
              </Column>
              <Column style={infoValue}>
                <Text style={infoValueText}>{nomeCondominio}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>🔢 Número Interno:</Text>
              </Column>
              <Column style={infoValue}>
                <Text style={infoValueText}>{numeroInterno}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>📅 Data da Vistoria:</Text>
              </Column>
              <Column style={infoValue}>
                <Text style={infoValueText}>{new Date(dataVistoria).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</Text>
              </Column>
            </Row>
            
            <Row>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>⏰ Enviado em:</Text>
              </Column>
              <Column style={infoValue}>
                <Text style={infoValueText}>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </Column>
            </Row>
          </Section>

          {/* Botão de acesso */}
          <Section style={buttonContainer}>
            <Link href={accessUrl} style={button}>
              📄 Acessar Relatório PDF
            </Link>
          </Section>

          {/* Informações de segurança */}
          <Section style={securityBox}>
            <Heading style={securityTitle}>🔒 Informações de Segurança</Heading>
            <Text style={securityText}>
              • Este link é único e válido por 7 dias
            </Text>
            <Text style={securityText}>
              • O acesso é protegido e auditado
            </Text>
            <Text style={securityText}>
              • Você pode baixar o PDF quantas vezes precisar
            </Text>
            <Text style={securityText}>
              • O documento contém todas as informações técnicas da vistoria
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={helpText}>
            Se você tiver dificuldades para acessar o relatório ou precisar de esclarecimentos sobre o conteúdo, 
            entre em contato com o responsável pela vistoria.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Este email foi enviado automaticamente pelo Sistema de Vistorias GTP.
          </Text>
          <Text style={footerText}>
            <strong>Não responda este email.</strong> Para suporte, entre em contato através dos canais oficiais.
          </Text>
          <Text style={footerCopyright}>
            © {new Date().getFullYear()} Sistema GTP - Todos os direitos reservados
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RelatorioVistoriaEmail

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  borderRadius: '12px',
  margin: '40px auto',
  padding: '0',
  width: '600px',
  maxWidth: '100%',
}

const header = {
  background: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)',
  borderRadius: '12px 12px 0 0',
  padding: '40px 30px',
  textAlign: 'center' as const,
}

const headerContent = {
  textAlign: 'center' as const,
}

const headerTitle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
}

const headerSubtitle = {
  color: '#E0E7FF',
  fontSize: '16px',
  margin: '0',
  fontWeight: '300',
}

const content = {
  padding: '40px 30px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
}

const greeting = {
  color: '#374151',
  fontSize: '16px',
  margin: '0 0 16px 0',
}

const paragraph = {
  color: '#6B7280',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
}

const infoBox = {
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const infoLabel = {
  width: '140px',
  verticalAlign: 'top',
  paddingBottom: '12px',
}

const infoValue = {
  verticalAlign: 'top',
  paddingBottom: '12px',
}

const infoLabelText = {
  color: '#6B7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
}

const infoValueText = {
  color: '#1F2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#10B981',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.25)',
  transition: 'all 0.2s ease-in-out',
}

const securityBox = {
  backgroundColor: '#EFF6FF',
  border: '1px solid #BFDBFE',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const securityTitle = {
  color: '#1E40AF',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
}

const securityText = {
  color: '#1E40AF',
  fontSize: '14px',
  margin: '0 0 6px 0',
  lineHeight: '1.4',
}

const hr = {
  border: 'none',
  borderTop: '1px solid #E5E7EB',
  margin: '32px 0',
}

const helpText = {
  color: '#6B7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
  fontStyle: 'italic',
}

const footer = {
  backgroundColor: '#F9FAFB',
  borderTop: '1px solid #E5E7EB',
  borderRadius: '0 0 12px 12px',
  padding: '24px 30px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '1.4',
  margin: '0 0 8px 0',
}

const footerCopyright = {
  color: '#9CA3AF',
  fontSize: '11px',
  margin: '16px 0 0 0',
}