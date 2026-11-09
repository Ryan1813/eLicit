"""
Medição da PoC de leitura de editais por IA (eLicit, seção 19.2-b)  -  v2

Dois modos, escolhidos automaticamente:
  - COM chave (ANTHROPIC_API_KEY definida): conta tokens reais, roda o edital
    inteiro e dividido em partes, registra tempo, JSON válido e ERROS exatos.
  - SEM chave: mede só tamanho (KB), páginas e caracteres e dá uma ESTIMATIVA
    de tokens (caracteres / 3,5, típico de português). Estimativa NÃO é dado
    medido: no documento, rotule como "estimativa".


pip install pypdf anthropic
    export ANTHROPIC_API_KEY=...        # opcional, mas necessário p/ dados reais
    python medir_poc_ia_v2.py edital_pequeno.pdf edital_medio.pdf edital_grande.pdf

Saída: resultados_poc_ia.csv + impressão em tela.
Rode com 3+ editais de tamanhos diferentes. Se o PDF for escaneado (sem texto
extraível), "caracteres" virá ~0: isso também é um achado a documentar (exige OCR).
"""
import csv
import json
import os
import sys
import time

from pypdf import PdfReader

MODELO = "claude-sonnet-5-5"      # troque pelo modelo definido na seção 19.1
LIMITE_CHUNK_TOKENS = 8000        # tamanho alvo de cada parte
CHARS_POR_TOKEN = 3.5             # só para o modo estimativa
PROMPT = (
    "Leia o trecho do edital e devolva APENAS um JSON com as chaves: "
    "objeto, valor_estimado, data_limite, documentos_exigidos (lista), "
    "criterios_julgamento. Use null quando a informação não estiver no trecho.\n\n"
)


def extrair_paginas(caminho):
    leitor = PdfReader(caminho)
    return [(p.extract_text() or "") for p in leitor.pages]


def json_valido(txt):
    try:
        json.loads(txt)
        return True
    except Exception:
        return False


def contar_tokens(client, texto):
    if client is None:
        return round(len(texto) / CHARS_POR_TOKEN)
    r = client.messages.count_tokens(
        model=MODELO, messages=[{"role": "user", "content": texto}]
    )
    return r.input_tokens


def chamar_llm(client, texto):
    t0 = time.time()
    resp = client.messages.create(
        model=MODELO, max_tokens=2000,
        messages=[{"role": "user", "content": PROMPT + texto}],
    )
    return (resp.content[0].text, resp.usage.input_tokens,
            resp.usage.output_tokens, time.time() - t0)


def dividir_em_partes(client, paginas):
    partes, atual, tok = [], [], 0
    for pg in paginas:
        t = contar_tokens(client, pg) if pg.strip() else 0
        if atual and tok + t > LIMITE_CHUNK_TOKENS:
            partes.append("\n".join(atual))
            atual, tok = [], 0
        atual.append(pg)
        tok += t
    if atual:
        partes.append("\n".join(atual))
    return partes


def main(arquivos):
    client = None
    if os.environ.get("ANTHROPIC_API_KEY"):
        from anthropic import Anthropic
        client = Anthropic()
    modo = "COM API (dados reais)" if client else "SEM API (tokens = estimativa)"
    print(f"Modo: {modo}\n")

    linhas = []
    for arq in arquivos:
        paginas = extrair_paginas(arq)
        texto = "\n".join(paginas)
        reg = {
            "arquivo": os.path.basename(arq),
            "tamanho_kb": round(os.path.getsize(arq) / 1024, 1),
            "paginas": len(paginas),
            "caracteres": len(texto),
            "tokens_documento": contar_tokens(client, texto),
            "tokens_origem": "medido" if client else "estimativa",
        }
        if client:
            try:  # Teste A: edital inteiro
                s, tin, tout, dur = chamar_llm(client, texto)
                reg.update(inteiro_ok=True, inteiro_tokens_in=tin,
                           inteiro_tokens_out=tout, inteiro_segundos=round(dur, 1),
                           inteiro_json_valido=json_valido(s), inteiro_erro="")
            except Exception as e:  # erro EXATO = dado que o professor quer
                reg.update(inteiro_ok=False,
                           inteiro_erro=f"{type(e).__name__}: {e}")
            try:  # Teste B: dividido em partes (RF-024)
                partes = dividir_em_partes(client, paginas)
                tin_t = tout_t = ok = 0
                t0 = time.time()
                for p in partes:
                    s, tin, tout, _ = chamar_llm(client, p)
                    tin_t += tin
                    tout_t += tout
                    ok += json_valido(s)
                reg.update(partes_n=len(partes), partes_tokens_in=tin_t,
                           partes_tokens_out=tout_t,
                           partes_segundos=round(time.time() - t0, 1),
                           partes_json_validos=f"{ok}/{len(partes)}")
            except Exception as e:
                reg.update(partes_erro=f"{type(e).__name__}: {e}")
        linhas.append(reg)
        print(json.dumps(reg, ensure_ascii=False, indent=2))

    campos = sorted({k for r in linhas for k in r})
    with open("resultados_poc_ia.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        w.writerows(linhas)
    print("\nSalvo em resultados_poc_ia.csv")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    main(sys.argv[1:])
