# T1 MÉTODOS ANALÍTICOS

## Getting started
Para rodar o projeto, é necessário ter Node instalado. O arquivo de entrada deve se chamar model.json e estar na pasta raiz do projeto.

Para instalar as dependências rode: 

npm run setup

Para rodar o projeto, basta utilizar o comando:

npm run start

***

# Definição das filas
O arquivo de definição deve ser um arquivo JSON com a seguinte estrutura:
initialArrivals: tempo de chegada inicial de cada fila.
O objeto queues define as filas, com os seguintes atributos:
- servers: número de servidores da fila
- capacity: capacidade da fila. Omita o atributo para capacidade infinita.
- minArrival: tempo mínimo de chegada
- maxArrival: tempo máximo de chegada
- minService: tempo mínimo de serviço
- maxService: tempo máximo de serviço
passagens: lista de passagens de clientes entre filas, com os seguintes atributos:
- origin: fila de origem
- destination: fila de destino
- probability: probabilidade de passagem (para saída da fila, considere (1 - soma de probabilidade de passagens para outras filas))
  qtyOfRandomNumbers: quantidade de números aleatórios a serem gerados
  seed: semente para geração de números pseudoaleatórios

Desenvolvido por Patrick Bomm, Eduardo Martinbiancho e Lucas Barros.

```json
{
    "initialArrivals": {
        "Q1": 2.0
    },
    "queues": {
        "Q1": {
            "servers": 1,
            "minArrival": 2.0,
            "maxArrival": 4.0,
            "minService": 1.0,
            "maxService": 2.0
        },
        "Q2": {
            "servers": 2,
            "capacity": 5,
            "minService": 4.0,
            "maxService": 8.0
        },
        "Q3": {
            "servers": 2,
            "capacity": 10,
            "minService": 5.0,
            "maxService": 15.0
        }
    },
    "passages": [
        {
            "origin": "Q1",
            "destination": "Q2",
            "probability": 0.8
        },
        {
            "origin": "Q1",
            "destination": "Q3",
            "probability": 0.2
        },
        {
            "origin": "Q2",
            "destination": "Q3",
            "probability": 0.5
        },
        {
            "origin": "Q2",
            "destination": "Q1",
            "probability": 0.3
        },
        {
            "origin": "Q3",
            "destination": "Q2",
            "probability": 0.7
        }
    ],
    "qtyOfRandomNumbers": 100000,
    "seed": 5
}