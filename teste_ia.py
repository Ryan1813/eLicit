import json

# Simulação da resposta da IA após ler um edital em PDF
def analisar_edital_mock(texto_edital):
    # Aqui entraria a chamada real à API (OpenAI/Gemini)
    resultado_json = {
        "objeto": "Aquisição de equipamentos de informática para a Prefeitura.",
        "valor_estimado": 200000.00,
        "data_limite": "2026-11-15T23:59:59",
        "documentos_exigidos": [
            "Certidão de Regularidade Fiscal",
            "Balanço Patrimonial",
            "Contrato Social"
        ]
    }
    return json.dumps(resultado_json, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    print("Processando edital...")
    json_saida = analisar_edital_mock("Texto longo do edital...")
    print(json_saida)