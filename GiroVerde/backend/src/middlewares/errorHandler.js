// Middleware global para captura de erros não tratados
export function errorHandler(err, req, res, next) {
  console.error('[Erro]', err.stack || err.message);
  return res.status(500).json({
    mensagem: 'Ocorreu um erro interno no servidor.'
  });
}

