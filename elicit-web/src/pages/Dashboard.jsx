import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { licitacoesMock } from '../data/licitacoes';
import NovaLicitacaoModal from '../components/NovaLicitacaoModal';
import './Dashboard.css';

const UM_DIA = 24 * 60 * 60 * 1000;
const DIAS_ALERTA = 3; // RNE-009: alerta quando faltar 3 dias ou menos

// Quantos dias faltam até a data limite (negativo = já encerrou).
function diasRestantes(dataLimite) {
  return Math.ceil((new Date(dataLimite).getTime() - Date.now()) / UM_DIA);
}

const formatarMoeda = (valor) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (iso) => new Date(iso).toLocaleDateString('pt-BR');

// Transforma "Em revisão" em "em-revisao" para virar nome de classe CSS.
const classeStatus = (status) =>
  'badge badge-' +
  status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-');

const MENU = ['Dashboard', 'Licitações', 'Propostas', 'Meus Documentos', 'Chat Suporte IA'];

function Dashboard() {
  const navigate = useNavigate();
  const [licitacoes, setLicitacoes] = useState(licitacoesMock);
  const [busca, setBusca] = useState('');
  const [somentePrioritarias, setSomentePrioritarias] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false); // modal aberto ou fechado

  // RF-008: recebe os dados já validados do modal e coloca a nova licitação
  // no topo da lista. O Dashboard cria o id e define o status inicial.
  const adicionarLicitacao = (dados) => {
    setLicitacoes((atual) => {
      const novoId = Math.max(0, ...atual.map((l) => l.id)) + 1;
      return [{ id: novoId, status: 'Em análise', ...dados }, ...atual];
    });
    setMostrarForm(false);
  };

  // RNE-005 / RF-010: prioridade em lógica binária. 1 vira 0 e 0 vira 1.
  const alternarPrioridade = (id) => {
    setLicitacoes((atual) =>
      atual.map((l) => (l.id === id ? { ...l, prioritaria: 1 - l.prioritaria } : l)),
    );
  };

  // Licitações que aparecem na tabela, depois de aplicar busca e filtro.
  const visiveis = licitacoes.filter((l) => {
    const texto = (l.objeto + ' ' + l.orgao).toLowerCase();
    const passaBusca = texto.includes(busca.toLowerCase());
    const passaPrioridade = !somentePrioritarias || l.prioritaria === 1;
    return passaBusca && passaPrioridade;
  });

  // Números dos cards de resumo (calculados a partir da lista completa).
  const emAndamento = licitacoes.filter((l) => diasRestantes(l.data_limite) >= 0).length;
  const propostasProntas = licitacoes.filter((l) => l.status === 'Pronta').length;
  const prazosCriticos = licitacoes.filter((l) => {
    const d = diasRestantes(l.data_limite);
    return d >= 0 && d <= DIAS_ALERTA;
  }).length;

  return (
    <div className="dash">
      {/* Menu lateral */}
      <aside className="dash-sidebar">
        <div className="dash-logo">eLicit</div>
        <nav>
          {MENU.map((item) => (
            <a
              key={item}
              href="#"
              className={'dash-menu-item' + (item === 'Dashboard' ? ' ativo' : '')}
              onClick={(e) => e.preventDefault()}
            >
              {item}
            </a>
          ))}
        </nav>
        <button className="dash-sair" onClick={() => navigate('/')}>
          Sair
        </button>
      </aside>

      {/* Conteúdo principal */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>Dashboard</h1>
            <p>Acompanhe suas licitações, propostas e prazos em um só lugar.</p>
          </div>
          <button className="btn-primario" onClick={() => setMostrarForm(true)}>
            + Nova licitação
          </button>
        </header>

        {prazosCriticos > 0 && (
          <div className="dash-alerta" role="alert">
            Atenção: {prazosCriticos}{' '}
            {prazosCriticos === 1 ? 'licitação encerra' : 'licitações encerram'} em até{' '}
            {DIAS_ALERTA} dias.
          </div>
        )}

        {/* Cards de resumo */}
        <section className="dash-cards">
          <div className="dash-card">
            <span className="dash-card-num">{emAndamento}</span>
            <span className="dash-card-rotulo">Licitações em andamento</span>
          </div>
          <div className="dash-card">
            <span className="dash-card-num">{propostasProntas}</span>
            <span className="dash-card-rotulo">Propostas prontas</span>
          </div>
          <div className="dash-card critico">
            <span className="dash-card-num">{prazosCriticos}</span>
            <span className="dash-card-rotulo">Prazos críticos (≤ {DIAS_ALERTA} dias)</span>
          </div>
        </section>

        {/* Lista de licitações */}
        <section className="dash-lista">
          <div className="dash-filtros">
            <input
              type="text"
              placeholder="Buscar por objeto ou órgão..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <label>
              <input
                type="checkbox"
                checked={somentePrioritarias}
                onChange={(e) => setSomentePrioritarias(e.target.checked)}
              />
              Só prioritárias
            </label>
          </div>

          <div className="dash-tabela-wrap">
            <table className="dash-tabela">
              <thead>
                <tr>
                  <th aria-label="Prioridade"></th>
                  <th>Objeto</th>
                  <th>Valor estimado</th>
                  <th>Prazo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((l) => {
                  const dias = diasRestantes(l.data_limite);
                  const encerrada = dias < 0;
                  const critico = !encerrada && dias <= DIAS_ALERTA;
                  return (
                    <tr key={l.id} className={encerrada ? 'encerrada' : ''}>
                      <td>
                        <button
                          className={'estrela' + (l.prioritaria === 1 ? ' ligada' : '')}
                          onClick={() => alternarPrioridade(l.id)}
                          aria-label={
                            l.prioritaria === 1 ? 'Remover prioridade' : 'Marcar como prioritária'
                          }
                          title={l.prioritaria === 1 ? 'Prioritária' : 'Marcar como prioritária'}
                        >
                          {l.prioritaria === 1 ? '★' : '☆'}
                        </button>
                      </td>
                      <td>
                        <strong>{l.objeto}</strong>
                        <div className="orgao">{l.orgao}</div>
                      </td>
                      <td>{formatarMoeda(l.valor_estimado)}</td>
                      <td>
                        {formatarData(l.data_limite)}
                        <div className={'dias' + (critico ? ' critico' : '')}>
                          {encerrada
                            ? 'Encerrada'
                            : dias === 0
                              ? 'Encerra hoje'
                              : `${dias} ${dias === 1 ? 'dia' : 'dias'}`}
                        </div>
                      </td>
                      <td>
                        <span className={classeStatus(l.status)}>{l.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {visiveis.length === 0 && (
                  <tr>
                    <td colSpan={5} className="vazio">
                      Nenhuma licitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* O modal só existe na tela enquanto mostrarForm for true */}
      {mostrarForm && (
        <NovaLicitacaoModal
          onSalvar={adicionarLicitacao}
          onFechar={() => setMostrarForm(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
