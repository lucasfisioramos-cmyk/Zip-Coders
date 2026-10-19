// Express 4 não captura erros de handlers async: sem isso, uma exceção do Prisma
// vira "unhandled rejection" e pode derrubar o processo. Aqui o erro vai pro
// middleware de erro do server.js (resposta 500) e a API continua de pé.
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)
