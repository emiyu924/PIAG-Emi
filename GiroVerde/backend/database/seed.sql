-- Carga de dados atualizada do GiroVerde (Americana - SP e separação criteriosa de materiais)

-- Categorias de Resíduos
INSERT INTO categorias (id, nome, descricao, icone) VALUES
(1, 'Plásticos', 'Garrafas PET, embalagens plásticas e potes rígidos', 'recycle'),
(2, 'Vidros', 'Garrafas e frascos separados rigorosamente por cor', 'glass'),
(3, 'Metais', 'Latinhas de alumínio e embalagens de aço', 'wrench'),
(4, 'Papéis e Papelão', 'Caixas limpas desmontadas e papéis secos', 'file-text'),
(5, 'Eletrônicos e E-lixo', 'Computadores, celulares e periféricos', 'cpu'),
(6, 'Resíduos Especiais', 'Pilhas, baterias, óleo vegetal e pneus', 'alert-triangle'),
(7, 'Entulho e Obras', 'Alvenaria, tijolos e concreto (separados de gesso)', 'hammer'),
(8, 'Madeiras e Mobiliário', 'Madeira maciça separada de MDF, MDP e compensados', 'box'),
(9, 'Podas e Jardinagem', 'Galhos, folhas secas e capim ensacado', 'tree')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, descricao = EXCLUDED.descricao;

-- Materiais Recicláveis
INSERT INTO materiais (id, categoria_id, nome, descricao, ativo) VALUES
(1, 6, 'Pilha Comum e Alcalina', 'Pilhas AA, AAA e 9V usadas em controles e brinquedos', true),
(2, 6, 'Óleo de Cozinha Usado', 'Óleo vegetal residual de frituras residenciais', true),
(3, 1, 'Garrafa PET e Plásticos Rígidos', 'Garrafas plásticas de bebidas e frascos de produtos de limpeza', true),
(4, 2, 'Vidro Incolor / Transparente', 'Potes de conserva, potes de palmito/café e garrafas transparentes', true),
(5, 5, 'Celular Antigo e Computadores', 'Aparelhos celulares, notebooks, gabinetes e fiações de cobre', true),
(6, 4, 'Caixa de Papelão e Papéis', 'Caixas desmontadas, papelão ondulado limpo e envelopes secos', true),
(7, 7, 'Entulho de Obras e Alvenaria', 'Tijolos, restos de cimento, pedriscos e telhas (sem gesso)', true),
(8, 8, 'Madeira Maciça, Caixotes e Paletes', 'Tábuas de pinus/eucalipto, paletes, caixotes de feira e madeira pura', true),
(9, 6, 'Pneus Usados', 'Pneus de automóveis, motos e bicicletas sem água parada', true),
(10, 9, 'Restos de Podas e Galhos', 'Restos de capina, corte de grama e podas de árvores residenciais', true),
(11, 3, 'Latas de Alumínio e Aço', 'Latinhas de bebidas e latas de alimentos em conserva', true),
(12, 2, 'Vidro Colorido (Verde e Âmbar)', 'Garrafas de vinho, azeite, cerveja e frascos de xarope castanhos', true),
(13, 8, 'Móveis em MDF, MDP e Compensado', 'Armários planejados, guarda-roupas, estantes e painéis aglomerados', true)
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, categoria_id = EXCLUDED.categoria_id;

-- Orientações de Descarte Específicas
INSERT INTO orientacoes_descarte (material_id, destino_recomendado, instrucoes_preparo, cuidados_seguranca, fonte, data_revisao) VALUES
(1, 'Totens em supermercados, farmácias ou empresas de e-lixo de Americana.', 'Armazene em recipiente plástico seco. Isole as pontas com fita adesiva se oxidadas.', 'Não jogue no lixo comum nem nos ecopontos comuns. Risco de contaminação por chumbo e mercúrio.', 'Resolução CONAMA nº 401/2008 e PMA', CURRENT_DATE),
(2, 'Pontos da Cooperlírios de Americana ou ações de arrecadação do município.', 'Deixe esfriar, coe restos de alimentos e acondicione em garrafa PET vedada.', 'Nunca despeje no ralo para não poluir os mananciais do Ribeirão Quilombo e Rio Piracicaba.', 'Cooperlírios e Secretaria de Meio Ambiente de Americana', CURRENT_DATE),
(3, 'Coleta seletiva da Cooperlírios ou caçambas de recicláveis dos ecopontos.', 'Enxágue com água de reúso para retirar restos, retire o ar amassando e tampe.', 'Separar garrafas PET de plásticos flexíveis (sacolas) e não misturar com produtos químicos.', 'Manual de Coleta Seletiva de Americana', CURRENT_DATE),
(4, 'Cooperativa Cooperlírios ou caçambas de vidro dos ecopontos de Americana.', 'SEPARAR RIGOROSAMENTE POR COR: vidros incolores/transparentes devem ficar separados dos verdes e âmbar. O vidro colorido não perde a cor na fusão e inviabiliza novas garrafas transparentes.', 'NUNCA misture com espelhos, cristais, lâmpadas, cerâmicas ou pirex (possuem pontos de fusão diferentes). Vidro quebrado deve ser protegido em caixa ou garrafa pet cortada.', 'ABIVIDRO e Cooperlírios Americana', CURRENT_DATE),
(5, 'Ecoponto Catharina Zanaga ou empresa parceira Ecológica Ambiental (São Vito).', 'Restaure configurações de fábrica para proteção de dados pessoais e retire os chips.', 'Não abra nem destrua telas ou baterias com vazamento.', 'Logística Reversa Americana / PNRS', CURRENT_DATE),
(6, 'Coleta seletiva da Cooperlírios ou ecopontos municipais.', 'Desmonte e achate as caixas para otimizar espaço de transporte.', 'Não reciclar caixas impregnadas com gordura (caixas de pizza sujas).', 'Cooperlírios Americana', CURRENT_DATE),
(7, 'Ecopontos municipais de Americana (Jardim dos Lírios, Bertoni, Zanaga, etc.).', 'Transporte em sacos resistentes ou pequenas cargas. Limite gratuito de até 1m³ diário.', 'SEPARE RIGOROSAMENTE DO GESSO: o gesso sulfata o solo e inviabiliza a reciclagem do entulho. Gesso e amianto não são aceitos nos ecopontos comuns.', 'Secretaria de Obras e Serviços Urbanos (SOSU Americana)', CURRENT_DATE),
(8, 'Qualquer um dos 8 Ecopontos Municipais da Prefeitura de Americana.', 'SEPARAR MADEIRA PURA (Maciça, tábuas de pinus/eucalipto, paletes e caixotes) de móveis em MDF/MDP. A madeira pura pode ser triturada para compostagem, forração ou cavacos ecológicos.', 'OBRIGATÓRIO retirar ou rebater pregos, arames e parafusos expostos para prevenir acidentes com os operadores da SOSU.', 'SOSU Americana e Diretrizes de Resíduos Sólidos', CURRENT_DATE),
(9, 'Ecopontos Municipais de Americana.', 'Esvazie qualquer resíduo de água no interior do pneu.', 'Pneus destampados com água são os principais focos de proliferação do mosquito da dengue.', 'Vigilância em Saúde de Americana e SOSU', CURRENT_DATE),
(10, 'Ecopontos Municipais de Americana (limite diário de 1m³).', 'Acondicione folhas secas em sacos e amarre galhos finos em feixes compactos.', 'Não queimar restos de vegetação. Ocorrência passível de autuação.', 'SOSU Americana', CURRENT_DATE),
(11, 'Coleta seletiva da Cooperlírios ou sucateiros credenciados em Americana.', 'Separar latinhas de alumínio de latas de aço (conservas). Amasse latinhas de alumínio para economizar volume.', 'Cuidado com rebarbas cortantes de tampas metálicas abertas. O alumínio tem altíssimo valor de retorno.', 'ABAL e Cooperlírios Americana', CURRENT_DATE),
(12, 'Cooperativa Cooperlírios ou caçambas de vidro dos Ecopontos de Americana.', 'SEPARAR POR COR: mantenha garrafas verdes (vinhos/cervejas) e âmbar (castanhas) separadas do vidro transparente. Cada cor segue para um forno específico na indústria vidreira.', 'Não misture cerâmicas, pratos, travessas refratárias (Pirex) nem espelhos. Embale vidros trincados com proteção externa.', 'ABIVIDRO e Cooperlírios Americana', CURRENT_DATE),
(13, 'Ecopontos Municipais da Prefeitura de Americana (resíduos volumosos).', 'SEPARAR DE MADEIRA MACIÇA: MDF, MDP, aglomerados e compensados possuem resinas e colas sintéticas e não podem ir para compostagem. Entregar desmontado em painéis planos.', 'Remover espelhos colados, puxadores e dobradiças metálicas salientes para facilitar a triagem e o transporte.', 'SOSU Americana e Regulamento de Volumosos', CURRENT_DATE)
ON CONFLICT (material_id) DO UPDATE SET destino_recomendado = EXCLUDED.destino_recomendado, instrucoes_preparo = EXCLUDED.instrucoes_preparo;
