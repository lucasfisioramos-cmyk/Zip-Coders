import { enviarEmail } from './email.js'
import { STATUS_DB_TO_API } from './mapping.js'

function escaparHtml(valor) {
  const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return String(valor).replace(/[&<>"']/g, (caractere) => entidades[caractere])
}

function linkDaOrdem(codigo) {
  const base = process.env.FRONTEND_URL || (process.env.SMTP_HOST ? undefined : 'http://localhost:5173')
  if (!base) throw new Error('Configure FRONTEND_URL para os links das notificações.')
  const url = new URL(base)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('FRONTEND_URL deve ser uma URL HTTP ou HTTPS sem credenciais.')
  }
  url.pathname = url.pathname.replace(/\/$/, '') + '/historico/' + encodeURIComponent(codigo)
  url.search = ''
  url.hash = ''
  return url.href
}

async function notificar(ordem, assunto, mensagem) {
  const responsavel = ordem.responsavel
  if (!responsavel?.ativo || !responsavel.email) return
  const link = linkDaOrdem(ordem.codigo)

  await enviarEmail({
    to: [responsavel.email],
    subject: '[Altave] ' + assunto + ' ' + ordem.codigo,
    text: `Olá, ${responsavel.nome}.\n\n${mensagem}\n${ordem.codigo} — ${ordem.titulo}\n\nAbrir ordem: ${link}`,
    html: `<p>Olá, ${escaparHtml(responsavel.nome)}.</p>
<p>${escaparHtml(mensagem)}</p>
<p><strong>${escaparHtml(ordem.codigo)}</strong> — ${escaparHtml(ordem.titulo)}</p>
<p><a href="${escaparHtml(link)}">Abrir ordem de serviço</a></p>`,
  })
}

function registrarFalha(ordem, erro) {
  console.error('Falha na notificação da OS ' + ordem.codigo + ':', erro.message)
}

export function notificarAtribuicao(ordem) {
  void notificar(ordem, 'Nova atribuição:', 'Uma ordem de serviço foi atribuída a você.')
    .catch((erro) => registrarFalha(ordem, erro))
}

export function notificarMudancaStatus(ordem, statusAnterior) {
  if (statusAnterior === ordem.status) return
  const de = STATUS_DB_TO_API[statusAnterior]
  const para = STATUS_DB_TO_API[ordem.status]
  void notificar(ordem, 'Status atualizado:', `O status da sua ordem mudou de “${de}” para “${para}”.`)
    .catch((erro) => registrarFalha(ordem, erro))
}
