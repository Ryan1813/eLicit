from django.db import models


class Empresa(models.Model):
    razao_social = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=14, unique=True)
    area_atuacao = models.CharField(max_length=100)


class Usuario(models.Model):
    nome = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)
    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)  # Valida RNE-002


class Licitacao(models.Model):
    objeto = models.TextField()
    valor_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    data_limite = models.DateTimeField()
    prioritaria = models.IntegerField(default=0)  # 0 ou 1 (RNE-005)
