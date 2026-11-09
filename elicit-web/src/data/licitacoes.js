// Dados de exemplo (mock) para o Dashboard.
// Os nomes dos campos (objeto, valor_estimado, data_limite, prioritaria) são os
// MESMOS do model Licitacao do Django. Assim, quando a API existir, basta trocar
// este array por um fetch() sem mexer no Dashboard.

const UM_DIA = 24 * 60 * 60 * 1000;
const agora = Date.now();

// Cria uma data "daqui a N dias", para o exemplo sempre ter prazos próximos
// do dia em que você abrir o sistema (senão os dados ficariam vencidos).
const emDias = (n) => new Date(agora + n * UM_DIA).toISOString();

export const licitacoesMock = [
  {
    id: 1,
    objeto: 'Aquisição de equipamentos de informática',
    orgao: 'Prefeitura Municipal de Anápolis',
    valor_estimado: 200000.0,
    data_limite: emDias(2),
    prioritaria: 1, // 1 = alta prioridade (RNE-005)
    status: 'Em revisão',
  },
  {
    id: 2,
    objeto: 'Contratação de serviços de limpeza e conservação',
    orgao: 'Secretaria Municipal de Educação',
    valor_estimado: 480000.0,
    data_limite: emDias(3),
    prioritaria: 0,
    status: 'Pronta',
  },
  {
    id: 3,
    objeto: 'Fornecimento de material de escritório',
    orgao: 'Câmara Municipal',
    valor_estimado: 35000.5,
    data_limite: emDias(9),
    prioritaria: 0,
    status: 'Em análise',
  },
  {
    id: 4,
    objeto: 'Manutenção preventiva de veículos da frota',
    orgao: 'Secretaria Municipal de Saúde',
    valor_estimado: 120000.0,
    data_limite: emDias(15),
    prioritaria: 1,
    status: 'Em análise',
  },
  {
    id: 5,
    objeto: 'Serviços de impressão e reprografia',
    orgao: 'Fundo Municipal de Assistência Social',
    valor_estimado: 64000.0,
    data_limite: emDias(-1), // já encerrada (RNE-007)
    prioritaria: 0,
    status: 'Enviada',
  },
];
