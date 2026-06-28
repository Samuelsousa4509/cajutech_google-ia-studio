import { Modulo, Quiz, CalendarioAgricola } from './types';

export const BADGES = [
  {
    id: 'primeiro_acesso',
    titulo: 'Primeiro Passo 🌱',
    descricao: 'Acessou o CajuTech pela primeira vez.',
    emoji: '🌱',
    pontosNecessarios: 5,
  },
  {
    id: 'modulo_cultivo',
    titulo: 'Mestre do Cultivo 🌳',
    descricao: 'Concluiu o módulo completo de Cultivo do Caju.',
    emoji: '🌳',
    pontosNecessarios: 100,
  },
  {
    id: 'modulo_derivados',
    titulo: 'Mestre da Castanha 🌰',
    descricao: 'Concluiu o módulo completo de Processamento e Derivados.',
    emoji: '🌰',
    pontosNecessarios: 100,
  },
  {
    id: 'modulo_sustentabilidade',
    titulo: 'Guardião Verde ♻️',
    descricao: 'Concluiu o módulo de Sustentabilidade e Inovação.',
    emoji: '♻️',
    pontosNecessarios: 100,
  },
  {
    id: 'agricultor_digital',
    titulo: 'Agricultor Digital 📱',
    descricao: 'Utilizou o diagnóstico inteligente de pragas por foto.',
    emoji: '📱',
    pontosNecessarios: 20,
  },
  {
    id: 'quiz_mestre',
    titulo: 'Mestre dos Quizzes 🏆',
    descricao: 'Acertou todas as perguntas de um quiz.',
    emoji: '🏆',
    pontosNecessarios: 50,
  },
  {
    id: 'comunidade',
    titulo: 'Voz da Comunidade 💬',
    descricao: 'Publicou uma mensagem ou tirou dúvidas no fórum comunitário.',
    emoji: '💬',
    pontosNecessarios: 15,
  },
  {
    id: 'mestre_do_cultivo',
    titulo: 'Mestre do Plantio 🌳',
    descricao: 'Concluiu o Curso Interativo de Plantio de Caju com dados do Piauí.',
    emoji: '🌳',
    pontosNecessarios: 25,
  }
];

export const CALENDARIO_AGRICOLA: CalendarioAgricola[] = [
  {
    mes: 'Janeiro',
    etapaCultivo: 'Pós-colheita e Descanso',
    atividades: [
      'Realizar a limpeza do pomar recolhendo frutos secos ou caídos no chão.',
      'Iniciar o planejamento de podas de limpeza e remoção de galhos secos/doentes.',
      'Controlar formigas cortadeiras que atacam os brotos novos.'
    ],
    alertas: [
      'Atenção ao aparecimento de sintomas de resinose nos cortes de poda não tratados.'
    ],
    dicas: [
      'Aproveite este período para fazer análise de solo para as adubações futuras.'
    ]
  },
  {
    mes: 'Fevereiro',
    etapaCultivo: 'Preparação para Nova Estação',
    atividades: [
      'Realizar a poda de formação e limpeza dos cajueiros.',
      'Aplicar pasta bordalesa ou cicatrizante nos galhos podados de maior diâmetro.',
      'Fazer aceiros ao redor do pomar para evitar propagação de incêndios sazonais.'
    ],
    alertas: [
      'Fique atento a brotos novos que podem ser atacados por pulgões e tripes.'
    ],
    dicas: [
      'Mantenha a matéria orgânica (folhas secas) ao pé dos cajueiros para conservar umidade.'
    ]
  },
  {
    mes: 'Março',
    etapaCultivo: 'Crescimento Vegetativo',
    atividades: [
      'Fazer adubação de cobertura se houver umidade no solo (início das chuvas).',
      'Roçar o mato entre as linhas de plantio, mantendo o solo protegido.',
      'Monitorar focos da broca-das-pontas nos ramos novos.'
    ],
    alertas: [
      'Período de alta umidade favorece doenças fúngicas. Fique atento a manchas nas folhas.'
    ],
    dicas: [
      'As chuvas de março são excelentes para plantar novas mudas de cajueiro anão precoce.'
    ]
  },
  {
    mes: 'Abril',
    etapaCultivo: 'Crescimento Vegetativo e Floração Inicial',
    atividades: [
      'Continuar monitorando broca-das-pontas e tripes.',
      'Adubar pomares jovens para acelerar o desenvolvimento de ramos.',
      'Verificar o estado das mudas recém-plantadas.'
    ],
    alertas: [
      'O excesso de chuva pode acumular água na base. Garanta boa drenagem do terreno.'
    ],
    dicas: [
      'Utilize caldas orgânicas (calda bordalesa) de forma preventiva contra antracnose.'
    ]
  },
  {
    mes: 'Maio',
    etapaCultivo: 'Início da Emissão de Panículas (Flores)',
    atividades: [
      'Observar as primeiras flores abrindo.',
      'Instalar ou manter colmeias de abelhas nativas próximas para melhorar a polinização.',
      'Realizar capina manual ao redor da projeção da copa.'
    ],
    alertas: [
      'Tripes das flores podem destruir os botões florais antes de abrirem.'
    ],
    dicas: [
      'Evite aplicar produtos químicos fortes durante a floração para não afastar abelhas polinizadoras.'
    ]
  },
  {
    mes: 'Junho',
    etapaCultivo: 'Plena Floração e Frutificação Inicial',
    atividades: [
      'Monitorar a saúde das flores e pequenos frutos (matulões).',
      'Realizar controle biológico de pulgões usando água de fumo ou sabão de coco.',
      'Proteger o pomar contra ventos fortes que quebram galhos e flores.'
    ],
    alertas: [
      'A umidade alta com calor repentino favorece a Antracnose nas flores e frutos jovens.'
    ],
    dicas: [
      'Frutos atacados por fungos devem ser removidos e enterrados longe do pomar.'
    ]
  },
  {
    mes: 'Julho',
    etapaCultivo: 'Desenvolvimento de Frutos',
    atividades: [
      'Acompanhar o crescimento das castanhas e pedúnculos.',
      'Manter o mato sob controle com roçagem baixa.',
      'Preparar as caixas e ferramentas para a próxima colheita.'
    ],
    alertas: [
      'Fique alerta à mosca-da-fruta que põe ovos nos pedúnculos maduros.'
    ],
    dicas: [
      'O cajueiro anão precoce começa a madurar seus primeiros frutos neste mês no Piauí.'
    ]
  },
  {
    mes: 'Agosto',
    etapaCultivo: 'Início da Safra Principal',
    atividades: [
      'Colheita diária dos frutos maduros caídos ou prestes a cair.',
      'Separação imediata da castanha do pedúnculo por torção.',
      'Início do processamento de doces, geleias e cajuína.'
    ],
    alertas: [
      'Frutos deixados no chão por mais de 24h fermentam e perdem valor comercial.'
    ],
    dicas: [
      'Colha nas horas mais frias do dia para preservar a firmeza e qualidade do pedúnculo.'
    ]
  },
  {
    mes: 'Setembro',
    etapaCultivo: 'Pico da Safra e Processamento',
    atividades: [
      'Intensificar a colheita diária.',
      'Processamento de polpa de caju, suco integral e cajuína piauiense.',
      'Secagem correta das castanhas ao sol por 2 a 3 dias antes do armazenamento.'
    ],
    alertas: [
      'A umidade na secagem da castanha pode causar mofo. Seque sobre lonas limpas e elevadas.'
    ],
    dicas: [
      'Cajuína autêntica do Piauí é patrimônio cultural! Siga os passos de higienização e cozimento.'
    ]
  },
  {
    mes: 'Outubro',
    etapaCultivo: 'Final da Safra e Armazenamento',
    atividades: [
      'Finalização da colheita nos pomares de cajueiro comum.',
      'Armazenamento das castanhas em sacos de ráfia limpos e secos, sobre estrados de madeira.',
      'Aproveitamento do bagaço de caju para silagem ou alimentação animal imediata.'
    ],
    alertas: [
      'Evite guardar castanhas em locais úmidos ou em contato direto com o chão.'
    ],
    dicas: [
      'O bagaço seco do caju é uma excelente ração para o gado no período de seca.'
    ]
  },
  {
    mes: 'Novembro',
    etapaCultivo: 'Pós-safra e Preparo de Mudas',
    atividades: [
      'Coleta de sementes selecionadas de cajueiros sadios e produtivos para novos porta-enxertos.',
      'Retirada de frutos velhos que ficaram nos galhos.',
      'Controle preventivo de pragas de armazenamento nas sacas de castanha.'
    ],
    alertas: [
      'Gorgulhos podem infestar castanhas mal secas ou armazenadas incorretamente.'
    ],
    dicas: [
      'Planeje a expansão do pomar adquirindo mudas enxertadas certificadas de viveiros confiáveis.'
    ]
  },
  {
    mes: 'Dezembro',
    etapaCultivo: 'Descanso e Preparo de Covas',
    atividades: [
      'Abertura e adubação de covas para o plantio no início das chuvas (janeiro/fevereiro).',
      'Mistura de esterco bem curtido, superfosfato simples e calcário nas covas.',
      'Revisão de cercas e aceiros do pomar.'
    ],
    alertas: [
      'Período de seca extrema no Piauí exige monitoramento rigoroso contra queimadas.'
    ],
    dicas: [
      'Fazer a cova com antecedência (40x40x40 cm) garante que o solo absorva os nutrientes para as novas mudas.'
    ]
  }
];

export const MODULOS: Modulo[] = [
  {
    id: 'cultivo',
    titulo: 'Cultivo do Cajueiro',
    descricao: 'Aprenda tudo sobre o plantio, irrigação, podas e controle agroecológico de pragas do cajueiro.',
    ordem: 1,
    cor: '#16a34a', // emerald-600
    icone: '🌳',
    aulas: [
      {
        id: 'cultivo_1',
        titulo: 'Introdução ao Cajueiro no Piauí',
        descricao: 'Conheça a história, a importância econômica e social do cajueiro (Anacardium occidentale) para as famílias piauienses.',
        tipo: 'texto',
        duracao: 8,
        ordem: 1,
        conteudo: `# Introdução ao Cajueiro no Nordeste e Piauí

O cajueiro (*Anacardium occidentale*) é uma planta nativa do Brasil, com destaque especial no Nordeste. No estado do Piauí, a cajucultura é uma das principais atividades agrícolas, gerando emprego e renda para milhares de agricultores familiares.

## Importância Social e Econômica
O caju é uma fruta fantástica porque aproveitamos quase tudo dela:
- **A castanha (fruto verdadeiro):** de alto valor comercial, muito exportada.
- **O pedúnculo (pseudofruto):** a carne suculenta e saborosa, usada para sucos, doces, cajuína e alimentação animal.

## Tipos de Cajueiro
1. **Cajueiro Comum:** Árvore grande, porte gigante, inicia produção após 3 a 5 anos e pode viver por décadas.
2. **Cajueiro Anão Precoce:** Porte menor, copa compacta, facilita o manejo e a colheita, e inicia a produção já no primeiro ano após o plantio! É o mais recomendado para novos pomares familiares pela facilidade de irrigação e colheita sem escadas.

*Dica CajuTech:* O Piauí possui regiões excelentes para o cultivo, como Piripiri, Picos, Pio IX e Monsenhor Gil. Identificar o tipo ideal para a sua propriedade é o primeiro passo para o sucesso!`,
        quizId: 'quiz_cultivo'
      },
      {
        id: 'cultivo_2',
        titulo: 'Preparo do Solo e Plantio Eficiente',
        descricao: 'Como preparar o solo piauiense, abrir as covas e plantar as mudas enxertadas do cajueiro anão precoce.',
        tipo: 'video',
        duracao: 12,
        ordem: 2,
        conteudo: 'https://www.youtube.com/embed/S_B78q0Xfco', // Exemplo de vídeo educativo de cajucultura da Embrapa
        quizId: 'quiz_cultivo'
      },
      {
        id: 'cultivo_3',
        titulo: 'Controle Agroecológico de Pragas',
        descricao: 'Como identificar e combater as principais pragas e doenças (como Antracnose e Broca) sem usar agrotóxicos perigosos.',
        tipo: 'texto',
        duracao: 10,
        ordem: 3,
        conteudo: `# Manejo Integrado e Agroecológico de Pragas no Cajueiro

Para manter seu pomar saudável e livre de agrotóxicos nocivos à saúde e ao meio ambiente, prefira sempre o **manejo ecológico**.

## 1. Antracnose (Doença Fúngica)
A antracnose é a doença mais comum no Piauí, causada por um fungo que ataca folhas, flores e frutos jovens, deixando manchas escuras e provocando a queda precoce.
- **Solução Orgânica:** Calda Bordalesa aplicada preventivamente no início das brotações.
- **Manejo:** Podar e recolher todos os galhos doentes e queimar ou enterrar longe do pomar.

## 2. Broca-das-pontas (Praga)
Uma lagarta minúscula que broca as pontas dos ramos novos, fazendo-os murchar e secar.
- **Solução Orgânica:** Poda imediata dos ramos infestados (cerca de 10 cm abaixo da parte seca) e queima dos ramos cortados.
- **Prevenção:** Manter o pomar limpo e pulverizar defensivos naturais como calda de fumo ou óleo de neem nas brotações.

## 3. Formigas Cortadeiras
Podem desfolhar um cajueiro jovem em poucas horas.
- **Solução Orgânica:** Uso de barreiras físicas (cones de plástico no caule) ou iscas ecológicas feitas com gergelim preto seco na trilha das formigas.`,
        quizId: 'quiz_cultivo'
      }
    ]
  },
  {
    id: 'derivados',
    titulo: 'Processamento e Derivados do Caju',
    descricao: 'Aprenda a fazer cajuína piauiense autêntica, polpas, sucos, doces, castanha assada e aproveitar 100% da fruta.',
    ordem: 2,
    cor: '#fbbf24', // yellow-500
    icone: '🌰',
    aulas: [
      {
        id: 'derivados_1',
        titulo: 'A Autêntica Cajuína Piauiense',
        descricao: 'Passo a passo completo e higiênico para produzir a cajuína, patrimônio cultural do Piauí.',
        tipo: 'texto',
        duracao: 15,
        ordem: 1,
        conteudo: `# Como Produzir a Verdadeira Cajuína Piauiense 🌱🥤

A Cajuína é o símbolo máximo da cultura alimentar do Piauí. Ela é uma bebida clarificada, esterilizada e sem adição de açúcares ou corantes artificiais, conservando toda a doçura natural do caju.

## Ingredientes e Utensílios
- Pedúnculos de caju maduros e sadios (caju amarelo ou vermelho)
- Gelatina incolor sem sabor (agente clarificante natural) ou cola de sapotizeiro
- Garrafas de vidro limpas com tampas de metal novas
- Coador de pano limpo e algodão hidrófilo
- Panela grande para banho-maria

## Passo a Passo Simplificado
1. **Seleção e Lavagem:** Selecione apenas os cajus maduros, firmes e sem machucados. Lave bem em água corrente e sanitize em água com cloro.
2. **Extração do Suco:** Esprema os cajus manualmente ou em prensa manual para extrair o suco de caju puro.
3. **Clarificação (O Segredo!):** Adicione a gelatina incolor hidratada ao suco ainda frio (aproximadamente 1 a 2 gramas de gelatina por litro). Mexa bem e deixe descansar por 15 a 20 minutos. A gelatina vai se unir ao tanino do caju, formando flocos que sobem ou descem.
4. **Filtragem:** Filtre o suco decantado usando um funil com algodão e feltro limpo. O líquido deve sair totalmente cristalino e de cor amarelo-claro.
5. **Engarrafamento:** Encha as garrafas de vidro deixando um espaço de 2 cm no gargalo. Tampe hermeticamente com a tampadora manual.
6. **Cozimento (Banho-maria):** Coloque as garrafas em uma panela com água cobrindo-as e ferva por cerca de 40 a 50 minutos. É neste processo que ocorre a caramelização dos açúcares naturais do caju, dando a cor âmbar típica e esterilizando a bebida para durar até 2 anos fora da geladeira!

*Curiosidade CajuTech:* A cajuína é rica em Vitamina C, antioxidantes e não contém álcool, sendo um excelente refresco saudável e energético para toda a família!`,
        quizId: 'quiz_derivados'
      },
      {
        id: 'derivados_2',
        titulo: 'Processamento Seguro da Castanha de Caju',
        descricao: 'Como torrar, descascar e classificar as castanhas de caju mantendo as normas de segurança alimentar.',
        tipo: 'video',
        duracao: 10,
        ordem: 2,
        conteudo: 'https://www.youtube.com/embed/p1oYsh2j-iM',
        quizId: 'quiz_derivados'
      },
      {
        id: 'derivados_3',
        titulo: 'Doces, Geleias e Compotas de Caju',
        descricao: 'Receitas tradicionais de doce de caju ameixa, geleia real e compotas para aumentar a renda da família.',
        tipo: 'texto',
        duracao: 12,
        ordem: 3,
        conteudo: `# Doces, Geleias e Compotas de Caju: Renda o Ano Todo

O caju é uma fruta altamente perecível, estragando rapidamente após colhida. Produzir doces e geleias é a melhor forma de conservar a produção e vender o excedente por um preço muito melhor!

## 1. Doce de Caju em Calda (Compota)
O clássico doce caseiro que agrada a todos.
- **Preparo:** Fure os cajus lavados com um garfo e esprema de leve para tirar parte do suco ácido.
- **Calda:** Faça uma calda com açúcar cristal e água. Adicione os cajus e deixe cozinhar em fogo baixo por cerca de 2 horas, até que fiquem macios e dourados.
- **Dica:** Coloque cravos-da-índia ou canela em pau para dar um toque regional especial!

## 2. Geleia de Caju com Pimenta
Um produto gourmet de alto valor nas feiras piauienses.
- **Preparo:** Bata a polpa do caju no liquidificador com um pouco de água e passe na peneira.
- **Cozimento:** Leve ao fogo com açúcar (metade do peso do suco) e pimenta dedo-de-moça picada bem miudinha (sem sementes). Deixe apurar até dar ponto de fio de geleia.
- **Combinação:** Fica excelente com queijo de coalho assado!`,
        quizId: 'quiz_derivados'
      }
    ]
  },
  {
    id: 'sustentabilidade',
    titulo: 'Sustentabilidade e Inovação',
    descricao: 'Descubra como ter desperdício zero, fazer adubos orgânicos e cooperativismo rural inteligente.',
    ordem: 3,
    cor: '#15803d', // green-700
    icone: '♻️',
    aulas: [
      {
        id: 'sustentabilidade_1',
        titulo: 'Aproveitamento Integral do Caju: Desperdício Zero',
        descricao: 'Como utilizar o bagaço do caju para ração animal de qualidade e compostagem para enriquecer o solo.',
        tipo: 'texto',
        duracao: 10,
        ordem: 1,
        conteudo: `# Desperdício Zero na Cajucultura ♻️🌾

Nas colheitas tradicionais, estima-se que mais de **60% do pedúnculo do caju** seja desperdiçado no chão por falta de canais de processamento rápido. Isso é perda de dinheiro e recursos! O lema do CajuTech é aproveitar tudo.

## Bagas de Caju na Alimentação Animal
O bagaço que sobra da extração do suco para a cajuína ou polpa é um alimento riquíssimo para bovinos, caprinos, ovinos e aves.
- **Silagem de Caju:** O bagaço pode ser ensilado misturado com capim ou cana, gerando um alimento suculento e nutritivo para o gado enfrentar o período de seca severa no sertão piauiense.
- **Farinha de Caju Seco:** Deixar o bagaço secar ao sol sobre lonas cria um farelo seco rico em fibras e carboidratos, excelente para misturar na ração diária das galinhas e porcos.

## Compostagem Orgânica
As folhas que caem do cajueiro e o bagaço azedo podem ser misturados com esterco animal nas pilhas de compostagem.
- **Resultado:** Após 90 dias, você terá um adubo orgânico de altíssima qualidade (húmus) para aplicar de volta nos próprios cajueiros, fechando o ciclo da natureza sem custos com fertilizantes químicos importados!`,
        quizId: 'quiz_sustentabilidade'
      },
      {
        id: 'sustentabilidade_2',
        titulo: 'Empreendedorismo e Cooperativismo no Sertão',
        descricao: 'Como a união de pequenos agricultores em associações e cooperativas ajuda a conseguir melhores preços de venda.',
        tipo: 'texto',
        duracao: 10,
        ordem: 2,
        conteudo: `# Associativismo e Cooperativismo: A Força da União

Vender a produção de caju de forma individualizada para intermediários (atravessadores) geralmente resulta em preços muito baixos, que mal cobrem o custo de colheita. A solução sustentável está na cooperação.

## Vantagens de trabalhar em Associação ou Cooperativa:
1. **Compra Coletiva de Insumos:** Comprar sacarias, garrafas de vidro, caixas de colheita e mudas em grande quantidade garante descontos de até 40%.
2. **Industrialização Compartilhada:** Uma pequena fábrica comunitária de cajuína e doces (mini-agroindústria) registrada permite que todos os membros agreguem valor às suas frutas e acessem mercados formais e supermercados.
3. **Vendas Governamentais:** Cooperativas organizadas conseguem vender diretamente para o governo através do **PNAE (Programa Nacional de Alimentação Escolar)** e **PAA (Programa de Aquisição de Alimentos)**, fornecendo suco de caju e doces para a merenda das escolas públicas locais.

## Cooperativas de Sucesso no Piauí
O Piauí possui excelentes exemplos de cooperativas de cajucultores que exportam castanhas orgânicas certificadas para o mundo todo. O segredo é a padronização da qualidade e a união da comunidade!`,
        quizId: 'quiz_sustentabilidade'
      }
    ]
  }
];

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz_cultivo',
    titulo: 'Quiz do Módulo: Cultivo de Caju',
    moduloId: 'cultivo',
    perguntas: [
      {
        id: 'q_c1',
        enunciado: 'Qual variedade de cajueiro é a mais recomendada para agricultura familiar devido ao início rápido da produção e facilidade de colheita?',
        alternativas: [
          { id: 'a', texto: 'Cajueiro Gigante da Amazônia' },
          { id: 'b', texto: 'Cajueiro Anão Precoce' },
          { id: 'c', texto: 'Cajueiro Selvagem do Cerrado' },
          { id: 'd', texto: 'Cajueiro Comum de Porte Alto' }
        ],
        respostaCorreta: 'b',
        explicacao: 'O Cajueiro Anão Precoce é ideal porque começa a produzir logo no primeiro ano após o plantio, tem porte baixo facilitando o trabalho manual e exige menor espaçamento entre plantas.'
      },
      {
        id: 'q_c2',
        enunciado: 'Qual é a doença fúngica mais comum no Piauí que causa manchas escuras nas folhas, flores e frutos jovens, provocando queda precoce?',
        alternativas: [
          { id: 'a', texto: 'Ferrugem do Cajueiro' },
          { id: 'b', texto: ' Resinose da casca' },
          { id: 'c', texto: 'Antracnose' },
          { id: 'd', texto: 'Oídio das panículas' }
        ],
        respostaCorreta: 'c',
        explicacao: 'A Antracnose é a doença fúngica mais destrutiva na cajucultura do Nordeste, combatida preventivamente com pulverizações de calda bordalesa orgânica.'
      },
      {
        id: 'q_c3',
        enunciado: 'O que o agricultor deve fazer imediatamente ao notar que ramos novos de cajueiro estão murchando e secando devido à Broca-das-pontas?',
        alternativas: [
          { id: 'a', texto: 'Cortar e queimar os ramos afetados 10 cm abaixo da parte seca.' },
          { id: 'b', texto: 'Arrancar a árvore inteira para não espalhar.' },
          { id: 'c', texto: 'Aplicar inseticida químico forte em todo o pomar.' },
          { id: 'd', texto: 'Apenas regar mais o cajueiro afetado.' }
        ],
        respostaCorreta: 'a',
        explicacao: 'A poda sanitária dos ramos atacados pela broca-das-pontas, seguida da queima ou destruição dos cortes, elimina a lagarta fisicamente do pomar, impedindo sua proliferação.'
      }
    ]
  },
  {
    id: 'quiz_derivados',
    titulo: 'Quiz do Módulo: Processamento e Derivados',
    moduloId: 'derivados',
    perguntas: [
      {
        id: 'q_d1',
        enunciado: 'Qual é a finalidade de adicionar gelatina incolor hidratada ao suco de caju durante o preparo da cajuína?',
        alternativas: [
          { id: 'a', texto: 'Dar mais doçura e consistência cremosa.' },
          { id: 'b', texto: 'Conservar a bebida por mais de 5 anos.' },
          { id: 'c', texto: 'Clarificar o suco, unindo-se aos taninos para facilitar a filtragem.' },
          { id: 'd', texto: 'Aumentar o teor alcoólico da cajuína.' }
        ],
        respostaCorreta: 'c',
        explicacao: 'A gelatina atua como um clarificante natural. Ela se aglutina com os taninos insolúveis do caju, formando coágulos que são facilmente retidos no filtro de pano e algodão, deixando o suco perfeitamente translúcido.'
      },
      {
        id: 'q_d2',
        enunciado: 'Como é obtida a bela cor âmbar dourada típica da autêntica cajuína do Piauí?',
        alternativas: [
          { id: 'a', texto: 'Pelo uso de corante caramelo artificial.' },
          { id: 'b', texto: 'Pela caramelização dos açúcares naturais do caju durante o cozimento em banho-maria.' },
          { id: 'c', texto: 'Deixando a garrafa exposta ao sol forte do meio-dia.' },
          { id: 'd', texto: 'Misturando suco de manga ao suco de caju.' }
        ],
        respostaCorreta: 'b',
        explicacao: 'Durante o banho-maria (cozimento das garrafas fechadas), os açúcares naturais da fruta (frutose) sofrem caramelização térmica leve, conferindo a cor dourada característica e esterilizando a bebida.'
      }
    ]
  },
  {
    id: 'quiz_sustentabilidade',
    titulo: 'Quiz do Módulo: Sustentabilidade e Inovação',
    moduloId: 'sustentabilidade',
    perguntas: [
      {
        id: 'q_s1',
        enunciado: 'De que maneira o bagaço do caju que sobra do processamento de suco pode ser aproveitado de forma sustentável?',
        alternativas: [
          { id: 'a', texto: 'Apenas descartando em rios para alimentar peixes.' },
          { id: 'b', texto: 'Queimando para gerar fumaça contra insetos.' },
          { id: 'c', texto: 'Para silagem ou farinha seca na alimentação de animais (bovinos, galinhas, caprinos).' },
          { id: 'd', texto: 'O bagaço não tem nenhum uso e deve ser descartado em lixão.' }
        ],
        respostaCorreta: 'c',
        explicacao: 'O bagaço é excelente fonte de fibras e energia, podendo ser usado verde na silagem para gado ou desidratado como ingrediente de rações para galinhas, ovelhas e porcos.'
      },
      {
        id: 'q_s2',
        enunciado: 'Qual é um dos grandes benefícios de pequenos agricultores familiares se organizarem em cooperativas ou associações?',
        alternativas: [
          { id: 'a', texto: 'Não precisar mais trabalhar nas roças.' },
          { id: 'b', texto: 'Poder vender para programas do governo (PNAE/PAA) e comprar insumos mais baratos em conjunto.' },
          { id: 'c', texto: 'Poder cobrar impostos de outras pessoas da cidade.' },
          { id: 'd', texto: 'Nenhum benefício prático.' }
        ],
        respostaCorreta: 'b',
        explicacao: 'Organizações coletivas como cooperativas e associações têm força jurídica para fechar contratos com governos municipais/estaduais para merenda escolar, além de conseguir preços reduzidos na compra conjunta de embalagens e insumos.'
      }
    ]
  }
];
