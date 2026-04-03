function normalizeErrorText(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  return `${error.code || ''} ${error.message || ''}`.trim();
}

export function isFirebaseSetupError(error) {
  const text = normalizeErrorText(error).toUpperCase();

  return (
    text.includes('CONFIGURATION_NOT_FOUND')
    || text.includes('AUTH/CONFIGURATION-NOT-FOUND')
    || text.includes('AUTH/INVALID-API-KEY')
    || text.includes('API KEY NOT VALID')
    || text.includes('AUTH/OPERATION-NOT-ALLOWED')
    || text.includes('AUTH/UNAUTHORIZED-DOMAIN')
  );
}

export function getFirebaseSetupMessage(error) {
  const text = normalizeErrorText(error).toUpperCase();

  if (text.includes('CONFIGURATION_NOT_FOUND') || text.includes('AUTH/CONFIGURATION-NOT-FOUND')) {
    return 'O Firebase Auth deste projeto ainda não foi configurado no console. Ative Authentication para liberar login real.';
  }

  if (text.includes('AUTH/INVALID-API-KEY') || text.includes('API KEY NOT VALID')) {
    return 'As chaves públicas do Firebase não batem com um app web válido. Revise o .env.local antes de continuar.';
  }

  if (text.includes('AUTH/OPERATION-NOT-ALLOWED')) {
    return 'O método de login escolhido ainda não está ativado no Firebase Auth.';
  }

  if (text.includes('AUTH/UNAUTHORIZED-DOMAIN')) {
    return 'O domínio atual ainda não foi autorizado no Firebase Auth. Adicione localhost e depois o domínio da Vercel.';
  }

  return 'O Firebase ainda não está pronto para autenticação real. Enquanto isso, a Conta Teste continua disponível.';
}
