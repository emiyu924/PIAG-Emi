// Dados completos do GiroVerde com foco em Americana - SP e separação criteriosa de materiais

export const categoriasIniciais = [
  { id: 1, nome: 'Plásticos', descricao: 'Garrafas PET, potes plásticos e embalagens rígidas', icone: 'recycle' },
  { id: 2, nome: 'Vidros', descricao: 'Garrafas e frascos separados rigorosamente por cor', icone: 'glass' },
  { id: 3, nome: 'Metais', descricao: 'Latinhas de alumínio e embalagens de aço', icone: 'wrench' },
  { id: 4, nome: 'Papéis e Papelão', descricao: 'Caixas limpas desmontadas e papéis secos', icone: 'file-text' },
  { id: 5, nome: 'Eletrônicos e E-lixo', descricao: 'Computadores, celulares e periféricos', icone: 'cpu' },
  { id: 6, nome: 'Resíduos Especiais', descricao: 'Pilhas, baterias, óleo vegetal e pneus', icone: 'alert-triangle' },
  { id: 7, nome: 'Entulho e Obras', descricao: 'Alvenaria, tijolos e concreto (separados de gesso)', icone: 'hammer' },
  { id: 8, nome: 'Madeiras e Mobiliário', descricao: 'Madeira maciça separada de MDF, MDP e compensados', icone: 'box' },
  { id: 9, nome: 'Podas e Jardinagem', descricao: 'Galhos, folhas secas e capim ensacado', icone: 'tree' }
];

export const materiaisIniciais = [
  { id: 1, categoria_id: 6, categoria_nome: 'Resíduos Especiais', nome: 'Pilha Comum e Alcalina', ativo: true },
  { id: 2, categoria_id: 6, categoria_nome: 'Resíduos Especiais', nome: 'Óleo de Cozinha Usado', ativo: true },
  { id: 3, categoria_id: 1, categoria_nome: 'Plásticos', nome: 'Garrafa PET e Plásticos Rígidos', ativo: true },
  { id: 4, categoria_id: 2, categoria_nome: 'Vidros', nome: 'Vidro Incolor / Transparente', ativo: true },
  { id: 5, categoria_id: 5, categoria_nome: 'Eletrônicos e E-lixo', nome: 'Celular Antigo e Computadores', ativo: true },
  { id: 6, categoria_id: 4, categoria_nome: 'Papéis e Papelão', nome: 'Caixa de Papelão e Papéis', ativo: true },
  { id: 7, categoria_id: 7, categoria_nome: 'Entulho e Obras', nome: 'Entulho de Obras e Alvenaria', ativo: true },
  { id: 8, categoria_id: 8, categoria_nome: 'Madeiras e Mobiliário', nome: 'Madeira Maciça, Caixotes e Paletes', ativo: true },
  { id: 9, categoria_id: 6, categoria_nome: 'Resíduos Especiais', nome: 'Pneus Usados', ativo: true },
  { id: 10, categoria_id: 9, categoria_nome: 'Podas e Jardinagem', nome: 'Restos de Podas e Galhos', ativo: true },
  { id: 11, categoria_id: 3, categoria_nome: 'Metais', nome: 'Latas de Alumínio e Aço', ativo: true },
  { id: 12, categoria_id: 2, categoria_nome: 'Vidros', nome: 'Vidro Colorido (Verde e Âmbar)', ativo: true },
  { id: 13, categoria_id: 8, categoria_nome: 'Madeiras e Mobiliário', nome: 'Móveis em MDF, MDP e Compensado', ativo: true }
];

export const orientacoesIniciais = [
  {
    material_id: 1,
    destino_recomendado: 'Totens de coleta em farmácias, supermercados ou empresas de e-lixo de Americana.',
    instrucoes_preparo: 'Mantenha em local seco e isolado. Isole os polos com fita adesiva se oxidadas.',
    cuidados_seguranca: 'Nunca jogue no lixo comum ou nos ecopontos comuns. Risco de contaminação por chumbo e cádmio.',
    fonte: 'Resolução CONAMA nº 401/2008 e PMA',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 2,
    destino_recomendado: 'Cooperlírios de Americana ou pontos municipais de arrecadação.',
    instrucoes_preparo: 'Deixe o óleo de fritura esfriar, passe por uma peneira e armazene em garrafa PET vedada.',
    cuidados_seguranca: 'Nunca descarte na pia ou bueiros. 1 litro de óleo contamina o Ribeirão Quilombo e o Rio Piracicaba.',
    fonte: 'Cooperlírios e Secretaria de Meio Ambiente de Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 3,
    destino_recomendado: 'Coleta seletiva da Cooperlírios ou caçambas de recicláveis dos ecopontos.',
    instrucoes_preparo: 'Enxágue com água de reúso para retirar restos de bebidas, achate para diminuir volume e tampe.',
    cuidados_seguranca: 'Separar garrafas PET de plásticos flexíveis (sacolas) e não misturar com produtos químicos.',
    fonte: 'Manual de Coleta Seletiva de Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 4,
    destino_recomendado: 'Cooperativa Cooperlírios ou caçambas específicas de vidro dos ecopontos de Americana.',
    instrucoes_preparo: 'SEPARAR RIGOROSAMENTE POR COR: vidros incolores/transparentes devem ficar separados dos verdes e âmbar. O vidro colorido não perde a cor na fusão e inviabiliza novas garrafas transparentes.',
    cuidados_seguranca: 'NUNCA misture com espelhos, cristais, lâmpadas, cerâmicas ou pirex (possuem pontos de fusão diferentes). Vidro quebrado deve ser protegido em caixa ou garrafa pet cortada.',
    fonte: 'ABIVIDRO e Cooperlírios Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 5,
    destino_recomendado: 'Ecoponto Catharina Zanaga ou empresa parceira Ecológica Ambiental (São Vito).',
    instrucoes_preparo: 'Faça backup, restaure as configurações de fábrica e retire baterias removíveis e cartões.',
    cuidados_seguranca: 'Não quebre telas ou tubos de imagem, pois contêm fósforo e chumbo.',
    fonte: 'Logística Reversa Americana / PNRS',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 6,
    destino_recomendado: 'Coleta seletiva da Cooperlírios de Americana ou ecopontos municipais.',
    instrucoes_preparo: 'Desmonte e achate as caixas de papelão, amarrando em fardos para facilitar o manuseio.',
    cuidados_seguranca: 'Não misture papelão engordurado (ex: tampa de caixa de pizza com queijo/gordura) nem papéis sanitários.',
    fonte: 'Cooperlírios Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 7,
    destino_recomendado: 'Ecopontos municipais de Americana (Jardim dos Lírios, Bertoni, Zanaga, Guanabara, etc.).',
    instrucoes_preparo: 'Entulho limpo de alvenaria, tijolos e concreto em sacos de ráfia. Limite gratuito de até 1m³ por dia por munícipe.',
    cuidados_seguranca: 'SEPARE RIGOROSAMENTE DO GESSO: o gesso sulfata o solo e inviabiliza a reciclagem do entulho. Gesso e amianto não são aceitos nos ecopontos comuns.',
    fonte: 'Secretaria de Obras e Serviços Urbanos (SOSU Americana)',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 8,
    destino_recomendado: 'Qualquer um dos 8 Ecopontos Municipais da Prefeitura de Americana.',
    instrucoes_preparo: 'SEPARAR MADEIRA PURA (Maciça, tábuas de pinus/eucalipto, paletes e caixotes) de móveis em MDF/MDP. A madeira pura pode ser triturada para compostagem, forração ou cavacos ecológicos.',
    cuidados_seguranca: 'OBRIGATÓRIO retirar ou rebater pregos, arames e parafusos expostos para prevenir acidentes com os operadores da SOSU.',
    fonte: 'SOSU Americana e Diretrizes de Resíduos Sólidos',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 9,
    destino_recomendado: 'Ecopontos Municipais de Americana (com controle de quantidade por munícipe).',
    instrucoes_preparo: 'Retire qualquer resíduo de água no interior do pneu e mantenha coberto até a entrega.',
    cuidados_seguranca: 'Pneus com água acumulada são o maior vetor da dengue. O descarte nos ecopontos é gratuito e imediato.',
    fonte: 'Vigilância em Saúde de Americana e SOSU',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 10,
    destino_recomendado: 'Ecopontos Municipais de Americana (limite diário de 1m³).',
    instrucoes_preparo: 'Amarre os galhos finos em feixes compactos ou ensaque grama cortada e folhagens secas.',
    cuidados_seguranca: 'Não misture com restos de madeira tratada com verniz ou lixo orgânico doméstico. Queimar galhos é crime ambiental.',
    fonte: 'SOSU Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 11,
    destino_recomendado: 'Coleta seletiva da Cooperlírios de Americana ou sucateiros credenciados.',
    instrucoes_preparo: 'Separar latinhas de alumínio de latas de aço (conservas). Amasse latinhas de alumínio para economizar volume.',
    cuidados_seguranca: 'Cuidado com rebarbas cortantes de tampas metálicas abertas. O alumínio tem altíssimo valor de retorno.',
    fonte: 'ABAL e Cooperlírios Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 12,
    destino_recomendado: 'Cooperativa Cooperlírios ou caçambas de vidro dos Ecopontos de Americana.',
    instrucoes_preparo: 'SEPARAR POR COR: mantenha garrafas verdes (vinhos/cervejas) e âmbar (castanhas) separadas do vidro transparente. Cada cor segue para um forno específico na indústria vidreira.',
    cuidados_seguranca: 'Não misture cerâmicas, pratos, travessas refratárias (Pirex) nem espelhos. Embale vidros trincados com proteção externa.',
    fonte: 'ABIVIDRO e Cooperlírios Americana',
    data_revisao: '2026-10-24'
  },
  {
    material_id: 13,
    destino_recomendado: 'Ecopontos Municipais da Prefeitura de Americana (resíduos volumosos).',
    instrucoes_preparo: 'SEPARAR DE MADEIRA MACIÇA: MDF, MDP, aglomerados e compensados possuem resinas e colas sintéticas e não podem ir para compostagem. Entregar desmontado em painéis planos.',
    cuidados_seguranca: 'Remover espelhos colados, puxadores e dobradiças metálicas salientes para facilitar a triagem e o transporte.',
    fonte: 'SOSU Americana e Regulamento de Volumosos',
    data_revisao: '2026-10-24'
  }
];

export const pontosIniciais = [
  {
    id: 1,
    nome: 'Ecoponto Jardim dos Lírios (Americana)',
    logradouro: 'Rua das Seriemas',
    numero: '550',
    bairro: 'Jardim dos Lírios',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 2,
    nome: 'Ecoponto Jardim Bertoni (Americana)',
    logradouro: 'Avenida Roma',
    numero: '4483',
    bairro: 'Jardim Bertoni',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 3,
    nome: 'Ecoponto Antônio Zanaga (Americana)',
    logradouro: 'Avenida do Rayon Viscose',
    numero: '209',
    bairro: 'Antônio Zanaga',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 4,
    nome: 'Ecoponto Catharina Zanaga (Americana)',
    logradouro: 'Avenida Carmine Feola',
    numero: '1327',
    bairro: 'Catharina Zanaga',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 5,
    nome: 'Ecoponto Guanabara (Americana)',
    logradouro: 'Rua do Castelo',
    numero: '225',
    bairro: 'Jardim Guanabara',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 6,
    nome: 'Ecoponto Nova Carioba (Americana)',
    logradouro: 'Rua José Nicoletti',
    numero: '110',
    bairro: 'Nova Carioba',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 7,
    nome: 'Ecoponto Werner Plaas (Americana)',
    logradouro: 'Rua do Mecânico',
    numero: '65',
    bairro: 'Werner Plaas',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 8,
    nome: 'Ecoponto Jardim da Paz (Americana)',
    logradouro: 'Rua Estevão Carlos Vicentini',
    numero: '175',
    bairro: 'Jardim da Paz',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Seg a Sex: 07h às 17h | Sáb: 08h às 17h | Dom e Feriados: 08h às 12h',
    contato: 'SOSU Americana - (19) 3475-9000',
    ativo: true,
    materiais_aceitos: [3, 4, 6, 7, 8, 9, 10, 11, 12, 13]
  },
  {
    id: 9,
    nome: 'Cooperlírios - Cooperativa de Reciclagem de Americana',
    logradouro: 'Rua das Seriemas',
    numero: '550-B',
    bairro: 'Jardim dos Lírios',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Segunda a Sexta, das 07h30 às 16h30',
    contato: 'Cooperlírios - Parceria Prefeitura de Americana',
    ativo: true,
    materiais_aceitos: [2, 3, 4, 6, 11, 12]
  },
  {
    id: 10,
    nome: 'Ecológica Ambiental - Gestão de E-lixo Americana',
    logradouro: 'Rua Vicente Caravieri',
    numero: '71',
    bairro: 'São Vito',
    cidade: 'Americana',
    estado: 'SP',
    horario_funcionamento: 'Segunda a Sexta, das 08h às 17h',
    contato: '(19) 3407-5897',
    ativo: true,
    materiais_aceitos: [1, 5]
  }
];

export const dicasIniciais = [
  {
    id: 1,
    categoria_id: 2,
    titulo: 'Por que o vidro DEVE ser separado por cor?',
    conteudo: 'A cor do vidro não desaparece com a fusão no forno industrial. Se vidros verdes ou âmbar forem misturados com o incolor, o lote inteiro perde a pureza e não pode gerar novas garrafas transparentes, causando grande prejuízo na triagem da Cooperlírios.',
    tema: 'Separação Crítica: Vidros'
  },
  {
    id: 2,
    categoria_id: 8,
    titulo: 'Madeira Maciça vs. MDF/MDP: Destinos Diferentes',
    conteudo: 'Madeira maciça natural (tábuas, paletes e caixotes) pode ser triturada para compostagem e forração verde. Já o MDF, MDP e compensados contêm resinas sintéticas e cola formaldeído, exigindo destinação para queima industrial controlada em caldeiras ou aterro.',
    tema: 'Separação Crítica: Madeiras'
  },
  {
    id: 3,
    categoria_id: 7,
    titulo: 'Entulho com Gesso é recusado nos Ecopontos',
    conteudo: 'Tijolos, concreto e cerâmica são reciclados como base para asfalto e calçamento em Americana. O gesso em pó ou placas de drywall libera sulfato e contamina o concreto reciclado. Mantenha sempre o gesso isolado do entulho.',
    tema: 'Construção Civil Limpa'
  },
  {
    id: 4,
    categoria_id: 6,
    titulo: 'Proteção do Rio Piracicaba e Ribeirão Quilombo',
    conteudo: 'Despejar óleo de fritura na pia impermeabiliza tubulações do DAE e forma crostas de gordura que poluem as águas de Americana. Espere esfriar, coe em garrafa PET e leve até a Cooperlírios.',
    tema: 'Preservação Hídrica'
  },
  {
    id: 5,
    categoria_id: 6,
    titulo: 'Prevenção da Dengue: Descarte pneus imediatamente',
    conteudo: 'Pneus expostos à chuva são o ambiente predileto do mosquito da dengue. Todos os 8 ecopontos municipais de Americana aceitam pneus velhos gratuitamente.',
    tema: 'Saúde Pública em Americana'
  },
  {
    id: 6,
    categoria_id: 8,
    titulo: 'Atenção aos pregos em madeiras e sofás',
    conteudo: 'Antes de levar móveis e madeiras aos ecopontos da SOSU, desmonte as peças e rebata ou remova os pregos e parafusos expostos para proteger os agentes de limpeza urbana.',
    tema: 'Segurança no Manuseio'
  }
];
