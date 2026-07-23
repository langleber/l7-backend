const nodemailer = require('nodemailer');

// Troque pelo domínio real do seu site no GitHub Pages assim que souber
// (ex: 'https://seuusuario.github.io'). Por enquanto aceita qualquer origem
// para facilitar os testes.
const ALLOWED_ORIGIN = '*';

module.exports = async (req, res) => {
  // CORS - permite que o site no GitHub Pages chame esta função
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' });
  }

  try {
    const { empresa, servico, titulo, email, contato_adicional, mensagem } = req.body || {};

    // Validação básica dos campos obrigatórios
    if (!empresa || !servico || !titulo || !email || !mensagem) {
      return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"Site L7 Systems" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `Orçamento — ${titulo} (${empresa})`,
      text:
        `Empresa: ${empresa}\n` +
        `Serviço desejado: ${servico}\n` +
        `Título: ${titulo}\n` +
        `E-mail para contato: ${email}\n` +
        `Contato adicional: ${contato_adicional || '-'}\n\n` +
        `Mensagem:\n${mensagem}`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    return res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
};
