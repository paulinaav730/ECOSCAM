-- ==============================================================================
-- EcoScan Colombia — Datos Iniciales Verificados (seed.sql)
-- Incluye fuentes oficiales reales, reglas determinísticas de clasificación
-- y catálogo inicial de 17 residuos representativos para Colombia.
-- ==============================================================================

-- 1. Fuentes Oficiales y Técnicas
INSERT INTO public.sources (id, entity_name, resource_title, url, source_type, geographic_scope, consulted_at, reviewed_at)
VALUES
  ('src-res-2184-2019', 'Ministerio de Ambiente y Desarrollo Sostenible de Colombia', 'Resolución 2184 de 2019 — Código de colores para la separación de residuos sólidos en la fuente (Blanco, Verde y Negro)', 'https://www.minambiente.gov.co/', 'normativa_nacional', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-minambiente-posconsumo', 'Ministerio de Ambiente y Desarrollo Sostenible / ANLA', 'Programas Posconsumo de Residuos de Manejo Diferenciado en Colombia', 'https://www.minambiente.gov.co/asuntos-ambientales-sectorial-y-urbana/programas-posconsumo/', 'programa_posconsumo', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-pilas-ambiente', 'Corporación Pilas con el Ambiente', 'Programa Posconsumo de Pilas y Acumuladores Domésticos', 'https://www.pilascolombia.com/', 'programa_posconsumo', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-punto-azul', 'Corporación Punto Azul', 'Gestión Posconsumo de Medicamentos Vencidos o Parcialmente Consumidos', 'https://www.puntoazul.com.co/', 'programa_posconsumo', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-ecocomputo', 'Corporación EcoCómputo', 'Programa Posconsumo de Residuos de Computadores y Periféricos (RAEE)', 'https://ecocomputo.com/', 'programa_posconsumo', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-lumina', 'Corporación Lúmina', 'Programa Posconsumo de Bombillas y Residuos de Iluminación', 'https://lumina.com.co/', 'programa_posconsumo', 'Nacional (Colombia)', '2026-10-01', '2026-10-01'),
  ('src-emvarias-medellin', 'Emvarias Grupo EPM / Alcaldía de Medellín', 'Guía de Separación y Rutas de Aprovechamiento en Medellín y Valle de Aburrá', 'https://www.emvarias.com.co/', 'operador_aseo', 'Medellín y Valle de Aburrá', '2026-10-01', '2026-10-01')
ON CONFLICT (id) DO NOTHING;

-- 2. Reglas de Clasificación Ambiental
INSERT INTO public.classification_rules (
  id, code, name, priority, conditions, target_category, container_color,
  recommendation, preparation_steps, explanation, mistakes_to_avoid, source_id, geographic_scope, validation_status, reviewed_at
)
VALUES
  (
    'rule-posconsumo-especial',
    'COL-POS-001',
    'Prioridad de Gestión Posconsumo o Manejo Especial',
    10,
    '{"requiresSpecialManagement": true}'::jsonb,
    'posconsumo_especial',
    'punto_posconsumo',
    'No depositar en canecas domésticas (blanca, verde ni negra). Entregar únicamente en puntos de recolección posconsumo o gestores autorizados.',
    ARRAY['Mantener el residuo íntegro sin desarmar ni perforar.', 'Almacenar temporalmente en un lugar seco y fuera del alcance de niños o mascotas.', 'Verificar los requisitos del contenedor o jornada posconsumo en tu municipio.'],
    'Los residuos posconsumo o peligrosos contienen sustancias químicas, metales pesados, componentes electrónicos o fármacos que no pueden gestionarse en el servicio ordinario de aseo.',
    ARRAY['Nunca arrojar al sanitario, sifón o cuerpos de agua.', 'No mezclar con el reciclaje de bolsa blanca ni con la basura ordinaria de bolsa negra.'],
    'src-minambiente-posconsumo',
    'Nacional (Colombia)',
    'verificado',
    '2026-10-01'
  ),
  (
    'rule-contaminado-grasa-comida',
    'COL-CONT-002',
    'Material Reciclable Contaminado con Grasa o Restos de Comida Adheridos',
    20,
    '{"materials": ["papel", "carton", "plastico", "multicapa"], "conditions": ["contaminado_grasa", "contaminado_comida"]}'::jsonb,
    'no_aprovechable',
    'negro',
    'Disponer en el recipiente o bolsa NEGRA (No aprovechables), salvo que tenga una parte limpia separable.',
    ARRAY['Si se trata de una caja de cartón (como caja de pizza) con la tapa limpia, separa la tapa limpia para la bolsa blanca y deposita la base engrasada en la bolsa negra.'],
    'La grasa y los restos orgánicos impregnados en fibras de papel o cartón impiden el proceso de repulpeo y contaminan lotes enteros de material aprovechable.',
    ARRAY['No introduzcas servilletas usadas ni cartones engrasados en la bolsa blanca.'],
    'src-res-2184-2019',
    'Nacional (Colombia)',
    'verificado',
    '2026-10-01'
  ),
  (
    'rule-contaminado-quimico-biologico',
    'COL-CONT-003',
    'Envases de Productos Químicos, Plaguicidas o Riesgo Biológico',
    15,
    '{"conditions": ["contaminado_quimico", "riesgo_biologico"]}'::jsonb,
    'posconsumo_especial',
    'punto_posconsumo',
    'Requiere ruta posconsumo especializada (ej. Cierra el Ciclo para plaguicidas domésticos) o disposición diferenciada según peligrosidad.',
    ARRAY['Nunca reutilizar el envase para almacenar agua, alimentos ni otros líquidos.', 'Conservar la etiqueta original legible para identificar la sustancia.'],
    'Los residuos con trazas de plaguicidas, solventes o agentes biológicos representan riesgo para los recicladores de oficio y para los ecosistemas.',
    ARRAY['No perforar aerosoles ni lavar envases de plaguicidas en el lavaplatos doméstico.'],
    'src-minambiente-posconsumo',
    'Nacional (Colombia)',
    'verificado',
    '2026-10-01'
  ),
  (
    'rule-organico-aprovechable',
    'COL-ORG-004',
    'Residuos Orgánicos Biodegradables Crudos o de Jardinería',
    30,
    '{"materials": ["organico"], "conditions": ["limpio_seco", "organico_fresco"]}'::jsonb,
    'organico_aprovechable',
    'verde',
    'Depositar en el recipiente o bolsa VERDE (Orgánicos aprovechables) o aprovechar en compostaje doméstico/comunitario.',
    ARRAY['Escurrir el exceso de líquidos antes de depositar.', 'Retirar etiquetas adhesivas plásticas de cáscaras de frutas.', 'Si haces compostaje en casa, trocea los restos para acelerar su transformación.'],
    'De acuerdo con la Resolución 2184 de 2019, el color verde identifica los residuos orgánicos aprovechables como restos de vegetales, frutas, cáscaras de huevo trituradas y poda.',
    ARRAY['No mezclar con bolsas plásticas convencionales ni con colillas de cigarrillo.'],
    'src-res-2184-2019',
    'Nacional (Colombia)',
    'verificado',
    '2026-10-01'
  ),
  (
    'rule-aprovechable-limpio-seco',
    'COL-APR-005',
    'Envases, Empaques y Materiales Aprovechables Limpios y Secos',
    40,
    '{"materials": ["plastico_pet", "plastico_pead", "vidrio", "aluminio", "metal", "papel", "carton", "multicapa"], "conditions": ["limpio_seco"]}'::jsonb,
    'aprovechable',
    'blanco',
    'Depositar en el recipiente o bolsa BLANCA (Residuos aprovechables) limpio y completamente seco.',
    ARRAY['Vaciar por completo el contenido del envase.', 'Enjuagar brevemente si contenía bebidas, lácteos o salsas y dejar escurrir hasta secar.', 'Compactar botellas plásticas o plegar cajas de cartón para optimizar el espacio de recolección.'],
    'Bajo la Resolución 2184 de 2019, el plástico, vidrio, metales, papel, cartón y envases multicapa limpios y secos se separan en bolsa blanca para ser reincorporados a cadenas productivas por organizaciones de recicladores.',
    ARRAY['No entregar envases con líquidos restantes que puedan mojar el papel y el cartón de la misma bolsa.'],
    'src-res-2184-2019',
    'Nacional (Colombia)',
    'verificado',
    '2026-10-01'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Retos Iniciales de Hábitos Sostenibles
INSERT INTO public.challenges (id, title, description, category, fulfillment_criteria, target_count, eco_points_reward, status)
VALUES
  ('chal-5-consultas', 'Explorador Consciente: Identifica 5 residuos', 'Consulta 5 residuos diferentes en el catálogo o escáner para conocer su preparación antes de separarlos.', 'aprendizaje', '{"type": "residuo_consultado", "count": 5}'::jsonb, 5, 30, 'activo'),
  ('chal-ruta-pila', 'Guardián Posconsumo: Aprende a entregar pilas', 'Consulta la ficha técnica de las pilas o baterías y revisa las medidas de seguridad para su entrega en puntos posconsumo.', 'posconsumo', '{"wasteItemId": "item-pilas"}'::jsonb, 1, 25, 'activo'),
  ('chal-evitar-desechable', 'Prevención en Origen: Evita un desechable', 'Declara una acción de reutilización o prevención reemplazando un envase de un solo uso por uno reutilizable.', 'prevencion', '{"type": "reutilizacion_declarada", "count": 1}'::jsonb, 1, 40, 'activo'),
  ('chal-reparar-objeto', 'Ciclo Extendido: Repara o dona un objeto', 'Registra una acción de reparación o donación responsable antes de descartar un aparato o prenda.', 'reutilizacion', '{"type": "reutilizacion_declarada", "count": 2}'::jsonb, 2, 50, 'activo'),
  ('chal-ruta-local', 'Conexión Local: Consulta puntos en tu municipio', 'Explora los canales institucionales y programas posconsumo disponibles en tu ciudad.', 'separacion', '{"type": "ruta_consultada", "count": 1}'::jsonb, 1, 20, 'activo')
ON CONFLICT (id) DO NOTHING;

-- 4. Catálogo Inicial de 17 Residuos Representativos en Colombia
INSERT INTO public.waste_items (
  id, slug, name, description, synonyms, main_category, container_color,
  primary_material, secondary_materials, default_condition, requires_special_management,
  preparation_instructions, warnings, why_explanation, circular_alternatives,
  special_management_details, source_id, geographic_scope, publication_status, reviewed_at
)
VALUES
  (
    'item-botella-plastico', 'botella-de-plastico', 'Botella de plástico (PET)',
    'Envase plástico transparente o de color utilizado para agua, gaseosas, jugos o bebidas hidratantes.',
    ARRAY['envase pet', 'botella de agua', 'botella de gaseosa', 'tarro plastico'],
    'aprovechable', 'blanco', 'plastico_pet', ARRAY['polipropileno_tapa', 'etiqueta_polipropileno'],
    'limpio_seco', false,
    ARRAY['Vaciar completamente cualquier líquido residual.', 'Enjuagar brevemente con poca agua si contenía bebidas azucaradas o lácteas y escurrir.', 'Aplastar la botella para reducir su volumen y enroscar nuevamente la tapa plástica.'],
    ARRAY['No introduzcas colillas de cigarrillo, servilletas ni restos orgánicos dentro de la botella.', 'Si la botella contuvo venenos, solventes o combustibles, NO va en bolsa blanca.'],
    'El tereftalato de polietileno (PET #1) tiene una de las cadenas de reciclaje más consolidadas en Colombia bajo la Resolución 2184 de 2019 cuando se entrega limpio y seco.',
    '[{"type":"reducir","title":"Usa termo o botella reutilizable","description":"Evita comprar botellas de un solo uso llevando un termo de acero inoxidable o vidrio seguro.","safetyNote":"No se recomienda rellenar indefinidamente botellas PET de un solo uso con bebidas calientes."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-botella-vidrio', 'botella-de-vidrio', 'Botella o frasco de vidrio',
    'Envases de vidrio transparente, ámbar o verde de bebidas, conservas, salsas o mermeladas.',
    ARRAY['frasco de vidrio', 'envase de vidrio', 'botella de cerveza', 'tarro de compota'],
    'aprovechable', 'blanco', 'vidrio', ARRAY['tapa_metalica', 'etiqueta_papel'],
    'limpio_seco', false,
    ARRAY['Vaciar y enjuagar restos de salsas, conservas o bebidas.', 'Dejar escurrir hasta que esté seco.', 'Retirar la tapa metálica o plástica (también aprovechable en bolsa blanca si está limpia).'],
    ARRAY['Si el vidrio está roto, envuélvelo en papel grueso o cartón y rotúlalo claramente como "VIDRIO ROTO" para evitar cortes al reciclador de oficio.', 'Los espejos, bombillas, refractarias templadas (Pyrex) y vidrios de ventana tienen diferente punto de fusión y no deben mezclarse con botellas de envase.'],
    'El vidrio de envase es 100% reciclable infinitas veces sin perder sus propiedades físicas cuando no se contamina con cerámica, espejos ni bombillas.',
    '[{"type":"reutilizar","title":"Reutilizar frascos para alacena","description":"Los frascos de vidrio lavados y esterilizados con agua caliente son ideales para guardar granos secos, especias o semillas.","safetyNote":"Revisa que el borde superior no tenga fisuras ni astillas antes de reutilizar."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-lata-aluminio', 'lata-de-aluminio', 'Lata de aluminio o conserva metálica',
    'Latas de bebidas gaseosas, cervezas o conservas de alimentos (atún, maíz, arvejas).',
    ARRAY['lata de cerveza', 'lata de gaseosa', 'lata de atun', 'envase metalico'],
    'aprovechable', 'blanco', 'aluminio', ARRAY['acero_hojalata'],
    'limpio_seco', false,
    ARRAY['Vaciar por completo el líquido o alimento.', 'En latas de atún o sardinas, retirar el exceso de aceite con una servilleta usada (la servilleta va en bolsa negra) y lavar la lata con agua jabonosa.', 'Secar bien y doblar la tapa hacia adentro para prevenir cortes.'],
    ARRAY['No mezclar con latas de pintura, solventes ni aerosoles de insecticidas.'],
    'El aluminio y la hojalata son metales de alto valor de recuperación en Colombia y ahorran hasta un 95% de la energía frente a la extracción primaria.',
    '[{"type":"reducir","title":"Prefiere formatos familiares o frescos","description":"Prioriza alimentos frescos sobre enlatados individuales cuando sea posible.","safetyNote":"Cuidado con los bordes filosos de las tapas de hojalata al manipularlas."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-caja-carton', 'caja-de-carton', 'Caja de cartón limpia',
    'Cajas de embalaje, envíos, cereales, electrodomésticos o cubetas de cartón limpias y secas.',
    ARRAY['carton corrugado', 'caja de envio', 'empaque de carton'],
    'aprovechable', 'blanco', 'carton', ARRAY['cinta_adhesiva'],
    'limpio_seco', false,
    ARRAY['Desarmar y aplanar la caja para reducir su volumen.', 'Retirar excesos de cinta plástica, grapas grandes o rellenos de icopor.', 'Mantener completamente seca y libre de manchas de aceite o comida.'],
    ARRAY['El cartón mojado bajo la lluvia o manchado con grasa pierde su calidad de fibra para el reciclaje.'],
    'El cartón corrugado limpio es altamente demandado por las organizaciones de recicladores para fabricar nuevas cajas y empaques moldeados.',
    '[{"type":"reutilizar","title":"Reutilizar para mudanzas, envíos o almacenamiento","description":"Una caja de cartón firme puede reutilizarse múltiples veces para organizar objetos en casa o realizar envíos.","safetyNote":"Almacena en lugares ventilados y secos."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-papel-limpio', 'papel-limpio', 'Papel limpio de oficina o estudio',
    'Hojas de cuaderno, impresiones, facturas en papel bond, periódicos y revistas limpias y secas.',
    ARRAY['hojas de papel', 'periodico', 'archivo de papel', 'cuaderno usado'],
    'aprovechable', 'blanco', 'papel', ARRAY[]::text[],
    'limpio_seco', false,
    ARRAY['Apilar las hojas planas o dobladas en lugar de arrugarlas en bolas.', 'Retirar clips metálicos, carpetas plásticas o espirales antes de entregar.', 'Asegurar que esté seco.'],
    ARRAY['El papel térmico de cajeros o datáfonos (que se oscurece al rasparlo), el papel carbón y el papel plastificado no se reciclan como papel bond.'],
    'Las fibras de celulosa del papel limpio pueden recuperarse varias veces si no se arrugan excesivamente ni se mojan.',
    '[{"type":"reutilizar","title":"Usar la segunda cara de las hojas impresas","description":"Antes de desechar hojas impresas por una sola cara, utilízalas como borrador de notas o estudio.","safetyNote":"Destruye o tacha datos personales sensibles antes de entregar facturas."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-papel-contaminado', 'papel-contaminado-con-comida', 'Papel o servilleta contaminada con comida',
    'Servilletas usadas, papel absorbente de cocina, envolturas de empanadas o pasteles impregnadas de grasa o salsas.',
    ARRAY['servilleta usada', 'papel engrasado', 'toalla de cocina usada', 'papel higienico'],
    'no_aprovechable', 'negro', 'papel', ARRAY['grasa_organica'],
    'contaminado_comida', false,
    ARRAY['Depositar directamente en la bolsa o recipiente NEGRO.', 'Asegurarse de no mezclar con el papel limpio de oficina.'],
    ARRAY['Nunca depositar servilletas usadas ni papel higiénico en la bolsa blanca de reciclaje.'],
    'Las fibras cortas de las servilletas ya han pasado por varios ciclos y, al estar impregnadas de grasa o fluidos, no pueden separarse en el proceso de reciclaje con agua.',
    '[{"type":"reducir","title":"Reemplazar por limpiones o servilletas de tela lavables","description":"Usar paños de microfibra o algodón lavables reduce drásticamente el consumo diario de papel absorbente desechable.","safetyNote":"Lava los paños de cocina frecuentemente con agua y jabón."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-caja-pizza', 'caja-de-pizza', 'Caja de pizza',
    'Caja de cartón corrugado utilizada para domicilios de pizza, que suele presentar partes limpias y partes engrasadas.',
    ARRAY['empaque de pizza', 'carton de pizza'],
    'requiere_verificacion', 'verificacion', 'carton', ARRAY['grasa_alimentaria'],
    'parcialmente_contaminado', false,
    ARRAY['Inspecciona la caja: retira cualquier resto de comida o queso.', 'Corta o separa la tapa superior si está completamente limpia y seca -> va en bolsa BLANCA.', 'La base inferior manchada de grasa o salsa -> va en bolsa NEGRA.'],
    ARRAY['No entregues la caja completa en la bolsa blanca si la base tiene manchas de aceite o restos de queso adheridos.'],
    'La caja de pizza es el ejemplo clásico de evaluación por estado: el cartón limpio es aprovechable (Blanco), pero el cartón impregnado de aceite contamina el proceso industrial y debe ir a No Aprovechables (Negro).',
    '[{"type":"aprovechar","title":"Separación inteligente por partes","description":"Separar la tapa limpia permite recuperar hasta el 50% del cartón de la caja sin contaminar la ruta de reciclaje.","safetyNote":"Asegúrate de que la tapa no tenga manchas de grasa ni salsa."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-envase-multicapa', 'envase-multicapa', 'Envase multicapa (Tetra Pak)',
    'Cajas de leche, jugos, cremas o licores compuestas por capas de cartón, polietileno y aluminio.',
    ARRAY['tetra pak', 'caja de leche', 'caja de jugo', 'tetrabrik'],
    'aprovechable', 'blanco', 'multicapa', ARRAY['carton', 'polietileno', 'aluminio'],
    'limpio_seco', false,
    ARRAY['Vaciar completamente el líquido.', 'Enjuagar con un poco de agua, agitar y escurrir bien.', 'Si tiene pitillo, introdúcelo dentro de la caja o entrégalo junto al envase limpio y aplasta la caja.'],
    ARRAY['Un envase con restos de leche sin enjuagar genera malos olores, hongos y contamina el resto de la bolsa blanca.'],
    'En Colombia existen plantas transformadoras que mediante hidropulpeo separan la fibra de cartón de las capas de polialuminio (usadas para fabricar tejas y láminas termoacústicas).',
    '[{"type":"reutilizar","title":"Semilleros caseros temporales","description":"Las cajas multicapa lavadas y cortadas sirven como macetas temporales impermeables para germinar plántulas.","safetyNote":"Lavar con agua y jabón antes de usar en jardinería."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-restos-frutas-verduras', 'restos-de-frutas-y-verduras', 'Restos de frutas y verduras',
    'Cáscaras, tallos, hojas, semillas, borra de café y recortes crudos de frutas y hortalizas.',
    ARRAY['cascaras de fruta', 'residuos de cocina', 'organicos', 'borra de cafe'],
    'organico_aprovechable', 'verde', 'organico', ARRAY[]::text[],
    'organico_fresco', false,
    ARRAY['Escurrir el exceso de agua.', 'Retirar adhesivos plásticos (stickers) de las cáscaras de fruta.', 'Depositar en el recipiente VERDE o en tu compostera doméstica.'],
    ARRAY['Verifica si en tu municipio o unidad residencial existe recolección selectiva de orgánicos o compostaje comunitario; si no existe ruta diferenciada del operador, evita que mojen la bolsa blanca.'],
    'Los restos vegetales crudos representan cerca del 50% de la bolsa doméstica en Colombia y son la base ideal para producir abono orgánico o compost.',
    '[{"type":"compostar","title":"Compostaje doméstico o pacas digestoras","description":"Los restos vegetales crudos y la borra de café pueden transformarse en abono rico en nutrientes mediante compostaje casero o Pacas Digestoras Silva.","safetyNote":"Cubre siempre los restos frescos con material seco (hojarasca o aserrín limpio) para evitar mosquitos."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-cascaras-huevo', 'cascaras-de-huevo', 'Cáscaras de huevo',
    'Cáscaras de huevo crudo o cocido generadas en la preparación de alimentos.',
    ARRAY['cascara de huevo'],
    'organico_aprovechable', 'verde', 'organico', ARRAY['carbonato_calcio'],
    'organico_fresco', false,
    ARRAY['Dejar secar al aire y triturar en fragmentos pequeños.', 'Depositar en el recipiente VERDE de orgánicos aprovechables o incorporar al compostaje.'],
    ARRAY['No las mezcles con la bolsa blanca de reciclaje seco.'],
    'Las cáscaras de huevo aportan carbonato de calcio y minerales valiosos para equilibrar el pH en procesos de compostaje y suelos.',
    '[{"type":"compostar","title":"Aporte de calcio para plantas y compost","description":"Secas y trituradas finamente, pueden mezclarse con el sustrato de las plantas o la compostera.","safetyNote":"Dejar secar bien antes de almacenar para evitar olores."}]'::jsonb,
    NULL, 'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-pilas', 'pilas-y-baterias', 'Pilas domésticas y baterías',
    'Pilas alcalinas, de carbón-zinc, tipo botón o recargables (AA, AAA, 9V, C, D) usadas en controles, relojes y juguetes.',
    ARRAY['pila aa', 'pila aaa', 'bateria', 'pila de reloj', 'pilas usadas'],
    'posconsumo_especial', 'punto_posconsumo', 'metal_quimico', ARRAY['zinc', 'manganeso', 'litio'],
    'limpio_seco', true,
    ARRAY['Nunca destapar, perforar ni incinerar la pila.', 'Si presenta sulfatación o derrame leve, manipúlala con guantes y cubre los polos con cinta adhesiva transparente.', 'Almacena temporalmente en un recipiente plástico seco e identificado hasta llevarlas a un contenedor del programa Pilas con el Ambiente.'],
    ARRAY['PROHIBIDO arrojar a la caneca negra, blanca o verde.', 'Riesgo de contaminación por metales pesados y electrolitos corrosivos si llega a rellenos sanitarios o fuentes hídricas.'],
    'Las pilas están reguladas como residuos de manejo diferenciado posconsumo en Colombia (Resolución 1297 de 2010 / Res. 2246 de 2017) y deben entregarse en contenedores autorizados.',
    '[{"type":"reducir","title":"Migrar a pilas recargables certificadas","description":"Una pila recargable puede sustituir cientos de pilas alcalinas desechables a lo largo de su vida útil.","safetyNote":"Cuando las pilas recargables agoten su vida útil, también deben entregarse en puntos posconsumo."}]'::jsonb,
    '{"programName":"Corporación Pilas con el Ambiente","regulation":"Resolución 1297 de 2010 / Resolución 851 de 2022","whatIsIt":"Acumuladores de energía eléctrica de uso doméstico.","whySpecial":"Contienen metales y compuestos químicos que pueden lixiviar si se disponen en rellenos sanitarios.","authorizedReceiver":"Contenedores posconsumo Pilas con el Ambiente en centros comerciales, almacenes de cadena y sedes institucionales.","restrictions":"No incluye baterías plomo-ácido de vehículos automotores (que tienen su propio programa posconsumo)."}'::jsonb,
    'src-pilas-ambiente', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-medicamentos-vencidos', 'medicamentos-vencidos', 'Medicamentos vencidos o parcialmente consumidos',
    'Tabletas, cápsulas, jarabes, cremas, blísteres, ampollas y cajas de medicamentos humanos o veterinarios vencidos o deteriorados.',
    ARRAY['pastillas vencidas', 'jarabe vencido', 'blister de medicamentos', 'remedios vencidos'],
    'posconsumo_especial', 'punto_posconsumo', 'farmaceutico', ARRAY['plastico_aluminio_blister', 'carton_empaque'],
    'riesgo_quimico', true,
    ARRAY['No consumas ni regales medicamentos vencidos.', 'Rasga o inutiliza las cajas de cartón para evitar la falsificación o reventa ilegal, pero consérvalas junto al envase primario.', 'Deposita el medicamento dentro de su envase original bien cerrado en los contenedores de Punto Azul.'],
    ARRAY['NUNCA arrojes jarabes o pastillas por el inodoro ni el lavamanos: las plantas de tratamiento convencional no eliminan principios activos farmacéuticos.', 'No deposites agujas, lancetas ni algodones con sangre en los contenedores de Punto Azul.'],
    'Los residuos de fármacos requieren destrucción térmica controlada mediante el programa posconsumo Punto Azul (Resolución 0371 de 2009) para proteger el agua y evitar el contrabando de envases.',
    '[{"type":"reducir","title":"Compra responsable y revisión de botiquín","description":"Adquiere únicamente las dosis formuladas y revisa el botiquín familiar cada 6 meses.","safetyNote":"Mantén los medicamentos por entregar fuera del alcance de niños y mascotas."}]'::jsonb,
    '{"programName":"Corporación Punto Azul","regulation":"Resolución 0371 de 2009 (MinAmbiente)","whatIsIt":"Medicamentos vencidos, deteriorados o parcialmente consumidos y sus empaques.","whySpecial":"Evita contaminación química del agua por antibióticos/hormonas y previene la falsificación farmacéutica.","authorizedReceiver":"Contenedores Punto Azul ubicados en droguerías, IPS, supermercados y universidades.","restrictions":"Prohibido depositar jeringas con aguja, gasas con sangre o residuos biosanitarios cortopunzantes."}'::jsonb,
    'src-punto-azul', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-celular-danado', 'celular-danado', 'Celular dañado o en desuso (RAEE)',
    'Teléfonos móviles, smartphones o teléfonos fijos obsoletos o averiados.',
    ARRAY['telefono roto', 'smartphone viejo', 'residuo electronico', 'raee'],
    'posconsumo_especial', 'punto_posconsumo', 'raee', ARRAY['litio_bateria', 'circuitos_impresos', 'vidrio_pantalla', 'plastico_abs'],
    'limpio_seco', true,
    ARRAY['Si el equipo aún enciende, realiza una copia de seguridad y restablécelo de fábrica para borrar tus datos personales.', 'Retira la tarjeta SIM y la tarjeta microSD.', 'No intentes abrir ni perforar la batería de litio integrada.', 'Entrégalo en puntos posconsumo de RAEE (EcoCómputo, operadores móviles o centros comerciales).'],
    ARRAY['Las baterías de iones de litio infladas o perforadas tienen riesgo de incendio si se compactan en camiones de basura.', 'No entregues a chatarreros informales que quemen cables a cielo abierto.'],
    'Los Residuos de Aparatos Eléctricos y Electrónicos (RAEE - Ley 1672 de 2013) contienen tanto metales preciosos recuperables (oro, cobre, paladio) como sustancias peligrosas.',
    '[{"type":"reparar","title":"Reparar pantalla o batería en servicio técnico","description":"Muchas fallas comunes (puerto de carga o batería agotada) son reparables y extienden la vida del equipo por años.","safetyNote":"Si la batería está hinchada, acude a un técnico especializado y no conectes el cargador."},{"type":"donar","title":"Donar si aún es funcional","description":"Un equipo funcional puede servir para estudio o comunicación básica tras borrar tus cuentas personales."}]'::jsonb,
    '{"programName":"EcoCómputo / Programas Posconsumo RAEE","regulation":"Ley 1672 de 2013 y Decreto 284 de 2018","whatIsIt":"Residuos de Aparatos Eléctricos y Electrónicos de consumo y telecomunicaciones.","whySpecial":"Contienen baterías de litio y tarjetas electrónicas que requieren desensamble técnico certificado.","authorizedReceiver":"Contenedores EcoCómputo, puntos verdes de operadores de telefonía y jornadas RAEE municipales.","restrictions":"Borrar siempre la información personal antes de depositar el dispositivo."}'::jsonb,
    'src-ecocomputo', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-cargador', 'cargador-y-cables', 'Cargador, cables o periférico electrónico',
    'Cargadores de celular o computador, cables USB, ratones (mouse), teclados o audífonos dañados.',
    ARRAY['cable usb', 'cargador roto', 'mouse danado', 'teclado viejo', 'audifonos rotos'],
    'posconsumo_especial', 'punto_posconsumo', 'raee', ARRAY['cobre', 'plastico_pvc', 'componentes_electronicos'],
    'limpio_seco', true,
    ARRAY['Enrolla el cable sin anudarlo con fuerza.', 'Entrégalo en un contenedor de residuos electrónicos (RAEE / EcoCómputo).'],
    ARRAY['Nunca quemes cables para extraer el cobre: la combustión de recubrimientos plásticos libera dioxinas altamente tóxicas.', 'No va en la bolsa blanca de envases domésticos.'],
    'Los cargadores y periféricos hacen parte de los RAEE regulados en Colombia y deben canalizarse hacia gestores licenciados que recuperan el cobre y los polímeros de forma segura.',
    '[{"type":"reparar","title":"Reparación de conectores o uso de cables modulares","description":"Cuidar el doblez cerca del conector prolonga la vida de los cables y reduce la generación de basura electrónica.","safetyNote":"No utilices cargadores con cables pelados o chispazos por riesgo eléctrico."}]'::jsonb,
    '{"programName":"Corporación EcoCómputo","regulation":"Resolución 1512 de 2010 / Ley 1672 de 2013","whatIsIt":"Periféricos y accesorios de computadores y telecomunicaciones.","whySpecial":"Requiere recuperación técnica de metales no ferrosos y manejo de retardantes de llama en plásticos.","authorizedReceiver":"Puntos posconsumo EcoCómputo y puntos de recolección RAEE.","restrictions":"Entregar desconectado y seco."}'::jsonb,
    'src-ecocomputo', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-bombilla', 'bombilla-o-tubo-fluorescente', 'Bombilla ahorradora, LED o tubo fluorescente',
    'Bombillas compactas fluorescentes (ahorradoras), tubos fluorescentes, bombillas LED o de alumbrado.',
    ARRAY['bombillo fundido', 'lampara fluorescente', 'bombillo led', 'tubo de luz'],
    'posconsumo_especial', 'punto_posconsumo', 'iluminacion_raee', ARRAY['vidrio_especial', 'componentes_electronicos', 'mercurio_en_fluorescentes'],
    'limpio_seco', true,
    ARRAY['Manipular con cuidado para evitar que el bulbo de vidrio se rompa.', 'Guardar preferiblemente en la caja de cartón del bombillo nuevo para protegerlo durante el traslado.', 'Depositar suavemente en los contenedores del programa posconsumo Lúmina.'],
    ARRAY['PROHIBIDO depositar en la bolsa blanca de vidrio de envases: contamina el reciclaje de vidrio y las fluorescentes contienen vapor de mercurio.', 'Si una bombilla ahorradora se rompe en casa, ventila la habitación 15 minutos y recoge los fragmentos con cartón rígido (sin usar aspiradora).'],
    'Las bombillas requieren gestión posconsumo (Resolución 1511 de 2010) porque contienen componentes electrónicos y, en el caso de las fluorescentes, pequeñas cantidades de mercurio.',
    '[{"type":"reducir","title":"Preferir tecnología LED de larga duración","description":"Las bombillas LED consumen menos energía, duran más horas y no contienen mercurio, aunque al final de su vida útil siguen siendo RAEE.","safetyNote":"Desconecta siempre el interruptor eléctrico antes de cambiar una bombilla."}]'::jsonb,
    '{"programName":"Corporación Lúmina","regulation":"Resolución 1511 de 2010 / Resolución 851 de 2022","whatIsIt":"Residuos de bombillas y luminarias en desuso.","whySpecial":"Las lámparas fluorescentes contienen mercurio y todas las bombillas tienen vidrio con aditivos incompatibles con botellas.","authorizedReceiver":"Contenedores Lúmina en centros comerciales, ferreterías y entidades públicas.","restrictions":"Evitar arrojar las bombillas desde altura dentro del contenedor para no romperlas."}'::jsonb,
    'src-lumina', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  ),
  (
    'item-ropa-usada', 'ropa-y-textiles-usados', 'Ropa usada o textiles',
    'Prendas de vestir, calzado, sábanas o retazos textiles en buen estado o desgastados.',
    ARRAY['camisa vieja', 'pantalon usado', 'tela', 'zapatos usados', 'textiles'],
    'posconsumo_especial', 'punto_posconsumo', 'textil', ARRAY['algodon', 'poliester'],
    'limpio_seco', true,
    ARRAY['Lava y seca completamente las prendas antes de entregarlas.', 'Separa las prendas en buen estado (para donación o segunda mano) de aquellas rotas o desgastadas (para aprovechamiento textil o trapos de limpieza).'],
    ARRAY['No entregues textiles húmedos, con moho ni impregnados de aceites automotrices o solventes en campañas de donación.'],
    'Los textiles no suelen procesarse en la bolsa blanca ordinaria de empaques, pero tienen alto potencial de economía circular mediante donación, bancos de ropa y gestores de recuperación de fibra textil.',
    '[{"type":"donar","title":"Donación o intercambio de prendas en buen estado","description":"Si la prenda es funcional, entrégala limpia a fundaciones sociales, bancos de ropa o bazares de moda circular.","safetyNote":"Entregar siempre lavada y seca."},{"type":"reparar","title":"Zurcido, ajuste o transformación en paños de limpieza","description":"Una prenda de algodón desgastada puede cortarse para convertirse en paños de limpieza reutilizables en el hogar."}]'::jsonb,
    '{"programName":"Iniciativas de Moda Circular y Bancos de Ropa Locales","regulation":"Estrategia Nacional de Economía Circular","whatIsIt":"Prendas de vestir y textiles domésticos posconsumo.","whySpecial":"En el relleno sanitario los textiles sintéticos tardan décadas en degradarse y los naturales generan gases de efecto invernadero.","authorizedReceiver":"Contenedores de recolección textil en centros comerciales, fundaciones sociales y gestores textiles locales.","restrictions":"Entregar en bolsa cerrada, limpia y completamente seca."}'::jsonb,
    'src-minambiente-posconsumo', 'Medellín y Nacional', 'verificado', '2026-10-01'
  ),
  (
    'item-aceite-cocina-usado', 'aceite-de-cocina-usado', 'Aceite de cocina usado (ACU)',
    'Aceite vegetal sobrante de frituras o conservas domésticas.',
    ARRAY['aceite quemado', 'aceite de fritura', 'aceite vegetal usado', 'acu'],
    'posconsumo_especial', 'punto_posconsumo', 'aceite_vegetal', ARRAY[]::text[],
    'liquido_especial', true,
    ARRAY['Deja enfriar completamente el aceite después de cocinar.', 'Cuélalo con un colador o malla para retirar restos de comida quemada.', 'Viértelo con ayuda de un embudo en una botella plástica PET limpia y seca, y cierra muy bien la tapa.', 'Entrégalo únicamente en puntos de recolección de Aceite de Cocina Usado (ACU).'],
    ARRAY['NUNCA viertas el aceite por el sifón del lavaplatos: obstruye las tuberías con bloques de grasa y un solo litro contamina miles de litros de agua.', 'No deposites la botella con aceite en la bolsa blanca de reciclaje de plástico ni suelto en la bolsa negra.'],
    'El Aceite de Cocina Usado está regulado en Colombia (Resolución 0316 de 2018 de MinAmbiente) y, cuando se entrega en botella cerrada en puntos ACU, se transforma industrialmente en biodiésel o jabones.',
    '[{"type":"aprovechar","title":"Transformación en biodiésel mediante gestores ACU","description":"Entregar el aceite embotellado en puntos autorizados permite convertir un residuo altamente contaminante del agua en biocombustible.","safetyNote":"Nunca manipules ni emcases el aceite mientras esté caliente para evitar quemaduras graves."}]'::jsonb,
    '{"programName":"Gestores Autorizados de Aceite de Cocina Usado (ACU)","regulation":"Resolución 0316 de 2018 (MinAmbiente)","whatIsIt":"Aceite vegetal de origen doméstico usado en preparación de alimentos.","whySpecial":"Altísimo impacto en redes de alcantarillado y cuerpos de agua si se vierte por el desagüe.","authorizedReceiver":"Puntos de recolección de ACU en unidades residenciales, supermercados y programas ambientales municipales (ej. Emvarias / Área Metropolitana).","restrictions":"No mezclar con aceite mineral de motor, combustibles ni agua."}'::jsonb,
    'src-res-2184-2019', 'Nacional (Colombia)', 'verificado', '2026-10-01'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Referencias Institucionales de Recolección (Sin coordenadas ni horarios inventados)
INSERT INTO public.collection_points (
  id, name, entity_operator, description, address, municipality, department,
  latitude, longitude, schedule, contact_info, official_url,
  delivery_requirements, source_id, verification_status, last_verified_at
)
VALUES
  (
    'cp-med-emvarias-info',
    'Canales Oficiales Emvarias Grupo EPM — Rutas de Aprovechamiento y Puntos Naranja',
    'Emvarias Grupo EPM / Alcaldía de Medellín',
    'Referencia institucional oficial para consultar frecuencias de recolección, rutas de reciclaje y ubicación vigente de Puntos Naranja y contenedores en Medellín.',
    'Consulta por barrio/comuna en el portal oficial de Emvarias Grupo EPM (Medellín, Antioquia)',
    'Medellín', 'Antioquia', NULL, NULL,
    'Sujeto a la ruta asignada por comuna y barrio en Medellín (consultar portal oficial)',
    'Línea de Atención EPM / Emvarias: (604) 44 44 115',
    'https://www.emvarias.com.co/',
    ARRAY['Entregar materiales aprovechables limpios, secos y compactados.', 'Verificar el día y horario de la ruta de aprovechamiento de tu sector.'],
    'src-emvarias-medellin', 'referencia_institucional', '2026-10-01'
  ),
  (
    'cp-nac-punto-azul',
    'Red Nacional de Contenedores Punto Azul (Medicamentos Vencidos)',
    'Corporación Punto Azul',
    'Programa posconsumo acreditado ante la ANLA para la recepción segura de medicamentos humanos y veterinarios vencidos o parcialmente consumidos.',
    'Buscador oficial de contenedores verificados por municipio y barrio en el portal de Punto Azul',
    'Medellín', 'Antioquia', NULL, NULL,
    'Según el horario del establecimiento aliado (droguerías, almacenes o centros comerciales registrados)',
    'Portal oficial Corporación Punto Azul',
    'https://www.puntoazul.com.co/',
    ARRAY['Inutilizar cajas y etiquetas antes de depositar.', 'No depositar agujas, lancetas ni residuos biosanitarios cortopunzantes.'],
    'src-punto-azul', 'referencia_institucional', '2026-10-01'
  ),
  (
    'cp-nac-pilas-ambiente',
    'Red Posconsumo Pilas con el Ambiente (Pilas Domésticas)',
    'Corporación Pilas con el Ambiente',
    'Programa posconsumo oficial para la recolección y gestión ambiental de pilas y acumuladores domésticos en desuso en Medellín, Valle de Aburrá y Colombia.',
    'Consulta de contenedores autorizados en el mapa oficial de Pilas con el Ambiente',
    'Medellín', 'Antioquia', NULL, NULL,
    'Según horario del punto anfitrión autorizado',
    'Portal oficial Corporación Pilas con el Ambiente',
    'https://www.pilascolombia.com/',
    ARRAY['Entregar pilas domésticas secas y sin desarmar.', 'Si presentan sulfatación, cubrir los polos con cinta adhesiva.'],
    'src-pilas-ambiente', 'referencia_institucional', '2026-10-01'
  ),
  (
    'cp-nac-ecocomputo-lumina',
    'Programas Posconsumo RAEE y Bombillas (EcoCómputo y Lúmina)',
    'Corporación EcoCómputo / Corporación Lúmina',
    'Canales posconsumo oficiales para computadores, periféricos, cargadores, celulares en desuso y bombillas ahorradoras, tubos fluorescentes o LED.',
    'Consulta de puntos fijos y jornadas de recolección en Medellín y Valle de Aburrá en los portales oficiales',
    'Medellín', 'Antioquia', NULL, NULL,
    'Según horario del punto fijo o jornada posconsumo',
    'Portales oficiales EcoCómputo y Lúmina',
    'https://ecocomputo.com/',
    ARRAY['Borrar datos personales de celulares o computadores antes de la entrega.', 'Entregar bombillas sin romper, preferiblemente protegidas en caja de cartón.'],
    'src-ecocomputo', 'referencia_institucional', '2026-10-01'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.collection_point_materials (collection_point_id, waste_category, material_name, acceptance_conditions)
VALUES
  ('cp-med-emvarias-info', 'aprovechable', 'Plástico PET y PEAD', 'Limpio, seco y compactado'),
  ('cp-med-emvarias-info', 'aprovechable', 'Cartón y Papel limpio', 'Limpio, seco, sin grasa ni humedad'),
  ('cp-med-emvarias-info', 'aprovechable', 'Vidrio de envase y Metales', 'Enjuagado, seco y sin roturas expuestas'),
  ('cp-nac-punto-azul', 'posconsumo_especial', 'Medicamentos vencidos y blísteres', 'Sin agujas ni residuos cortopunzantes'),
  ('cp-nac-pilas-ambiente', 'posconsumo_especial', 'Pilas domésticas AA, AAA, 9V, botón', 'Secas y sin perforar'),
  ('cp-nac-ecocomputo-lumina', 'posconsumo_especial', 'Celulares, cargadores y periféricos RAEE', 'Desconectados y sin datos personales'),
  ('cp-nac-ecocomputo-lumina', 'posconsumo_especial', 'Bombillas ahorradoras, LED y fluorescentes', 'Íntegras, protegidas contra rotura')
ON CONFLICT (collection_point_id, material_name) DO NOTHING;
