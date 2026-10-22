import {
  ClassificationRule,
  CollectionPoint,
  EducationalArticle,
  EnvironmentalSource,
  SustainabilityChallenge,
  WasteItem,
} from "@/types/ecoscan";

export const COLOMBIAN_MUNICIPALITIES = [
  "Medellín",
  "Bello",
  "Envigado",
  "Itagüí",
  "Sabaneta",
  "La Estrella",
  "Caldas",
  "Copacabana",
  "Girardota",
  "Barbosa",
  "Bogotá D.C.",
  "Cali",
  "Barranquilla",
  "Bucaramanga",
  "Pereira",
  "Manizales",
] as const;

export const VERIFIED_SOURCES: Record<string, EnvironmentalSource> = {
  "src-res-2184-2019": {
    id: "src-res-2184-2019",
    entityName: "Ministerio de Ambiente y Desarrollo Sostenible de Colombia",
    resourceTitle:
      "Resolución 2184 de 2019 — Código de colores unificado para la separación de residuos en la fuente (Blanco, Verde y Negro)",
    url: "https://www.minambiente.gov.co/",
    sourceType: "normativa_nacional",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-minambiente-posconsumo": {
    id: "src-minambiente-posconsumo",
    entityName: "Ministerio de Ambiente y Desarrollo Sostenible / ANLA",
    resourceTitle:
      "Lineamientos de Programas Posconsumo y Gestión Diferenciada de Residuos en Colombia",
    url: "https://www.minambiente.gov.co/asuntos-ambientales-sectorial-y-urbana/programas-posconsumo/",
    sourceType: "programa_posconsumo",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-pilas-ambiente": {
    id: "src-pilas-ambiente",
    entityName: "Corporación Pilas con el Ambiente",
    resourceTitle:
      "Programa Posconsumo de Pilas y Acumuladores Domésticos (Resolución 1297 de 2010 / Res. 851 de 2022)",
    url: "https://www.pilascolombia.com/",
    sourceType: "programa_posconsumo",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-punto-azul": {
    id: "src-punto-azul",
    entityName: "Corporación Punto Azul",
    resourceTitle:
      "Programa Posconsumo de Medicamentos Vencidos o Parcialmente Consumidos (Resolución 0371 de 2009)",
    url: "https://www.puntoazul.com.co/",
    sourceType: "programa_posconsumo",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-ecocomputo": {
    id: "src-ecocomputo",
    entityName: "Corporación EcoCómputo",
    resourceTitle:
      "Gestión Posconsumo de Residuos de Computadores, Periféricos y RAEE (Ley 1672 de 2013)",
    url: "https://ecocomputo.com/",
    sourceType: "programa_posconsumo",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-lumina": {
    id: "src-lumina",
    entityName: "Corporación Lúmina",
    resourceTitle:
      "Programa Posconsumo de Iluminación y Bombillas en Desuso (Resolución 1511 de 2010)",
    url: "https://lumina.com.co/",
    sourceType: "programa_posconsumo",
    geographicScope: "Nacional (Colombia)",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
  "src-emvarias-medellin": {
    id: "src-emvarias-medellin",
    entityName: "Emvarias Grupo EPM / Alcaldía de Medellín",
    resourceTitle:
      "Guía de Separación y Rutas de Aprovechamiento en Medellín y el Valle de Aburrá",
    url: "https://www.emvarias.com.co/",
    sourceType: "operador_aseo",
    geographicScope: "Medellín y Valle de Aburrá",
    consultedAt: "2026-10-01",
    reviewedAt: "2026-10-01",
  },
};

export const VERIFIED_CLASSIFICATION_RULES: ClassificationRule[] = [
  {
    id: "rule-posconsumo-especial",
    code: "COL-POS-001",
    name: "Prioridad de Gestión Posconsumo o Manejo Especial",
    priority: 10,
    conditions: {
      requiresSpecialManagement: true,
      materials: [
        "metal_quimico",
        "farmaceutico",
        "raee",
        "iluminacion_raee",
        "aceite_vegetal",
        "textil",
      ],
    },
    targetCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    recommendation:
      "No depositar en canecas domésticas (blanca, verde ni negra). Entregar únicamente en puntos de recolección posconsumo o gestores autorizados.",
    preparationSteps: [
      "Mantener el residuo íntegro sin desarmar, perforar ni quemar.",
      "Almacenar temporalmente en un lugar seco, ventilado y fuera del alcance de niños o mascotas.",
      "Consultar los requisitos específicos del programa posconsumo en tu municipio antes de entregarlo.",
    ],
    explanation:
      "Los residuos sujetos a gestión diferenciada o posconsumo contienen compuestos químicos, metales pesados, fármacos, aceites o componentes electrónicos que no son compatibles con la recolección ordinaria de aseo.",
    mistakesToAvoid: [
      "Nunca arrojar por el sanitario, lavaplatos o alcantarillado.",
      "No mezclar con materiales reciclables de bolsa blanca ni con basura ordinaria de bolsa negra.",
    ],
    sourceId: "src-minambiente-posconsumo",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-contaminado-quimico-biologico",
    code: "COL-CONT-003",
    name: "Envases con Contaminación Química, Plaguicidas o Riesgo Biológico",
    priority: 15,
    conditions: {
      conditions: ["contaminado_quimico", "riesgo_biologico"],
    },
    targetCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    recommendation:
      "Requiere ruta posconsumo especializada (ej. Cierra el Ciclo para plaguicidas domésticos) o disposición especial de seguridad. Nunca va a la bolsa blanca.",
    preparationSteps: [
      "Nunca reutilizar el envase para almacenar agua, alimentos ni productos caseros.",
      "Conservar la etiqueta original legible para que el gestor identifique la sustancia.",
      "Mantener cerrado herméticamente con su tapa original.",
    ],
    explanation:
      "Los envases que contuvieron plaguicidas, solventes, hidrocarburos o fluidos biológicos representan riesgo directo para la salud de los recicladores de oficio y contaminan los lotes de plástico o vidrio.",
    mistakesToAvoid: [
      "No perforar envases presurizados o aerosoles.",
      "No lavar restos de plaguicidas o solventes en el lavaplatos doméstico.",
    ],
    sourceId: "src-minambiente-posconsumo",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-parcialmente-contaminado-carton",
    code: "COL-PART-002A",
    name: "Empaque de Cartón Parcialmente Contaminado con Comida o Grasa",
    priority: 18,
    conditions: {
      materials: ["carton", "papel"],
      conditions: ["parcialmente_contaminado"],
    },
    targetCategory: "requiere_verificacion",
    containerColor: "verificacion",
    recommendation:
      "Separación por partes: corta o desprende la sección limpia y seca para la bolsa BLANCA, y deposita la sección manchada de grasa o salsa en la bolsa NEGRA.",
    preparationSteps: [
      "Retira cualquier resto sólido de comida.",
      "Separa físicamente la tapa o caras limpias del fondo engrasado.",
      "Dobla el cartón limpio en la bolsa blanca y descarta el cartón engrasado en la bolsa negra.",
    ],
    explanation:
      "En cajas como las de pizza o pastelería, el aceite absorbido en el fondo daña el proceso de reciclaje del papel, pero la tapa superior suele estar intacta y es 100% aprovechable si se separa.",
    mistakesToAvoid: [
      "No introduzcas la caja entera en la bolsa blanca si tiene manchas de grasa.",
      "No dejes restos de queso, salsas o servilletas usadas dentro de la caja.",
    ],
    sourceId: "src-res-2184-2019",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-contaminado-grasa-comida",
    code: "COL-CONT-002",
    name: "Material Contaminado con Grasa o Restos de Comida Adheridos",
    priority: 20,
    conditions: {
      materials: [
        "papel",
        "carton",
        "plastico_pet",
        "plastico_pead",
        "plastico_otro",
        "multicapa",
      ],
      conditions: ["contaminado_grasa", "contaminado_comida"],
    },
    targetCategory: "no_aprovechable",
    containerColor: "negro",
    recommendation:
      "Depositar en el recipiente o bolsa NEGRA (Residuos no aprovechables). Si es un envase rígido (plástico, vidrio o metal) que puede lavarse fácilmente, enjuágalo y sécalo para que pase a la bolsa blanca.",
    preparationSteps: [
      "Si es papel o servilleta engrasada: no se puede lavar; deposítalo directamente en la bolsa negra.",
      "Si es un envase rígido: vacía los restos, enjuágalo brevemente y déjalo escurrir para cambiar su estado a limpio y seco.",
    ],
    explanation:
      "La Resolución 2184 de 2019 asigna el color negro a los residuos no aprovechables como servilletas usadas, papeles metalizados o empaques con restos de comida que no pueden limpiarse.",
    mistakesToAvoid: [
      "No mezclar servilletas usadas ni cartones engrasados en la bolsa blanca.",
      "No entregar envases con líquidos o comida en descomposición a las rutas de recicladores.",
    ],
    sourceId: "src-res-2184-2019",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-organico-aprovechable",
    code: "COL-ORG-004",
    name: "Residuos Orgánicos Biodegradables Aprovechables",
    priority: 30,
    conditions: {
      materials: ["organico"],
      conditions: ["organico_fresco", "limpio_seco"],
    },
    targetCategory: "organico_aprovechable",
    containerColor: "verde",
    recommendation:
      "Depositar en el recipiente o bolsa VERDE (Residuos orgánicos aprovechables) o aprovechar en compostaje doméstico/comunitario según disponibilidad local.",
    preparationSteps: [
      "Escurrir el exceso de agua o líquidos antes de depositar.",
      "Retirar sellos plásticos adhesivos de cáscaras de frutas.",
      "Evitar mezclar con bolsas plásticas no compostables o colillas.",
    ],
    explanation:
      "Bajo la Resolución 2184 de 2019, el recipiente verde está destinado a restos de alimentos crudos, cáscaras de frutas, verduras y restos de poda que pueden transformarse en abono.",
    mistakesToAvoid: [
      "No mezclar orgánicos húmedos en la bolsa blanca porque arruinan el papel y el cartón.",
      "Verificar si tu operador municipal o comunidad cuenta con recolección selectiva de orgánicos o pacas digestoras.",
    ],
    sourceId: "src-res-2184-2019",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-aprovechable-limpio-seco",
    code: "COL-APR-005",
    name: "Materiales de Envase, Empaque y Papel Limpios y Secos",
    priority: 40,
    conditions: {
      materials: [
        "plastico_pet",
        "plastico_pead",
        "vidrio",
        "aluminio",
        "metal",
        "papel",
        "carton",
        "multicapa",
      ],
      conditions: ["limpio_seco"],
    },
    targetCategory: "aprovechable",
    containerColor: "blanco",
    recommendation:
      "Depositar en el recipiente o bolsa BLANCA (Residuos aprovechables) y entregar a organizaciones de recicladores de oficio o rutas selectivas.",
    preparationSteps: [
      "Vaciar por completo el contenido del envase.",
      "Enjuagar ligeramente si contenía bebidas azucaradas, lácteos o salsas, y dejar escurrir hasta secar.",
      "Compactar botellas plásticas, cajas multicapa o plegar cajas de cartón para optimizar espacio.",
    ],
    explanation:
      "La Resolución 2184 de 2019 establece el color blanco para plástico, vidrio, metales, papel, cartón y envases multicapa limpios y secos, facilitando su reincorporación al ciclo productivo.",
    mistakesToAvoid: [
      "No dejar líquidos dentro de las botellas.",
      "No romper envases de vidrio intencionalmente.",
    ],
    sourceId: "src-res-2184-2019",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "rule-verificacion-material-ambiguo",
    code: "COL-VER-099",
    name: "Material Compuesto o Condición No Verificada",
    priority: 99,
    conditions: {
      materials: ["plastico_otro", "compuesto_desconocido"],
      conditions: ["desconocido"],
    },
    targetCategory: "requiere_verificacion",
    containerColor: "verificacion",
    recommendation:
      "Caso sujeto a verificación: confirma el símbolo de identificación de resina (1 al 7), si el empaque es metalizado flexible (mecato) o si existe ruta local antes de mezclarlo en la bolsa blanca.",
    preparationSteps: [
      "Revisa si el empaque tiene sello de resina reciclable (PET #1, PEAD #2, PP #5).",
      "Si es un empaque flexible metalizado sucio o sin ruta de aprovechamiento de flexibles en tu sector, dispónlo en bolsa negra para no contaminar el reciclaje estándar.",
    ],
    explanation:
      "No todos los plásticos o materiales compuestos tienen mercado o planta de transformación activa en cada municipio. Ante la duda, es preferible verificar para evitar el 'reciclaje aspiracional' que contamina la bolsa blanca.",
    mistakesToAvoid: [
      "No asumas que cualquier objeto plástico es automáticamente reciclable en todas las ciudades.",
    ],
    sourceId: "src-res-2184-2019",
    geographicScope: "Nacional (Colombia)",
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
];

export const VERIFIED_WASTE_ITEMS: WasteItem[] = [
  {
    id: "item-botella-plastico",
    slug: "botella-de-plastico",
    name: "Botella de plástico (PET)",
    description:
      "Envase plástico transparente o de color utilizado para agua, gaseosas, jugos o bebidas hidratantes (resina PET #1 o PEAD #2).",
    synonyms: [
      "envase pet",
      "botella de agua",
      "botella de gaseosa",
      "tarro plastico",
      "botella de jugo",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "plastico_pet",
    secondaryMaterials: ["polipropileno_tapa", "etiqueta_polipropileno"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Vaciar completamente cualquier líquido residual.",
      "Enjuagar brevemente con poca agua si contenía bebidas azucaradas o lácteas y dejar escurrir.",
      "Aplastar la botella para reducir su volumen y enroscar nuevamente la tapa plástica.",
    ],
    warnings: [
      "No introduzcas colillas de cigarrillo, servilletas ni envolturas dentro de la botella (excepto si elaboras ecoladrillos destinados a una fundación que los reciba expresamente).",
      "Si el envase contuvo agroquímicos, venenos o solventes, NO va en bolsa blanca.",
    ],
    whyExplanation:
      "El tereftalato de polietileno (PET #1) cuenta con una de las cadenas de aprovechamiento más consolidadas en Colombia bajo la Resolución 2184 de 2019 cuando se entrega limpio y seco.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Usa termo o botella reutilizable duradera",
        description:
          "Llevar un termo de acero inoxidable o vidrio seguro evita el consumo recurrente de envases plásticos de un solo uso.",
        safetyNote:
          "Evita rellenar repetidamente botellas PET de un solo uso con líquidos calientes o exponerlas al sol.",
      },
      {
        type: "aprovechar",
        title: "Entrega directa a recicladores de oficio",
        description:
          "Entregar las botellas limpias y compactadas facilita el transporte y aumenta la eficiencia de las asociaciones de recicladores.",
        safetyNote: "Asegúrate de que estén vacías y secas.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-botella-vidrio",
    slug: "botella-de-vidrio",
    name: "Botella o frasco de vidrio",
    description:
      "Envases de vidrio transparente, ámbar o verde de bebidas, salsas, conservas, café soluble o mermeladas.",
    synonyms: [
      "frasco de vidrio",
      "envase de vidrio",
      "botella de cerveza",
      "tarro de compota",
      "botella de vino",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "vidrio",
    secondaryMaterials: ["tapa_metalica", "etiqueta_papel"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Vaciar por completo el contenido y enjuagar restos de alimentos, salsas o bebidas.",
      "Dejar escurrir hasta que el interior esté seco.",
      "Separar la tapa metálica o plástica (ambas van en la bolsa blanca si están limpias).",
    ],
    warnings: [
      "Si el vidrio está roto, envuélvelo en periódico o cartón grueso, asegúralo con cinta y escribe 'VIDRIO ROTO' por fuera para proteger las manos del reciclador.",
      "No mezcles espejos, bombillas, cerámica, porcelana ni refractarias (Pyrex) con botellas de vidrio: tienen diferente punto de fusión.",
    ],
    whyExplanation:
      "El vidrio de envase es 100% reciclable infinitas veces sin perder calidad cuando no se contamina con cerámica, espejos ni bombillas.",
    circularAlternatives: [
      {
        type: "reutilizar",
        title: "Almacenamiento seguro de alimentos secos en alacena",
        description:
          "Los frascos de vidrio con tapa de rosca lavados y esterilizados con agua caliente son excelentes para conservar granos, especias, avena o semillas.",
        safetyNote:
          "Verifica siempre que la boca del frasco no tenga astillas ni fisuras antes de reutilizarlo.",
      },
      {
        type: "programa_especial",
        title: "Retornabilidad en tiendas de barrio",
        description:
          "Si es un envase retornable de bebida, devuélvelo en el punto de compra para su lavado industrial y llenado directo.",
        safetyNote: "No introduzcas objetos extraños ni pinturas en botellas retornables.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-lata-aluminio",
    slug: "lata-de-aluminio",
    name: "Lata de aluminio o conserva metálica",
    description:
      "Latas de bebidas (aluminio) y latas de alimentos en conserva como atún, sardinas, maíz o duraznos (hojalata/acero).",
    synonyms: [
      "lata de cerveza",
      "lata de gaseosa",
      "lata de atun",
      "envase metalico",
      "hojalata",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "aluminio",
    secondaryMaterials: ["acero_hojalata"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Vaciar completamente el líquido o alimento.",
      "En latas de atún o conservas en aceite: limpia el exceso de grasa con una servilleta usada (la servilleta va en bolsa negra), enjuaga con agua jabonosa y deja secar.",
      "Introduce la tapa metálica dentro de la lata y presiona ligeramente el borde para evitar cortes.",
    ],
    warnings: [
      "Manipula con precaución los bordes cortantes de las latas de conserva.",
      "No mezcles latas de pintura, thinner, pegantes ni aerosoles de insecticidas en la bolsa blanca.",
    ],
    whyExplanation:
      "El aluminio y el acero de envases tienen alta tasa de recuperación en Colombia y su fundición secundaria ahorra hasta el 95% de la energía frente a la minería primaria.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Priorizar alimentos frescos o porciones familiares",
        description:
          "Comprar legumbres secas a granel o preparar alimentos frescos disminuye la generación de envases metálicos individuales.",
        safetyNote:
          "No conserves alimentos abiertos dentro de latas de hojalata en la nevera; pásalos a un recipiente de vidrio.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-caja-carton",
    slug: "caja-de-carton",
    name: "Caja de cartón limpia",
    description:
      "Cajas de cartón corrugado o plegadizo de envíos, electrodomésticos, cereales, zapatos o mudanzas, limpias y secas.",
    synonyms: [
      "carton corrugado",
      "caja de envio",
      "empaque de carton",
      "cubeta de huevos limpia",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "carton",
    secondaryMaterials: ["cinta_adhesiva"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Desarma la caja y aplánala completamente para reducir su volumen.",
      "Retira excesos de cinta plástica adhesiva, etiquetas térmicas grandes o rellenos de plástico burbuja.",
      "Amarra o agrupa las láminas de cartón y protégelas de la humedad o la lluvia al sacarlas.",
    ],
    warnings: [
      "El cartón mojado, con hongos o impregnado de aceite pierde sus propiedades mecánicas para el reciclaje.",
    ],
    whyExplanation:
      "La fibra larga del cartón corrugado limpio es uno de los insumos más importantes para la industria papelera y las cooperativas de recicladores en Colombia.",
    circularAlternatives: [
      {
        type: "reutilizar",
        title: "Reutilizar para organización, mudanzas o envíos",
        description:
          "Las cajas de cartón en buen estado pueden reutilizarse varias veces para almacenar objetos secos o despachar paquetes antes de reciclarse.",
        safetyNote: "Guárdalas en un lugar seco y ventilado para evitar plagas.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-papel-limpio",
    slug: "papel-limpio",
    name: "Papel limpio de oficina o estudio",
    description:
      "Hojas de papel bond, cuadernos sin espiral, periódicos, revistas, sobres y folletos limpios y secos.",
    synonyms: [
      "hojas de papel",
      "periodico",
      "archivo de papel",
      "cuaderno usado",
      "papel bond",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "papel",
    secondaryMaterials: [],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Apila las hojas extendidas o dobladas; evita arrugarlas formando bolas porque se rompen las fibras de celulosa.",
      "Retira clips, ganchos legajadores, carpetas plásticas o anillos metálicos de cuadernos.",
      "Mantén el papel completamente seco dentro de la bolsa blanca.",
    ],
    warnings: [
      "Los recibos de cajero o datáfono en papel térmico (contienen bisfenoles), el papel carbón, las fotografías y el papel encerado no deben mezclarse con el papel bond.",
    ],
    whyExplanation:
      "El papel limpio y seco puede reciclarse entre 5 y 7 veces para fabricar nuevo papel, cartulinas o empaques moldeados.",
    circularAlternatives: [
      {
        type: "reutilizar",
        title: "Aprovechar la cara libre como borrador",
        description:
          "Reutiliza las hojas impresas por una sola cara para tomar apuntes, imprimir borradores o hacer listas en casa y la universidad.",
        safetyNote:
          "Rasga o tacha datos personales o financieros antes de entregar documentos al reciclaje.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-papel-contaminado",
    slug: "papel-contaminado-con-comida",
    name: "Papel o servilleta contaminada con comida",
    description:
      "Servilletas usadas, toallas de cocina absorbentes, envolturas de alimentos fritos, papel higiénico y papeles engrasados.",
    synonyms: [
      "servilleta usada",
      "papel engrasado",
      "toalla de cocina usada",
      "papel higienico",
      "envoltura de empanada",
    ],
    mainCategory: "no_aprovechable",
    containerColor: "negro",
    primaryMaterial: "papel",
    secondaryMaterials: ["grasa_organica"],
    defaultCondition: "contaminado_comida",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Deposita directamente en el recipiente o bolsa NEGRA (Residuos no aprovechables).",
      "Asegúrate de no mezclarlos en la bolsa blanca de papel limpio.",
    ],
    warnings: [
      "Nunca deposites servilletas usadas, pañuelos faciales ni papel higiénico en la bolsa blanca: contaminan los materiales reciclables y generan riesgo sanitario para los recicladores.",
    ],
    whyExplanation:
      "Las servilletas tienen fibras de celulosa muy cortas y, al absorber aceites o fluidos, no pueden limpiarse en las plantas de reciclaje de papel.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Sustituir por servilletas de tela y limpiones lavables",
        description:
          "Usar servilletas de tela e individuales lavables en casa evita cientos de servilletas desechables al mes.",
        safetyNote: "Lavar frecuentemente con agua y jabón para mantener la higiene.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-caja-pizza",
    slug: "caja-de-pizza",
    name: "Caja de pizza",
    description:
      "Empaque de cartón corrugado para alimentos calientes que suele tener la tapa limpia y la base impregnada de grasa o queso.",
    synonyms: ["empaque de pizza", "carton de pizza", "caja de domicilio"],
    mainCategory: "requiere_verificacion",
    containerColor: "verificacion",
    primaryMaterial: "carton",
    secondaryMaterials: ["grasa_alimentaria"],
    defaultCondition: "parcialmente_contaminado",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Retira cualquier resto de comida, bordes de masa o papel parafinado interior.",
      "Separa o corta la tapa superior si está libre de grasa y salsa: esa parte limpia va en la bolsa BLANCA.",
      "Deposita la base inferior manchada de grasa en la bolsa NEGRA.",
    ],
    warnings: [
      "No entregues la caja completa en la bolsa blanca si el fondo tiene manchas de aceite: el aceite no se separa del agua en el repulpeo del cartón.",
    ],
    whyExplanation:
      "La clasificación de una caja de pizza depende de su estado real: separar la parte limpia de la parte engrasada rescata cartón valioso sin contaminar el lote de reciclaje.",
    circularAlternatives: [
      {
        type: "aprovechar",
        title: "División selectiva del empaque (Tapa vs. Base)",
        description:
          "Desprender la tapa limpia toma 5 segundos y permite aprovechar la mitad del cartón.",
        safetyNote: "Verifica que la tapa tampoco tenga manchas de salsa ni grasa.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-envase-multicapa",
    slug: "envase-multicapa",
    name: "Envase multicapa (Tetra Pak)",
    description:
      "Cajas laminadas de leche, jugos, cremas o salsas compuestas por cartón (aprox. 75%), polietileno (20%) y aluminio (5%).",
    synonyms: [
      "tetra pak",
      "caja de leche",
      "caja de jugo",
      "tetrabrik",
      "envase laminado",
    ],
    mainCategory: "aprovechable",
    containerColor: "blanco",
    primaryMaterial: "multicapa",
    secondaryMaterials: ["carton", "polietileno", "aluminio"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Vaciar por completo el líquido restante.",
      "Enjuagar con un poco de agua, agitar para remover residuos de leche o jugo y dejar escurrir muy bien.",
      "Desplegar las puntas, aplanar la caja y empujar el pitillo hacia adentro (o cerrar la tapa) para que no se pierda.",
    ],
    warnings: [
      "No entregues cajas de leche sin enjuagar: los restos lácteos se descomponen rápidamente y generan mal olor en la bolsa blanca.",
    ],
    whyExplanation:
      "Aunque es un material compuesto, en Colombia existen plantas que separan la celulosa del cartón (mediante hidropulpeo) y transforman el polialuminio en tejas, láminas y mobiliario.",
    circularAlternatives: [
      {
        type: "reutilizar",
        title: "Semilleros impermeables para huerta casera",
        description:
          "Por su recubrimiento interno impermeable, los envases multicapa lavados y recortados funcionan muy bien como semilleros temporales para germinar plantas.",
        safetyNote:
          "Lava bien con agua y jabón y realiza pequeños orificios de drenaje en la base.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-restos-frutas-verduras",
    slug: "restos-de-frutas-y-verduras",
    name: "Restos de frutas y verduras",
    description:
      "Cáscaras, tallos, semillas, hojas, borra de café, bolsas de aromática sin grapa metálica y recortes vegetales crudos.",
    synonyms: [
      "cascaras de fruta",
      "residuos de cocina",
      "organicos",
      "borra de cafe",
      "desechos vegetales",
    ],
    mainCategory: "organico_aprovechable",
    containerColor: "verde",
    primaryMaterial: "organico",
    secondaryMaterials: [],
    defaultCondition: "organico_fresco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Escurrir el exceso de líquidos antes de depositar.",
      "Retirar los pequeños sellos adhesivos plásticos (stickers PLU) de las cáscaras de fruta.",
      "Depositar en el recipiente o bolsa VERDE o en tu sistema de compostaje.",
    ],
    warnings: [
      "Nunca mezcles restos orgánicos húmedos en la bolsa blanca de reciclaje.",
      "Ten presente que el aprovechamiento efectivo depende de usar compostera casera, paca digestora comunitaria o contar con ruta selectiva de orgánicos en tu municipio.",
    ],
    whyExplanation:
      "La Resolución 2184 de 2019 destina el color verde a los residuos orgánicos aprovechables, que representan cerca de la mitad de los residuos generados en los hogares colombianos.",
    circularAlternatives: [
      {
        type: "compostar",
        title: "Compostaje casero, lombricultura o Pacas Digestoras Silva",
        description:
          "Transforma los restos vegetales crudos y la borra de café en abono orgánico estable para materas, jardines o huertas universitarias y barriales.",
        safetyNote:
          "Mezcla siempre los restos húmedos con material estructurante seco (hojas secas o aserrín limpio) para evitar malos olores y vectores.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-cascaras-huevo",
    slug: "cascaras-de-huevo",
    name: "Cáscaras de huevo",
    description:
      "Cáscaras de huevo generadas en la cocina doméstica o cafeterías.",
    synonyms: ["cascara de huevo", "cascaron de huevo"],
    mainCategory: "organico_aprovechable",
    containerColor: "verde",
    primaryMaterial: "organico",
    secondaryMaterials: ["carbonato_calcio"],
    defaultCondition: "organico_fresco",
    requiresSpecialManagement: false,
    preparationInstructions: [
      "Dejar secar al aire libre y triturar en fragmentos pequeños.",
      "Depositar en el recipiente VERDE de orgánicos aprovechables o incorporar al compost.",
    ],
    warnings: [
      "No van en la bolsa blanca (el cartón de la cubeta limpia sí va en bolsa blanca, pero la cáscara de huevo es orgánica).",
    ],
    whyExplanation:
      "Son ricas en carbonato de calcio y ayudan a regular la acidez en procesos de compostaje y mejoramiento de suelos.",
    circularAlternatives: [
      {
        type: "compostar",
        title: "Enmienda mineral para compost y plantas",
        description:
          "Secas y molidas hasta quedar casi en polvo, aportan calcio de liberación lenta para plantas como tomates y pimentones.",
        safetyNote: "Déjalas secar bien antes de guardarlas o molerlas para evitar olores.",
      },
    ],
    specialManagementDetails: null,
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-pilas",
    slug: "pilas-y-baterias",
    name: "Pilas domésticas y baterías",
    description:
      "Pilas AA, AAA, C, D, cuadradas de 9V, pilas tipo botón y baterías recargables agotadas de uso doméstico.",
    synonyms: [
      "pila aa",
      "pila aaa",
      "bateria",
      "pila de reloj",
      "pilas usadas",
      "acumulador",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "metal_quimico",
    secondaryMaterials: ["zinc", "manganeso", "litio", "acero"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Nunca intentes abrir, perforar, aplastar ni quemar las pilas.",
      "Cubre los polos (extremos positivo y negativo) con un trozo pequeño de cinta adhesiva transparente para evitar cortocircuitos o sulfatación.",
      "Guárdalas temporalmente en un frasco plástico seco (fuera del alcance de niños) hasta llevarlas a un contenedor oficial de Pilas con el Ambiente.",
    ],
    warnings: [
      "PROHIBIDO depositar en bolsa blanca, verde o negra.",
      "Si una pila presenta derrame de polvo blanco o líquido corrosivo, manipúlala con guantes y lávate muy bien las manos.",
    ],
    whyExplanation:
      "Las pilas son residuos posconsumo de manejo diferenciado (Resolución 1297 de 2010 / Res. 851 de 2022) porque contienen electrolitos y metales que no deben llegar a rellenos sanitarios ni fuentes de agua.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Sustituir pilas alcalinas por pilas recargables",
        description:
          "Usar pilas recargables certificadas reduce en más de un 90% la cantidad de pilas desechadas en controles y periféricos.",
        safetyNote:
          "Cuando una batería recargable llegue al final de su vida útil, también debe entregarse en un punto posconsumo.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación Pilas con el Ambiente",
      regulation: "Resolución 1297 de 2010 y Resolución 851 de 2022 (MinAmbiente)",
      whatIsIt: "Pilas primarias (no recargables) y secundarias (recargables) de uso doméstico.",
      whySpecial:
        "Riesgo de lixiviación de metales y compuestos químicos si se entierran o compactan con la basura ordinaria.",
      authorizedReceiver:
        "Contenedores posconsumo de Pilas con el Ambiente en centros comerciales, supermercados, universidades y alcaldías.",
      restrictions:
        "No depositar baterías húmedas de plomo-ácido de carros o motos en contenedores de pilas domésticas.",
    },
    sourceId: "src-pilas-ambiente",
    source: VERIFIED_SOURCES["src-pilas-ambiente"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-medicamentos-vencidos",
    slug: "medicamentos-vencidos",
    name: "Medicamentos vencidos o parcialmente consumidos",
    description:
      "Tabletas, cápsulas, jarabes, gotas, ungüentos, blísteres, frascos y empaques de medicamentos humanos o veterinarios vencidos o que ya no se utilizan.",
    synonyms: [
      "pastillas vencidas",
      "jarabe vencido",
      "blister de medicamentos",
      "remedios vencidos",
      "farmacos",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "farmaceutico",
    secondaryMaterials: ["plastico_aluminio_blister", "vidrio_frasco", "carton_empaque"],
    defaultCondition: "contaminado_quimico",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Mantén las tabletas o líquidos dentro de su blíster o frasco original bien tapado (no saques las pastillas sueltas).",
      "Rasga o raya las cajas de cartón y etiquetas para impedir su falsificación o reventa ilegal.",
      "Deposita todo en los contenedores oficiales del programa posconsumo Punto Azul.",
    ],
    warnings: [
      "NUNCA arrojes medicamentos por el inodoro ni el lavamanos: los antibióticos y compuestos químicos contaminan ríos y acuíferos.",
      "PROHIBIDO depositar agujas hipodérmicas, lancetas, cuchillas o gasas con sangre en los contenedores de Punto Azul.",
    ],
    whyExplanation:
      "Regulados por la Resolución 0371 de 2009, los medicamentos requieren recolección segura y destrucción térmica controlada para proteger el agua y la salud pública.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Gestión preventiva del botiquín en casa",
        description:
          "Evita la automedicación y compra únicamente las cantidades formuladas; revisa las fechas de vencimiento cada 6 meses.",
        safetyNote: "Nunca dones ni compartas medicamentos vencidos o de tratamientos incompletos.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación Punto Azul",
      regulation: "Resolución 0371 de 2009 (MinAmbiente)",
      whatIsIt:
        "Medicamentos humanos y veterinarios vencidos, deteriorados o parcialmente consumidos, junto con sus envases y empaques.",
      whySpecial:
        "Previene la contaminación farmacéutica del agua y combate la adulteración y contrabando de medicamentos.",
      authorizedReceiver:
        "Contenedores Punto Azul instalados en droguerías, farmacias, clínicas, supermercados y campus universitarios.",
      restrictions:
        "No recibe residuos cortopunzantes (agujas, bisturís) ni residuos con fluidos biológicos (sangre).",
    },
    sourceId: "src-punto-azul",
    source: VERIFIED_SOURCES["src-punto-azul"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-celular-danado",
    slug: "celular-danado",
    name: "Celular dañado o en desuso (RAEE)",
    description:
      "Teléfonos móviles, smartphones, tabletas o pequeños dispositivos de telecomunicaciones averiados u obsoletos.",
    synonyms: [
      "telefono roto",
      "smartphone viejo",
      "residuo electronico",
      "raee",
      "celular viejo",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "raee",
    secondaryMaterials: ["litio_bateria", "circuitos_impresos", "vidrio_pantalla", "aluminio"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Respalda tu información personal y restablece el dispositivo a valores de fábrica si aún enciende.",
      "Retira la tarjeta SIM y la tarjeta de memoria externa.",
      "No intentes desmontar ni perforar la batería interna de litio.",
      "Entrégalo en contenedores posconsumo de RAEE (EcoCómputo, operadores móviles o centros comerciales).",
    ],
    warnings: [
      "Las baterías de litio infladas o golpeadas pueden incendiarse si se arrojan al camión compactador de basura.",
      "No entregues residuos electrónicos a reciclaje informal que realice quema o desmantelamiento ácido sin protección.",
    ],
    whyExplanation:
      "Bajo la Ley 1672 de 2013 sobre RAEE en Colombia, los celulares deben entregarse a sistemas de recolección selectiva para recuperar metales estratégicos y gestionar de forma segura sus baterías.",
    circularAlternatives: [
      {
        type: "reparar",
        title: "Reparación técnica de batería o puerto de carga",
        description:
          "Sustituir una batería agotada o limpiar el puerto de carga en un taller calificado extiende por años la vida útil del teléfono.",
        safetyNote:
          "Si la batería está hinchada, no conectes el equipo a la corriente y llévalo a un centro técnico autorizado.",
      },
      {
        type: "donar",
        title: "Reacondicionamiento o donación si funciona",
        description:
          "Si el celular es funcional pero cambiaste de equipo, puede donarse tras borrar todas tus cuentas personales.",
        safetyNote: "Cierra sesión en tus cuentas antes de restablecer el dispositivo.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación EcoCómputo / Sistemas Posconsumo RAEE",
      regulation: "Ley 1672 de 2013 y Decreto 284 de 2018",
      whatIsIt: "Residuos de Aparatos Eléctricos y Electrónicos (RAEE) de consumo y telecomunicaciones.",
      whySpecial:
        "Contienen baterías de iones de litio y tarjetas electrónicas con metales valiosos y sustancias de cuidado ambiental.",
      authorizedReceiver:
        "Contenedores EcoCómputo, puntos posconsumo de operadores móviles y jornadas RAEE municipales.",
      restrictions: "Entregar apagado y sin datos personales.",
    },
    sourceId: "src-ecocomputo",
    source: VERIFIED_SOURCES["src-ecocomputo"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-cargador",
    slug: "cargador-y-cables",
    name: "Cargador, cables o periférico electrónico",
    description:
      "Adaptadores de corriente, cables USB, cargadores de portátil, ratones (mouse), teclados o audífonos dañados.",
    synonyms: [
      "cable usb",
      "cargador roto",
      "mouse danado",
      "teclado viejo",
      "audifonos rotos",
      "periferico",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "raee",
    secondaryMaterials: ["cobre", "plastico_abs_pvc", "componentes_electronicos"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Desconecta el cargador de la toma eléctrica y enrolla el cable para facilitar su manejo.",
      "Deposítalo en un punto de recolección de RAEE / EcoCómputo.",
    ],
    warnings: [
      "Nunca quemes cables para sacar el cobre: el humo del PVC libera dioxinas y furanos altamente tóxicos.",
      "No se deposita en la bolsa blanca de reciclaje de envases domésticos.",
    ],
    whyExplanation:
      "Los periféricos y cargadores son RAEE (Resolución 1512 de 2010 / Ley 1672 de 2013) que requieren plantas especializadas de trituración mecánica para separar el cobre de los plásticos con retardantes.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Usar cargadores universales USB-C y proteger los extremos",
        description:
          "Reutilizar el mismo bloque de carga compatible para varios dispositivos evita acumular cargadores innecesarios.",
        safetyNote:
          "Descarta inmediatamente en un punto RAEE cualquier cargador que presente chispas, olor a quemado o cables expuestos.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación EcoCómputo",
      regulation: "Resolución 1512 de 2010 / Ley 1672 de 2013",
      whatIsIt: "Periféricos, fuentes de poder, cables y accesorios informáticos o de telefonía.",
      whySpecial:
        "Contienen circuitos electrónicos, soldaduras y plásticos técnicos que no van al reciclaje convencional.",
      authorizedReceiver:
        "Contenedores EcoCómputo en centros comerciales, universidades y jornadas posconsumo.",
      restrictions: "Entregar limpios y secos.",
    },
    sourceId: "src-ecocomputo",
    source: VERIFIED_SOURCES["src-ecocomputo"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-bombilla",
    slug: "bombilla-o-tubo-fluorescente",
    name: "Bombilla ahorradora, LED o tubo fluorescente",
    description:
      "Bombillas compactas fluorescentes (CFL), tubos fluorescentes, bombillas LED o lámparas de descarga fundidas.",
    synonyms: [
      "bombillo fundido",
      "lampara fluorescente",
      "bombillo led",
      "tubo de luz",
      "luminaria",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "iluminacion_raee",
    secondaryMaterials: ["vidrio_especial", "componentes_electronicos", "mercurio_trazas"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Manipula la bombilla con cuidado sujetándola por la base plástica o metálica, no por el vidrio.",
      "Guárdala preferiblemente dentro de la caja de cartón del bombillo nuevo para evitar que se rompa en el camino.",
      "Deposítala con suavidad en un contenedor del programa posconsumo Lúmina.",
    ],
    warnings: [
      "NUNCA deposites bombillas en la bolsa blanca de vidrio ni en la bolsa negra.",
      "Si una bombilla ahorradora fluorescente se rompe accidentalmente: ventila el cuarto durante 15 minutos, recoge los vidrios con dos cartones rígidos (no uses escoba ni aspiradora) y guárdalos en un frasco cerrado.",
    ],
    whyExplanation:
      "Las bombillas están sujetas a gestión posconsumo (Resolución 1511 de 2010) porque contienen balastos electrónicos y, en las tecnologías fluorescentes, pequeñas cantidades de mercurio.",
    circularAlternatives: [
      {
        type: "reducir",
        title: "Elegir bombillas LED certificadas de alta eficiencia",
        description:
          "Las bombillas LED duran mucho más tiempo, ahorran energía eléctrica y están libres de mercurio (aunque al fundirse también deben entregarse en puntos Lúmina).",
        safetyNote: "Apaga siempre el interruptor antes de retirar o instalar una bombilla.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación Lúmina",
      regulation: "Resolución 1511 de 2010 y Resolución 851 de 2022",
      whatIsIt: "Residuos de iluminación doméstica e institucional (CFL, tubos fluorescentes, HID y LED).",
      whySpecial:
        "Requiere captura controlada de polvos fluorescentes/mercurio y separación de vidrio especial y electrónica.",
      authorizedReceiver:
        "Contenedores Lúmina en almacenes de cadena, ferreterías, centros comerciales y alcaldías.",
      restrictions: "Evitar romper el bulbo de vidrio al depositarlo.",
    },
    sourceId: "src-lumina",
    source: VERIFIED_SOURCES["src-lumina"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-ropa-usada",
    slug: "ropa-y-textiles-usados",
    name: "Ropa usada o textiles",
    description:
      "Prendas de vestir, calzado, ropa de cama o retazos textiles en buen estado o al final de su vida útil.",
    synonyms: [
      "camisa vieja",
      "pantalon usado",
      "tela",
      "zapatos usados",
      "textiles",
      "prendas de vestir",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "textil",
    secondaryMaterials: ["algodon", "poliester", "botones_cremalleras"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Lava y seca completamente las prendas antes de clasificarlas.",
      "Separa las prendas funcionales y dignas (para donación o segunda mano) de aquellas rotas o desgastadas (para reciclaje mecánico textil o trapos de limpieza).",
      "Entrégalas en bolsa cerrada e identificada en contenedores textiles o fundaciones locales.",
    ],
    warnings: [
      "No introduzcas ropa suelta en la bolsa blanca de envases (puede enredarse en las bandas clasificadoras de las estaciones de reciclaje).",
      "No dones textiles húmedos, con moho o impregnados de químicos.",
    ],
    whyExplanation:
      "Los textiles requieren rutas de moda circular, donación o gestores de desfibrado textil, diferenciadas de la ruta ordinaria de envases y empaques.",
    circularAlternatives: [
      {
        type: "reparar",
        title: "Costura, ajuste o transformación en paños de limpieza",
        description:
          "Coser un botón o zurcir una costura extiende la vida de la prenda; las camisetas de algodón muy gastadas son excelentes trapos de limpieza doméstica.",
        safetyNote: "Retira cierres o botones metálicos si vas a usar la tela para limpiar superficies delicadas.",
      },
      {
        type: "donar",
        title: "Donación a roperos solidarios o tiendas de segunda mano",
        description:
          "Las prendas limpias y en buen estado tienen alto valor social y evitan el consumo de agua de la industria textil nueva.",
        safetyNote: "Entrega siempre prendas lavadas, secas y completas.",
      },
    ],
    specialManagementDetails: {
      programName: "Programas de Economía Circular Textil y Bancos de Ropa",
      regulation: "Estrategia Nacional de Economía Circular (MinAmbiente)",
      whatIsIt: "Prendas de vestir, calzado y textiles del hogar posconsumo.",
      whySpecial:
        "Requiere clasificación entre reutilización directa (segunda mano) y desfibrado industrial para recuperar hilazas.",
      authorizedReceiver:
        "Contenedores de recolección textil en centros comerciales, fundaciones sociales y programas universitarios.",
      restrictions: "Deben entregarse completamente limpios, secos y libres de grasas industriales.",
    },
    sourceId: "src-minambiente-posconsumo",
    source: VERIFIED_SOURCES["src-minambiente-posconsumo"],
    geographicScope: "Medellín y Nacional",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-aceite-cocina-usado",
    slug: "aceite-de-cocina-usado",
    name: "Aceite de cocina usado (ACU)",
    description:
      "Aceite vegetal sobrante de frituras domésticas o de conservas en aceite.",
    synonyms: [
      "aceite quemado",
      "aceite de fritura",
      "aceite vegetal usado",
      "acu",
      "grasa liquida de cocina",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "aceite_vegetal",
    secondaryMaterials: [],
    defaultCondition: "liquido_especial",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Deja enfriar por completo el aceite en el sartén o recipiente antes de manipularlo.",
      "Filtra o cuela los residuos sólidos de comida con un colador o malla.",
      "Vierte el aceite frío usando un embudo dentro de una botella plástica PET limpia y seca, y cierra firmemente la tapa.",
      "Lleva la botella bien cerrada a un punto autorizado de recolección de Aceite de Cocina Usado (ACU).",
    ],
    warnings: [
      "JAMÁS viertas el aceite por el lavaplatos, sifón o sanitario: solidifica en las tuberías causando taponamientos y contamina miles de litros de agua.",
      "No pongas la botella llena de aceite dentro de la bolsa blanca de reciclaje de plástico.",
    ],
    whyExplanation:
      "Regulado por la Resolución 0316 de 2018 del Ministerio de Ambiente, el Aceite de Cocina Usado (ACU) debe entregarse en puntos limpios para su valorización como biodiésel o insumos industriales.",
    circularAlternatives: [
      {
        type: "aprovechar",
        title: "Valorización energética hacia biodiésel",
        description:
          "Cuando entregas tu botella de ACU en un contenedor autorizado, los gestores certificados lo filtran y transforman en biocombustible de bajas emisiones.",
        safetyNote:
          "Nunca envasar el aceite mientras esté caliente para evitar que la botella plástica se deforme y cause quemaduras.",
      },
    ],
    specialManagementDetails: {
      programName: "Gestores Autorizados de Aceite de Cocina Usado (ACU)",
      regulation: "Resolución 0316 de 2018 (MinAmbiente)",
      whatIsIt: "Aceite vegetal doméstico residual de procesos de cocción o fritura.",
      whySpecial:
        "Altísimo poder contaminante sobre el agua y obstrucción severa de redes de alcantarillado.",
      authorizedReceiver:
        "Contenedores de ACU en supermercados, unidades residenciales y programas ambientales municipales (ej. Emvarias / Área Metropolitana).",
      restrictions:
        "No mezclar con aceite mineral de motor, gasolina, pinturas ni agua.",
    },
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-envase-plaguicida-quimico",
    slug: "envase-de-plaguicidas-o-quimicos",
    name: "Envase de insecticida, plaguicida o químico peligroso",
    description:
      "Aerosoles de insecticidas domésticos, envases de raticidas, solventes, pinturas o agroquímicos.",
    synonyms: [
      "aerosol insecticida",
      "tarro de veneno",
      "envase de plaguicida",
      "envase de thinner",
      "cierra el ciclo",
    ],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "plastico_pead",
    secondaryMaterials: ["metal_aerosol", "residuo_quimico_peligroso"],
    defaultCondition: "contaminado_quimico",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "Usa completamente el contenido del producto según las instrucciones del fabricante, sin vaciar sobrantes en el sifón.",
      "Conserva el envase con su tapa y etiqueta original sin perforarlo (especialmente si es aerosol).",
      "Entrégalo en los contenedores del programa posconsumo Cierra el Ciclo (plaguicidas domésticos).",
    ],
    warnings: [
      "PROHIBIDO reutilizar estos envases para guardar agua, alimentos o productos de limpieza caseros.",
      "No perforar ni exponer al fuego los envases de aerosol.",
    ],
    whyExplanation:
      "Los envases de plaguicidas domésticos tienen regulación posconsumo obligatoria en Colombia (Resolución 1675 de 2013) por contener trazas tóxicas.",
    circularAlternatives: [
      {
        type: "programa_especial",
        title: "Entrega segura al programa Cierra el Ciclo",
        description:
          "El programa Cierra el Ciclo recolecta envases vacíos de insecticidas domésticos para su coprocesamiento o disposición ambientalmente segura.",
        safetyNote: "Mantener fuera del alcance de niños y mascotas hasta el momento de entrega.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación Cierra el Ciclo / CampoLimpio",
      regulation: "Resolución 1675 de 2013 (MinAmbiente)",
      whatIsIt: "Envases y empaques vacíos de plaguicidas o insecticidas de uso doméstico.",
      whySpecial: "Contienen trazas de ingredientes activos tóxicos que no deben entrar al reciclaje convencional.",
      authorizedReceiver: "Contenedores Cierra el Ciclo en almacenes de cadena y jornadas posconsumo.",
      restrictions: "No perforar aerosoles ni retirar las etiquetas de seguridad.",
    },
    sourceId: "src-minambiente-posconsumo",
    source: VERIFIED_SOURCES["src-minambiente-posconsumo"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "item-llantas-usadas",
    slug: "llantas-usadas",
    name: "Llantas usadas de bicicleta, moto o vehículo",
    description:
      "Neumáticos y llantas fuera de uso que requieren gestión posconsumo para aprovechamiento en asfalto modificado o pisos de caucho.",
    synonyms: ["neumatico viejo", "llanta de moto", "llanta de carro", "rueda verde"],
    mainCategory: "posconsumo_especial",
    containerColor: "punto_posconsumo",
    primaryMaterial: "compuesto_desconocido",
    secondaryMaterials: ["caucho_vulcanizado", "acero", "fibra_textil"],
    defaultCondition: "limpio_seco",
    requiresSpecialManagement: true,
    preparationInstructions: [
      "No abandones las llantas en el espacio público, quebradas ni las saques al camión recolector de basura doméstica.",
      "Guárdalas bajo techo para evitar que acumulen agua lluvia y se conviertan en criaderos del mosquito transmisor del dengue.",
      "Entrégalas en servitecas, talleres aliados o puntos del programa posconsumo Rueda Verde / Sistemas de Recolección de Llantas.",
    ],
    warnings: [
      "PROHIBIDO quemar llantas a cielo abierto: genera emisiones altamente tóxicas y cancerígenas.",
      "Las empresas de aseo ordinario no recogen llantas en las rutas domiciliarias habituales.",
    ],
    whyExplanation:
      "Las llantas usadas están reguladas por la Resolución 1326 de 2017 de MinAmbiente y se aprovechan mediante trituración mecánica para grano de caucho en canchas sintéticas y mezclas asfálticas.",
    circularAlternatives: [
      {
        type: "aprovechar",
        title: "Trituración para asfalto modificado y pisos amortiguantes",
        description:
          "Entregar las llantas en puntos autorizados permite recuperar el acero y transformar el caucho en superficies deportivas y pavimento.",
        safetyNote: "Evita que acumulen agua estancada mientras las almacenas.",
      },
    ],
    specialManagementDetails: {
      programName: "Corporación Rueda Verde / Sistemas Posconsumo de Llantas",
      regulation: "Resolución 1326 de 2017 (MinAmbiente)",
      whatIsIt: "Llantas y neumáticos fuera de uso.",
      whySpecial:
        "No son compactables en rellenos sanitarios, representan riesgo de incendio y proliferación de vectores si se abandonan.",
      authorizedReceiver:
        "Servitecas autorizadas, puntos Rueda Verde y jornadas de recolección de llantas municipales.",
      restrictions: "Entregar desmontadas del rin metálico cuando el gestor lo requiera.",
    },
    sourceId: "src-minambiente-posconsumo",
    source: VERIFIED_SOURCES["src-minambiente-posconsumo"],
    geographicScope: "Nacional (Colombia)",
    publicationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
];

export const VERIFIED_COLLECTION_POINTS: CollectionPoint[] = [
  {
    id: "cp-med-emvarias-info",
    name: "Canales Oficiales Emvarias Grupo EPM — Rutas de Aprovechamiento y Puntos Naranja",
    entityOperator: "Emvarias Grupo EPM / Alcaldía de Medellín",
    description:
      "Referencia institucional verificada para consultar los horarios de recolección por comuna/barrio, rutas de recicladores y puntos activos en Medellín.",
    address:
      "Consulta oficial por dirección/comuna en el portal de Emvarias Grupo EPM (Medellín, Antioquia)",
    municipality: "Medellín",
    department: "Antioquia",
    latitude: null,
    longitude: null,
    schedule:
      "Sujeto a la frecuencia asignada a cada comuna y barrio en Medellín (consultar portal oficial)",
    contactInfo: "Línea de Atención EPM / Emvarias: (604) 44 44 115",
    officialUrl: "https://www.emvarias.com.co/",
    deliveryRequirements: [
      "Entregar materiales aprovechables limpios, secos y compactados en bolsa blanca.",
      "Separar los residuos no aprovechables en bolsa negra.",
      "Para residuos voluminosos (colchones, escombros), solicitar recolección especial en la línea (604) 44 44 115.",
    ],
    materialsAccepted: [
      {
        wasteCategory: "aprovechable",
        materialName: "Plástico PET, PEAD y envases rígidos",
        acceptanceConditions: "Vacíos, enjuagados, secos y compactados",
      },
      {
        wasteCategory: "aprovechable",
        materialName: "Papel y Cartón limpio",
        acceptanceConditions: "Seco, plegado y libre de grasa o restos de comida",
      },
      {
        wasteCategory: "aprovechable",
        materialName: "Vidrio de envase y Metales (aluminio/hojalata)",
        acceptanceConditions: "Limpios, secos y sin roturas expuestas",
      },
    ],
    sourceId: "src-emvarias-medellin",
    source: VERIFIED_SOURCES["src-emvarias-medellin"],
    verificationStatus: "referencia_institucional",
    lastVerifiedAt: "2026-10-01",
  },
  {
    id: "cp-nac-punto-azul",
    name: "Red Posconsumo Punto Azul — Medicamentos Vencidos (Medellín y Nacional)",
    entityOperator: "Corporación Punto Azul",
    description:
      "Programa posconsumo oficial acreditado ante la ANLA para la entrega segura de medicamentos humanos y veterinarios vencidos o parcialmente consumidos.",
    address:
      "Buscador georreferenciado oficial de contenedores Punto Azul por municipio en puntoazul.com.co",
    municipality: "Medellín",
    department: "Antioquia",
    latitude: null,
    longitude: null,
    schedule:
      "Según el horario de atención de la droguería, clínica, universidad o supermercado anfitrión",
    contactInfo: "Portal oficial de ubicaciones de Corporación Punto Azul",
    officialUrl: "https://www.puntoazul.com.co/",
    deliveryRequirements: [
      "Rasgar o inutilizar las cajas de cartón y etiquetas antes de depositar.",
      "Depositar tabletas y jarabes dentro de su envase primario bien cerrado.",
      "Prohibido depositar jeringas, agujas, lancetas o residuos con sangre.",
    ],
    materialsAccepted: [
      {
        wasteCategory: "posconsumo_especial",
        materialName: "Medicamentos vencidos o parcialmente consumidos",
        acceptanceConditions: "En su envase primario cerrado; cajas inutilizadas",
      },
      {
        wasteCategory: "posconsumo_especial",
        materialName: "Blísteres y empaques de medicamentos",
        acceptanceConditions: "Sin agujas ni elementos cortopunzantes",
      },
    ],
    sourceId: "src-punto-azul",
    source: VERIFIED_SOURCES["src-punto-azul"],
    verificationStatus: "referencia_institucional",
    lastVerifiedAt: "2026-10-01",
  },
  {
    id: "cp-nac-pilas-ambiente",
    name: "Red Posconsumo Pilas con el Ambiente — Pilas Domésticas (Valle de Aburrá y Colombia)",
    entityOperator: "Corporación Pilas con el Ambiente",
    description:
      "Programa posconsumo oficial para la recolección y valorización segura de pilas domésticas (AA, AAA, botón, 9V, C, D y recargables).",
    address:
      "Consulta de contenedores autorizados por ciudad en el directorio oficial de Pilas con el Ambiente",
    municipality: "Medellín",
    department: "Antioquia",
    latitude: null,
    longitude: null,
    schedule: "Según horario del establecimiento o entidad aliada",
    contactInfo: "Portal oficial Pilas con el Ambiente",
    officialUrl: "https://www.pilascolombia.com/",
    deliveryRequirements: [
      "Entregar pilas domésticas secas y sin abrir ni perforar.",
      "Cubrir los polos con cinta adhesiva si presentan sulfatación o son pilas de litio/botón.",
    ],
    materialsAccepted: [
      {
        wasteCategory: "posconsumo_especial",
        materialName: "Pilas domésticas (AA, AAA, C, D, 9V, botón) y baterías de celular",
        acceptanceConditions: "Secas, íntegras y con polos protegidos si están sulfatadas",
      },
    ],
    sourceId: "src-pilas-ambiente",
    source: VERIFIED_SOURCES["src-pilas-ambiente"],
    verificationStatus: "referencia_institucional",
    lastVerifiedAt: "2026-10-01",
  },
  {
    id: "cp-nac-ecocomputo-lumina",
    name: "Programas Posconsumo EcoCómputo (RAEE) y Lúmina (Bombillas)",
    entityOperator: "Corporación EcoCómputo / Corporación Lúmina",
    description:
      "Canales posconsumo oficiales para computadores, periféricos, cargadores, celulares en desuso y bombillas ahorradoras, tubos fluorescentes o LED.",
    address:
      "Directorio oficial de puntos de recolección RAEE y contenedores Lúmina en Medellín, Valle de Aburrá y principales municipios",
    municipality: "Medellín",
    department: "Antioquia",
    latitude: null,
    longitude: null,
    schedule: "Según horario del centro comercial, alcaldía o jornada posconsumo",
    contactInfo: "Portales oficiales EcoCómputo (ecocomputo.com) y Lúmina (lumina.com.co)",
    officialUrl: "https://ecocomputo.com/",
    deliveryRequirements: [
      "Borrar datos personales de celulares, tabletas o computadores antes de entregarlos.",
      "Entregar bombillas íntegras (sin romper), preferiblemente protegidas en caja de cartón.",
    ],
    materialsAccepted: [
      {
        wasteCategory: "posconsumo_especial",
        materialName: "Celulares, cargadores, cables, teclados y periféricos (RAEE)",
        acceptanceConditions: "Apagados, secos y sin datos personales",
      },
      {
        wasteCategory: "posconsumo_especial",
        materialName: "Bombillas ahorradoras (CFL), tubos fluorescentes y LED",
        acceptanceConditions: "Sin romper el bulbo de vidrio",
      },
    ],
    sourceId: "src-ecocomputo",
    source: VERIFIED_SOURCES["src-ecocomputo"],
    verificationStatus: "referencia_institucional",
    lastVerifiedAt: "2026-10-01",
  },
];

export const VERIFIED_EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: "edu-biomimetica-hormigas",
    slug: "biomimetica-inspirada-en-hormigas",
    title: "Biomimética en EcoScan: Reglas locales sencillas para decisiones colectivas",
    category: "biomimetica",
    summary:
      "Cómo los principios de organización descentralizada de las colonias de hormigas inspiran el diseño del motor de reglas de EcoScan.",
    readingTimeMin: 4,
    keyTakeaways: [
      "Es una analogía funcional de diseño de sistemas, no una afirmación biológica de que las hormigas reciclen residuos industriales humanos.",
      "En una colonia, cada individuo aplica reglas locales simples basadas en señales del entorno (estado, material, cercanía).",
      "En EcoScan, evaluar primero el estado y material de cada residuo en casa evita contaminar toda la cadena logística aguas abajo.",
    ],
    sections: [
      {
        heading: "¿Por qué una analogía funcional inspirada en las hormigas?",
        body: "Las hormigas no reciclan plástico ni vidrio humano, pero sus colonias resuelven con extraordinaria eficiencia problemas de clasificación espacial, transporte de recursos y aislamiento de elementos riesgosos sin necesidad de un mando central único. Cada individuo responde a señales químicas y físicas locales: si un elemento es útil se transporta al lugar correspondiente; si representa un riesgo sanitario para la colonia, se aísla inmediatamente en zonas específicas.",
      },
      {
        heading: "Del hormiguero al motor de reglas de EcoScan",
        body: "En la gestión de residuos urbana ocurre algo similar: cuando miles de hogares aplican reglas locales claras en origen (1. Detectar si es peligroso/posconsumo y aislarlo; 2. Verificar si está limpio y seco; 3. Separar por flujo Blanco, Verde o Negro), el sistema completo de aprovechamiento funciona con mucha menor fricción y mayor recuperación real para las asociaciones de recicladores.",
      },
    ],
    biomimicryInsight:
      "Analogía de diseño: Reglas locales simples + lectura del estado del objeto = organización colectiva eficiente y reducción de contaminación cruzada.",
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "edu-resolucion-2184-colombia",
    slug: "como-separar-resolucion-2184-colombia",
    title: "Cómo separar correctamente según la Resolución 2184 de 2019 y más allá de los 3 colores",
    category: "separacion",
    summary:
      "Comprende el código unificado Blanco, Verde y Negro en Colombia y por qué los residuos posconsumo jamás van a esas tres canecas.",
    readingTimeMin: 5,
    keyTakeaways: [
      "Blanco: Aprovechables limpios y secos (plástico, vidrio, metales, papel, cartón, multicapa).",
      "Verde: Orgánicos aprovechables (restos de frutas, verduras, cáscaras de huevo, poda).",
      "Negro: No aprovechables (servilletas usadas, papeles engrasados, papel higiénico).",
      "Cuarta ruta indispensable: Programas Posconsumo (pilas, medicamentos, RAEE, bombillas, aceite usado).",
    ],
    sections: [
      {
        heading: "El código de tres colores no es todo el sistema",
        body: "La Resolución 2184 de 2019 unificó los colores para los residuos ordinarios en todo el territorio colombiano. Sin embargo, reducir toda la gestión ambiental a tres canecas es un error frecuente: existen residuos de manejo diferenciado (como pilas, bombillas, medicamentos vencidos, llantas o celulares dañados) que no deben ir ni al blanco, ni al verde, ni al negro, sino a contenedores posconsumo.",
      },
      {
        heading: "La regla de oro: Limpio y Seco",
        body: "El color blanco solo cumple su función si los materiales llegan limpios y secos. Una sola botella con restos de leche o una servilleta engrasada dentro de la bolsa blanca puede arruinar el papel y el cartón recolectados.",
      },
    ],
    biomimicryInsight:
      "Separar la humedad (flujo verde/negro) de los materiales secos (flujo blanco) evita la degradación prematura de las fibras recuperables.",
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "edu-reciclable-vs-reciclado",
    slug: "diferencia-reciclable-vs-efectivamente-reciclado",
    title: "Diferencia entre potencialmente reciclable y efectivamente reciclado",
    category: "mitos",
    summary:
      "Por qué el símbolo del triángulo en un empaque no garantiza por sí solo que el objeto vaya a reciclarse en tu municipio.",
    readingTimeMin: 4,
    keyTakeaways: [
      "Que un polímero sea técnicamente reciclable en laboratorio no significa que exista cadena de recolección y transformación local.",
      "Para que un residuo sea efectivamente reciclado necesita: diseño adecuado, entrega limpia y seca, recolección selectiva y planta transformadora.",
      "Después de entregar tu bolsa blanca a un reciclador de oficio, el material pasa por clasificación por resina/color, compactación, lavado y transformación industrial.",
    ],
    sections: [
      {
        heading: "¿Qué significan los números del 1 al 7 en los plásticos?",
        body: "El triángulo con números del 1 al 7 identifica el tipo de resina plástica (por ejemplo, 1 es PET y 2 es PEAD, que tienen alta reciclabilidad en Colombia; mientras que el 3 PVC, 6 Poliestireno/Icopor o 7 Otros/Mezclas tienen cadenas de aprovechamiento mucho más limitadas).",
      },
      {
        heading: "¿Qué sucede después de entregar un material?",
        body: "Cuando entregas tus materiales aprovechables a la ruta de recicladores de oficio, estos se llevan a Estaciones de Clasificación y Aprovechamiento (ECA), donde se separan por tipo de material, se prensan en pacas y se envían a plantas transformadoras nacionales para convertirse en nueva materia prima.",
      },
    ],
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "edu-materiales-compuestos-y-contaminados",
    slug: "materiales-compuestos-y-residuos-contaminados",
    title: "Cómo reconocer materiales compuestos y qué hacer con residuos contaminados",
    category: "materiales",
    summary:
      "Aprende a identificar envases multicapa, empaques metalizados y cómo actuar cuando un residuo tiene restos de comida o grasa.",
    readingTimeMin: 4,
    keyTakeaways: [
      "Un material compuesto combina dos o más materiales (como cartón + polietileno + aluminio en el Tetra Pak, o blísteres de medicamentos).",
      "Si el envase es rígido (vidrio, PET, lata, Tetra Pak) y tiene restos de bebida o salsa, basta un enjuague rápido y escurrido para salvarlo.",
      "Si el material es poroso (papel o cartón) y absorbió aceite o grasa, esa parte engrasada ya no es reciclable y va en bolsa negra.",
    ],
    sections: [
      {
        heading: "Cómo distinguir un compuesto aprovechable de uno no aprovechable",
        body: "Las cajas multicapa de leche o jugo (Tetra Pak) sí son aprovechables en bolsa blanca si se enjuagan, escurren y aplanan. En cambio, los blísteres de medicamentos combinan PVC y aluminio con trazas farmacéuticas, por lo que su ruta obligatoria es el contenedor posconsumo Punto Azul.",
      },
      {
        heading: "Evita el 'reciclaje aspiracional'",
        body: "Depositar objetos sucios o dudosos en la bolsa blanca 'esperando que allá sirvan' contamina el trabajo de los recicladores. Si no se puede limpiar o es papel engrasado, deposítalo en la bolsa negra.",
      },
    ],
    sourceId: "src-res-2184-2019",
    source: VERIFIED_SOURCES["src-res-2184-2019"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "edu-economia-circular-casa-universidad",
    slug: "reducir-reutilizar-reparar-casa-universidad",
    title: "Economía circular práctica: reducir, reparar y reutilizar en casa y en la universidad",
    category: "economia_circular",
    summary:
      "El mejor residuo es el que no se genera: estrategias seguras de prevención, reparación y reutilización antes de desechar.",
    readingTimeMin: 5,
    keyTakeaways: [
      "La jerarquía de gestión prioriza: 1. Prevenir/Reducir, 2. Reutilizar/Reparar, 3. Reciclar/Compostar, 4. Disponer adecuadamente.",
      "En la universidad: lleva termo reutilizable, usa recipientes lavables y toma apuntes digitales o en ambas caras del papel.",
      "Reutiliza con seguridad: los frascos de vidrio de alimentos son seguros para alacena, pero nunca reutilices envases de químicos o plaguicidas.",
    ],
    sections: [
      {
        heading: "Hábitos en el campus universitario y el hogar",
        body: "gran parte de los residuos diarios provienen de bebidas embotelladas, vasos desechables de café y empaques de comida para llevar. Portar un termo y un recipiente reutilizable elimina decenas de residuos plásticos y de cartón plastificado cada semestre.",
      },
      {
        heading: "Introducción al compostaje y aprovechamiento orgánico",
        body: "Los restos de frutas, verduras, cáscaras de huevo secas y borra de café pueden aprovecharse mediante compostaje doméstico o Pacas Digestoras comunitarias, siempre alternando capas húmedas con material vegetal seco (hojarasca o aserrín de madera sin tratar) para garantizar oxigenación e higiene.",
      },
    ],
    sourceId: "src-minambiente-posconsumo",
    source: VERIFIED_SOURCES["src-minambiente-posconsumo"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
  {
    id: "edu-guia-posconsumo-colombia",
    slug: "programas-posconsumo-en-colombia",
    title: "Guía de Gestión Posconsumo en Colombia: qué son y cómo entregar cada residuo especial",
    category: "posconsumo",
    summary:
      "Conoce los programas oficiales acreditados en Colombia para pilas, medicamentos, computadores, bombillas, aceite usado y plaguicidas.",
    readingTimeMin: 6,
    keyTakeaways: [
      "Los programas posconsumo son sistemas regulados por el Ministerio de Ambiente y vigilados por la ANLA donde productores e importadores garantizan la recolección segura.",
      "Pilas con el Ambiente (pilas), Punto Azul (medicamentos), EcoCómputo (RAEE), Lúmina (bombillas), Cierra el Ciclo (insecticidas) y Rueda Verde (llantas).",
      "Nunca desarmes baterías ni rompas bombillas antes de llevarlas al contenedor.",
    ],
    sections: [
      {
        heading: "¿Por qué existen los programas posconsumo?",
        body: "Ciertos productos cotidianos se convierten al final de su vida útil en residuos con características peligrosas o de manejo especial. Entregarlos en sus contenedores específicos permite recuperar materiales de forma industrialmente segura y neutralizar sustancias contaminantes.",
      },
    ],
    sourceId: "src-minambiente-posconsumo",
    source: VERIFIED_SOURCES["src-minambiente-posconsumo"],
    validationStatus: "verificado",
    reviewedAt: "2026-10-01",
  },
];

export const VERIFIED_CHALLENGES: SustainabilityChallenge[] = [
  {
    id: "chal-5-consultas",
    title: "Explorador Consciente: Identifica 5 residuos",
    description:
      "Consulta 5 residuos diferentes en el catálogo o escáner para verificar cómo prepararlos antes de separarlos.",
    category: "aprendizaje",
    targetCount: 5,
    ecoPointsReward: 30,
    status: "activo",
    criteriaDescription: "Realizar 5 consultas de fichas técnicas en EcoScan.",
  },
  {
    id: "chal-ruta-pila",
    title: "Guardián Posconsumo: Aprende a entregar una pila",
    description:
      "Consulta la ficha de Pilas y Baterías y conoce cómo proteger sus polos y a qué programa posconsumo entregarlas.",
    category: "posconsumo",
    targetCount: 1,
    ecoPointsReward: 25,
    status: "activo",
    criteriaDescription:
      "Revisar la ficha de Pilas y Baterías o registrar una preparación posconsumo.",
  },
  {
    id: "chal-evitar-desechable",
    title: "Prevención en Origen: Evita un producto desechable",
    description:
      "Declara una acción real en la que evitaste un envase de un solo uso utilizando termo, bolsa de tela o recipiente lavable.",
    category: "prevencion",
    targetCount: 1,
    ecoPointsReward: 40,
    status: "activo",
    criteriaDescription: "Registrar 1 acción de prevención o reutilización declarada.",
  },
  {
    id: "chal-reparar-objeto",
    title: "Ciclo Extendido: Repara o reutiliza un objeto",
    description:
      "Extiende la vida útil de un objeto (reparar un cable/aparato, coser una prenda o reutilizar un frasco de vidrio seguro).",
    category: "reutilizacion",
    targetCount: 2,
    ecoPointsReward: 50,
    status: "activo",
    criteriaDescription: "Registrar 2 acciones de reparación o reutilización segura.",
  },
  {
    id: "chal-ruta-local",
    title: "Conexión Local: Consulta rutas y programas en tu municipio",
    description:
      "Revisa los canales oficiales de recolección y programas posconsumo disponibles para tu ciudad o municipio.",
    category: "separacion",
    targetCount: 1,
    ecoPointsReward: 20,
    status: "activo",
    criteriaDescription: "Consultar el directorio de puntos de recolección y canales oficiales.",
  },
];
