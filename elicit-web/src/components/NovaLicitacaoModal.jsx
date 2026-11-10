import { useEffect, useState } from 'react';

// Converte uma data para o formato que o <input type="datetime-local"> entende
// (AAAA-MM-DDTHH:mm, no horário local).
const paraInputLocal = (data) => {
  const dois = (n) => String(n).padStart(2, '0');
  return (
    `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}` +
    `T${dois(data.getHours())}:${dois(data.getMinutes())}`
  );
};

// Modal de cadastro manual de licitação (RF-008).
// Props:
//   onSalvar(dados) -> chamada quando o formulário é válido
//   onFechar()      -> chamada ao cancelar / fechar
function NovaLicitacaoModal({ onSalvar, onFechar }) {
  const [objeto, setObjeto] = useState('');
  const [orgao, setOrgao] = useState('');
  const [valor, setValor] = useState('');
  const [prazo, setPrazo] = useState('');
  const [prioritaria, setPrioritaria] = useState(false);
  const [erros, setErros] = useState({});
  // "Agora" calculado uma única vez, quando o modal abre. Serve de data mínima
  // no campo de prazo (o navegador desabilita datas passadas no calendário).
  const [prazoMinimo] = useState(() => paraInputLocal(new Date()));

  // Fecha o modal ao apertar Esc.
  useEffect(() => {
    const aoApertar = (e) => {
      if (e.key === 'Escape') onFechar();
    };
    window.addEventListener('keydown', aoApertar);
    return () => window.removeEventListener('keydown', aoApertar);
  }, [onFechar]);

  // Regras de validação. Retorna um objeto { campo: 'mensagem' }.
  // Objeto vazio = formulário válido.
  const validar = () => {
    const novos = {};

    // RF-008: objeto, prazo e valor estimado são obrigatórios.
    if (!objeto.trim()) {
      novos.objeto = 'Informe o objeto da licitação.';
    }

    // RNE-008: valores financeiros devem ser maiores que zero.
    const valorNumero = Number(valor);
    if (valor === '' || Number.isNaN(valorNumero)) {
      novos.valor = 'Informe o valor estimado.';
    } else if (valorNumero <= 0) {
      novos.valor = 'O valor deve ser maior que zero.';
    }

    // RNE-007: depois do prazo, o sistema bloqueia propostas. Cadastrar uma
    // licitação que já venceu não faz sentido, então exigimos prazo futuro.
    if (!prazo) {
      novos.prazo = 'Informe o prazo final.';
    } else if (new Date(prazo).getTime() <= Date.now()) {
      novos.prazo = 'O prazo deve ser uma data futura.';
    }

    return novos;
  };

  const aoEnviar = (e) => {
    e.preventDefault();
    const novos = validar();
    setErros(novos);
    if (Object.keys(novos).length > 0) return; // há erro: não salva

    onSalvar({
      objeto: objeto.trim(),
      orgao: orgao.trim() || 'Não informado',
      valor_estimado: Number(valor),
      data_limite: new Date(prazo).toISOString(),
      prioritaria: prioritaria ? 1 : 0, // RNE-005: lógica binária
    });
  };

  return (
    // Clicar no fundo escuro fecha o modal; clicar dentro da caixa não.
    <div className="modal-fundo" onClick={onFechar}>
      <div
        className="modal-caixa"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="modal-titulo">Nova licitação</h2>

        <form onSubmit={aoEnviar} noValidate>
          <div className="campo">
            <label htmlFor="nl-objeto">Objeto *</label>
            <textarea
              id="nl-objeto"
              rows={3}
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              placeholder="Ex.: Aquisição de equipamentos de informática"
              autoFocus
            />
            {erros.objeto && <span className="campo-erro">{erros.objeto}</span>}
          </div>

          <div className="campo">
            <label htmlFor="nl-orgao">Órgão (opcional)</label>
            <input
              id="nl-orgao"
              type="text"
              value={orgao}
              onChange={(e) => setOrgao(e.target.value)}
              placeholder="Ex.: Prefeitura Municipal"
            />
          </div>

          <div className="campo-linha">
            <div className="campo">
              <label htmlFor="nl-valor">Valor estimado (R$) *</label>
              <input
                id="nl-valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
              {erros.valor && <span className="campo-erro">{erros.valor}</span>}
            </div>

            <div className="campo">
              <label htmlFor="nl-prazo">Prazo final *</label>
              <input
                id="nl-prazo"
                type="datetime-local"
                value={prazo}
                min={prazoMinimo}
                onChange={(e) => setPrazo(e.target.value)}
              />
              {erros.prazo && <span className="campo-erro">{erros.prazo}</span>}
            </div>
          </div>

          <label className="campo-check">
            <input
              type="checkbox"
              checked={prioritaria}
              onChange={(e) => setPrioritaria(e.target.checked)}
            />
            Marcar como prioritária
          </label>

          <div className="modal-acoes">
            <button type="button" className="btn-secundario" onClick={onFechar}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario">
              Salvar licitação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovaLicitacaoModal;
