/* Passo a passo didático por produto. As temperaturas e doses seguem as regras do ateliê (PROD e PASSOS em dados.js). */

export const FORMULA = {
  titulo: 'Como montar uma fórmula',
  passos: [
    ['Escolha a protagonista', 'É a essência que dá nome ao produto. Veja no Estoque em camadas onde ela entra: topo, coração ou fundo.'],
    ['Complete as camadas que faltam', 'Toda fórmula precisa de topo, coração e fundo. Se a protagonista é topo, procure um coração e um fundo; o Círculo sugere quatro combinações prontas.'],
    ['Distribua o peso', 'Topo 40%, coração 35% e fundo 25%. Com patchouli ou vetiver no fundo, use 45%, 40% e 15%, porque são fortes.'],
    ['Calcule a dose total', 'Multiplique a base pela dose do produto: 110 g de cera × 9,1% = 10 g de essência. O Círculo e a Bancada fazem a conta.'],
    ['Teste pequeno antes', 'Pingue as essências numa tira de papel na proporção da fórmula e cheire na hora, aos 30 minutos e às 2 horas. Se uma nota some ou domina, ajuste antes de gastar material.'],
    ['Registre tudo', 'Anote no Diário de testes o que fez e o que mudar. É o registro que transforma um teste fraco em receita aprovada.']
  ]
}

export const GUIAS = {
  vela: {
    nome: 'Vela',
    resumo: 'Cera de coco em banho-maria, essência a até 10% e cura de 7 dias antes de avaliar.',
    materiais: ['Cera de coco (110 g por lata)', 'Essência para vela (até 10 g para 110 g de cera)', 'Pavio fixado no fundo do recipiente', 'Termômetro', 'Panela para banho-maria e jarra de derreter', 'Balança de 0,1 g e seringa para doses abaixo de 2 g'],
    passos: [
      ['Prepare o recipiente', '', 'Limpe e seque a lata ou o pote e fixe o pavio bem no centro, com cola ou adesivo de pavio. Prenda a ponta num prendedor para ele não tombar.'],
      ['Derreta a cera em banho-maria', '60 a 70 °C', 'Fogo direto queima a cera e altera o cheiro. O banho-maria aquece por igual.'],
      ['Tire do fogo e espere esfriar', '60 °C', 'Essência em cera muito quente evapora antes de a vela ficar pronta: é uma das causas de cheiro fraco.'],
      ['Junte as essências e mexa por 2 minutos', '60 °C', 'Comece pelas de fundo, que são mais pesadas. Mexa devagar, sem fazer bolhas, para a essência se ligar à cera.'],
      ['Despeje no recipiente', '55 a 60 °C', 'Despeje devagar e pela lateral. Acima de 60 °C a superfície tende a afundar; abaixo de 55 °C fica irregular.'],
      ['Deixe endurecer 24 horas', '', 'Não mexa nem leve à geladeira. O resfriamento rápido racha a cera e afasta a essência.'],
      ['Corte o pavio e cure 7 dias', '0,5 cm', 'Na cura, a essência se integra à cera. Avaliar antes disso engana: a vela parece fraca.']
    ],
    avaliar: ['Aroma frio: cheire a vela apagada, depois da cura, e dê nota de 1 a 5.', 'Aroma quente: acenda por 1 hora num cômodo fechado, saia e volte. Dê outra nota de 1 a 5.', 'Na primeira queima, deixe a poça derretida chegar à borda: isso evita o túnel no meio da vela.'],
    erros: ['Cheiro fraco: verifique se houve cura de 7 dias, se a fórmula tem fundo e se a essência entrou a 60 °C. As velas em lata v1 foram avaliadas com 5 dias.', 'Uma essência só (Mar aberto v1): sem coração e sem fundo, o cheiro some rápido.', 'Essência demais (Sala de Estar v2, 22 ml): acima de 10% a cera não segura, a vela sua e pode queimar mal.'],
    seguranca: ['Essência para vela não vai na pele.', 'Nunca deixe cera no fogo sem supervisão.']
  },
  sabonete: {
    nome: 'Sabonete em barra',
    resumo: 'Base glicerinada derretida sem ferver, essência cosmética a 3% fora do fogo.',
    materiais: ['Base glicerinada (de preferência 100% vegetal)', 'Manteiga (manga ou maracujá) e óleo de babaçu', 'Argila ou leite em pó, quando a receita pede', 'Essência cosmética (3% da massa)', 'Borrifador com álcool', 'Forma de silicone e filme plástico'],
    passos: [
      ['Corte e derreta a base em banho-maria', 'sem ferver', 'Se a base ferve, fica opaca, cheia de bolhas e com cheiro de queimado.'],
      ['Junte a manteiga e o babaçu', '', 'Se houver leite em pó, misture antes na manteiga. A argila entra em pasta, já diluída num pouco de base. Assim não empelota.'],
      ['Tire do fogo e junte as essências', '65 °C', 'A base não volta ao fogo depois da essência. Calor demais evapora o perfume e deixa o cheiro de álcool da base dominar.'],
      ['Despeje na forma e borrife álcool', '', 'O álcool estoura as bolhas da superfície.'],
      ['Desenforme e embrulhe depois de 2 horas', '', 'A glicerina puxa umidade do ar e a barra "sua". O filme plástico protege.']
    ],
    avaliar: ['Espuma e dureza no primeiro banho.', 'Como a pele fica depois: macia, oleosa ou ressecada.', 'Se o cheiro aparece na água ou se predomina o cheiro da base.'],
    erros: ['Cheiro leve com fundo de álcool (Flor de Figo v1): essência a 2% e sem fundo. A v2 subiu para 3% e ganhou patchouli.', 'Água oleosa e caju que não aparece (Barra suave de caju): gordura demais e essência de menos.', 'Barra que resseca (Caju v1): gordura de menos. A v3 fica no meio-termo.'],
    seguranca: ['Use só essência cosmética ou óleo essencial. Essência para vela não vai na pele.', 'Teste no antebraço antes de usar no rosto.']
  },
  manteiga: {
    nome: 'Manteiga corporal',
    resumo: 'Manteiga e babaçu derretidos em fogo baixo, gelados até ficarem firmes e batidos com essência a 1%.',
    materiais: ['Manteiga vegetal (35 g por pote)', 'Óleo de babaçu', 'Polvilho doce, para tirar a sensação oleosa', 'Essência cosmética (cerca de 10 gotas por pote de 50 g)', 'Mini mixer', 'Pote limpo e seco'],
    passos: [
      ['Derreta a manteiga com o babaçu', 'fogo baixo', 'Só até derreter. Calor demais deixa a manteiga granulada depois.'],
      ['Gele até ficar opaca e firme por cima', '', 'A mistura precisa estar meio sólida para segurar o ar quando for batida.'],
      ['Junte o polvilho e as gotas de essência', '', 'Essência a 1%: na pele, menos é mais. Topo 5 gotas, coração 3, fundo 2.'],
      ['Bata de 3 a 5 minutos e envase', '', 'Bater incorpora ar e deixa a textura leve, de chantili.'],
      ['Espere 24 horas e teste no antebraço', '', 'A textura final só aparece depois de firmar. O teste mostra se há irritação.']
    ],
    avaliar: ['Textura no pote e na pele.', 'Tempo de absorção.', 'Se o cheiro aparece sem incomodar.'],
    erros: ['Manteiga granulada: aqueceu demais ou esfriou devagar. Derreta de novo, em fogo baixo, e gele rápido.'],
    seguranca: ['Use só essência cosmética.', 'Guarde longe do calor.']
  },
  liquido: {
    nome: 'Sabonete líquido',
    resumo: 'Tudo em temperatura ambiente: base, extrato glicólico e essência hidrossolúvel a 0,5%.',
    materiais: ['Base líquida glicerinada', 'Extrato glicólico', 'Essência hidrossolúvel (0,5%)', 'Frasco com válvula'],
    passos: [
      ['Coloque a base e o extrato glicólico', 'ambiente', 'Sabonete líquido não vai ao fogo.'],
      ['Junte as essências e mexa sem bater', 'ambiente', 'Bater faz espuma e incorpora ar, que demora a sair.'],
      ['Descanse 24 horas antes de usar', '', 'As bolhas sobem e o cheiro se assenta.']
    ],
    avaliar: ['Se a essência se misturou por inteiro, sem gotas na superfície.', 'Cheiro nas mãos depois de enxaguar.'],
    erros: ['Gotas de óleo boiando: a essência não é hidrossolúvel. Confira o rótulo.'],
    seguranca: ['Base com lauril: só uso em casa, não para venda.']
  },
  cabelo: {
    nome: 'Shampoo e condicionador',
    resumo: 'Barras com óleos essenciais. Uso próprio: a venda exige registro na ANVISA.',
    materiais: ['Shampoo: SCI, álcool cetílico, manteiga, babaçu, glicerina, polvilho, argila', 'Condicionador: BTMS-50, álcool cetílico, manteiga, babaçu, andiroba, azeite, glicerina', 'Óleos essenciais (1%)', 'Máscara e luvas para o pó de SCI', 'Forma firme'],
    passos: [
      ['Shampoo: derreta a base até virar pasta', '70 °C', 'O SCI não derrete por completo: vira uma pasta. Use máscara, porque o pó irrita.'],
      ['Shampoo: misture o polvilho e a argila fora do fogo', '', 'Dão firmeza à barra.'],
      ['Shampoo: junte os óleos essenciais', '45 °C', 'Óleo essencial é mais sensível ao calor que a essência.'],
      ['Shampoo: pressione bem na forma', '', 'Sem pressão a barra esfarela. Desenforme após 24 a 48 horas.'],
      ['Condicionador: derreta BTMS e gorduras', '80 °C', 'O BTMS só funciona se derreter por completo, por isso precisa de mais calor.'],
      ['Condicionador: junte os óleos líquidos e depois os essenciais', '50 °C', 'Enforme e espere endurecer.']
    ],
    avaliar: ['Espuma e limpeza no shampoo.', 'Desembaraço e peso no cabelo com o condicionador.'],
    erros: ['Barra esfarelando: faltou pressão na forma ou sobrou pó.'],
    seguranca: ['Uso próprio. A venda exige registro na ANVISA.']
  }
}
