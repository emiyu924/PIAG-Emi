# Snake que joga sozinho

A cobra joga sozinha com uma rede neural pequena. Abra `index.html` no navegador (Chrome, Edge ou Firefox). O primeiro carregamento treina a rede nesta máquina e guarda o cérebro no navegador. Nas próximas vezes ela já entra jogando.

Para repetir a prova automática:

```bash
node test.mjs
```

## Por que este método

Três caminhos comuns fazem uma rede jogar Snake:

| Método | Como aprende | Tempo até jogar bem |
| --- | --- | --- |
| Q-learning / DQN | tenta, erra, e ajusta um valor para cada situação | minutos ou mais |
| Algoritmo genético | cria centenas de redes, fica com as que comem mais e mistura os pesos | dezenas de segundos |
| Clonagem comportamental | um professor rápido joga, e a rede só aprende a copiar a jogada | cerca de 1 segundo |

A clonagem é a mais rápida e ainda deixa a **rede** decidir cada passo da partida. O professor só existe na hora de montar os exemplos e, se você quiser, no botão **Professor**, para comparar.

No teste automático (`node test.mjs`, semente 7) o professor segue um circuito que visita cada casa e limpa o tabuleiro: 141 maçãs, o teto da grade 12×12. A rede copia essa jogada com acerto de 100% e também limpa o tabuleiro nas partidas de prova. O treino no teste leva cerca de 1 segundo. Na página ele aparece passo a passo e leva um pouco mais, porque a tela é atualizada no meio.

## Passo a passo

### 1. As regras

O arquivo `brain.js` guarda um tabuleiro de 12 por 12. A cobra ocupa três células e anda para a direita. Cada jogada é relativa à cabeça: esquerda, em frente ou direita. Assim a rede nunca recebe a ordem de dar meia-volta de uma vez.

Bater na parede ou no corpo encerra a partida. A célula do rabo fica livre, porque o rabo sai dali no mesmo passo, a menos que a cobra vá comer e crescer. A maçã aumenta o tamanho em um. Se ela ficar centenas de passos sem comer, a partida também acaba: isso corta os loops em que ela só gira.

### 2. O que a rede enxerga

Antes de cada passo, `features` mede os três lados e monta 24 números entre 0 e 1:

- vai morrer se for para esse lado
- quanto espaço livre sobra, comparado com o tamanho da cobra
- distância da maçã em quarteirões
- distância da maçã pelo caminho que desvia do corpo (1 se não tem caminho)
- se, depois do passo, ainda dá para alcançar o rabo
- se existe um caminho até a maçã que não fecha a cobra
- se aquele lado é o próximo passo de um circuito que passa por todas as casas

Esses números são os sensores. A rede não vê o tabuleiro pixel a pixel.

### 3. O professor

`teacherAction` não é uma rede. A cobra nasce em três casas seguidas de um circuito que visita cada casa do tabuleiro uma vez e volta ao começo. O professor anda sempre para a próxima casa desse circuito. A maçã está numa casa vazia do mesmo caminho, então a cabeça chega nela sem entrar no próprio corpo. Quando não sobra casa vazia, a partida está limpa.

Esse professor serve de gabarito. Uma volta inteira cabe em 144 passos, menos do que o limite em que a cobra morre de fome por andar em círculo.

### 4. A rede

São três camadas, sem biblioteca externa:

- 24 entradas
- 32 neurônios no meio, com ativação que liga quando o sinal é positivo e deixa passar só um fio quando é negativo (leaky ReLU)
- 3 saídas: esquerda, em frente, direita

As saídas passam por uma softmax, que transforma os três números em porcentagens que somam 100%. Na partida, a rede escolhe a maior.

Os pesos começam aleatórios (inicialização de He) e são guardados em listas numéricas. Dá para ler `createNet` e `forward` de cima a baixo.

### 5. O treino

`trainAndEval` faz três fases, e a página mostra cada uma:

1. **Exemplos.** O professor joga várias partidas. Cada situação vira um par (24 sensores, jogada certa). O teto é 12 mil pares.
2. **Épocas.** Várias passadas por esses pares. O erro é a entropia cruzada: a rede é punida quando dá pouca probabilidade para a jogada do professor. O otimizador Adam mexe nos pesos na direção que diminui esse erro. Jogadas raras (os giros) pesam um pouco mais, para a rede não aprender só a seguir em frente.
3. **Prova.** A rede joga partidas novas, sem o professor, e a página mostra a média de maçãs.

O cérebro treinado fica em `localStorage`. **Treinar de novo** sorteia outra semente e repete o processo.

### 6. A partida

`ui.js` desenha o feltro, a cobra e a maçã. A cada passo chama `chooseNet`, desenha as três barras e aplica a jogada. A barra mais alta é a opinião da rede. O fundo verde marca a jogada que realmente entrou no tabuleiro. Com o professor no controle, as duas podem divergir: é o jeito de ver onde a cópia erra.

Espaço pausa. O controle de velocidade vai de 4 a 36 passos por segundo.
