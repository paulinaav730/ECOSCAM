import { BinColorType } from '../types';

export interface BinInfo {
  color: BinColorType;
  hex: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  title: string;
  subtitle: string;
  allowedItems: string[];
  forbiddenItems: string[];
  tips: string[];
  icon: string;
}

export const COLOMBIA_BINS: Record<BinColorType, BinInfo> = {
  Blanco: {
    color: 'Blanco',
    hex: '#FFFFFF',
    bgLight: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-900 dark:text-slate-100',
    borderColor: 'border-slate-300 dark:border-slate-600',
    title: 'Aprovechables (Blanco)',
    subtitle: 'Solo si están Limpios y Secos',
    icon: 'recycle',
    allowedItems: [
      'Plástico limpio y seco (botellas PET, envases de aseo y alimentos escurridos)',
      'Vidrio íntegro sin líquidos (botellas, frascos transparentes o de color)',
      'Metales limpios (latas de aluminio, hojalata y conservas enjuagadas)',
      'Papel y Cartón secos y sin manchas de grasa ni comida',
      'Envases multicapa (Tetra Pak) escurridos, enjuagados y aplanados'
    ],
    forbiddenItems: [
      'Cartón o papel impregnado de grasa o comida (ej. base de caja de pizza engrasada)',
      'Envases con restos de líquidos, químicos, pinturas o aceites',
      'Servilletas usadas, papel higiénico, recibos térmicos o papel carbón',
      'Espejos rotos, bombillos o cerámica'
    ],
    tips: [
      'Regla de oro del motor EcoScan: el material por sí solo no define si es reciclable; su estado de limpieza (limpio y seco) es obligatorio.',
      'Escurre, enjuaga ligeramente, deja secar y aplasta envases y cajas.',
      'Entrégalos a la ruta de aprovechamiento o al reciclador de oficio de tu zona.'
    ]
  },
  Verde: {
    color: 'Verde',
    hex: '#16A34A',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    borderColor: 'border-emerald-500',
    title: 'Orgánicos (Verde)',
    subtitle: 'Compostables y Biomasa Vegetal',
    icon: 'leaf',
    allowedItems: [
      'Cáscaras de frutas, verduras y hortalizas crudas',
      'Borra de café, bolsas de aromática sin grapa metálica y cáscaras de huevo trituradas',
      'Restos de poda, hojas secas, flores marchitas y césped',
      'Residuos de alimentos vegetales para compostaje o pacas digestoras'
    ],
    forbiddenItems: [
      'Bolsas plásticas convencionales o empaques metalizados',
      'Aceite de cocina usado líquido (debe ir a punto posconsumo ACU)',
      'Excrementos de mascotas, arena sanitaria o pañales',
      'Colillas de cigarrillo o madera tratada con barniz'
    ],
    tips: [
      'Los residuos orgánicos representan más del 50% de la bolsa doméstica en Colombia.',
      'Puedes aprovecharlos en compostaje casero, lombricultura o pacas digestoras.',
      'Al separarlos evitas que ensucien el papel, cartón y plástico aprovechable.'
    ]
  },
  Negro: {
    color: 'Negro',
    hex: '#1E293B',
    bgLight: 'bg-slate-900 text-white',
    textColor: 'text-slate-100',
    borderColor: 'border-slate-700',
    title: 'No Aprovechables (Negro)',
    subtitle: 'Contaminados con Grasa o Descarte Final',
    icon: 'trash-2',
    allowedItems: [
      'Papel y cartón contaminados con grasa o comida (servilletas usadas, cajas de pizza grasosas)',
      'Papel higiénico, pañales, toallas sanitarias, seda dental y copitos',
      'Envolturas metalizadas de mecato contaminadas o multicapa no separables',
      'Colillas de cigarrillo apagadas y residuos de barrido doméstico'
    ],
    forbiddenItems: [
      'Pilas, baterías o celulares (van a programas Posconsumo)',
      'Medicamentos vencidos o blísteres (van a Puntos Azules)',
      'Bombillos ahorradores o fluorescentes (van a contenedores Lúmina)',
      'Aceite de cocina usado líquido'
    ],
    tips: [
      'Cuando un material reciclable (como el cartón) se impregna de grasa, la fibra de celulosa no puede recuperarse y debe ir aquí para no dañar el lote.',
      'Si solo una parte está engrasada (ej. caja de pizza), corta la tapa limpia para aprovechamiento y lleva solo la base sucia a esta ruta.'
    ]
  },
  Posconsumo: {
    color: 'Posconsumo',
    hex: '#F59E0B',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    textColor: 'text-amber-800 dark:text-amber-200',
    borderColor: 'border-amber-500',
    title: 'Gestión Posconsumo',
    subtitle: 'Puntos Oficiales de Recolección (No Caneca)',
    icon: 'alert-triangle',
    allowedItems: [
      'Pilas AA, AAA, botón y baterías recargables (Programa Pilas con el Ambiente)',
      'Medicamentos vencidos, deteriorados y sus envases/blísteres (Corporación Punto Azul)',
      'Bombillos ahorradores (CFL), tubos fluorescentes y luminarias (Programa Lúmina)',
      'Aceite de cocina usado frío y colado en botella plástica cerrada (Puntos ACU)',
      'Residuos de Aparatos Eléctricos y Electrónicos - RAEE (Red Verde / EcoCómputo / Cierra el Ciclo)'
    ],
    forbiddenItems: [
      'NUNCA deben mezclarse en las bolsas blanca, verde ni negra del hogar',
      'NUNCA verter aceite ni medicamentos por el sifón o sanitario',
      'No romper bombillos fluorescentes ni perforar baterías de litio'
    ],
    tips: [
      'En Colombia, los residuos posconsumo tienen canales gratuitos en centros comerciales, droguerías y supermercados.',
      'Aislar estos elementos evita que metales pesados (mercurio, plomo, cadmio) y fármacos contaminen fuentes hídricas.'
    ]
  },
  Rojo: {
    color: 'Rojo',
    hex: '#DC2626',
    bgLight: 'bg-red-50 dark:bg-red-950/40',
    textColor: 'text-red-800 dark:text-red-200',
    borderColor: 'border-red-500',
    title: 'Peligrosos / Riesgo',
    subtitle: 'Manejo Especializado y Biosanitario',
    icon: 'alert-triangle',
    allowedItems: [
      'Elementos cortopunzantes o biosanitarios en guardián de seguridad',
      'Envases con restos de solventes, pesticidas, ácidos o químicos corrosivos',
      'Materiales impregnados con hidrocarburos o aceites minerales automotrices'
    ],
    forbiddenItems: [
      'Basura común de cocina o reciclables limpios',
      'Mezclar agujas sueltas sin contenedor rígido rotulado'
    ],
    tips: [
      'Requieren entrega en gestores autorizados o puntos especiales para proteger la salud de los operarios de recolección.'
    ]
  }
};

export const COLOMBIA_ECO_TIPS = [
  "El motor inteligente de EcoScan evalúa tanto el material como su estado de limpieza: un cartón limpio se aprovecha, pero si tiene grasa debe aislarse para no arruinar el lote de reciclaje.",
  "En Colombia se generan más de 12 millones de toneladas de residuos al año. Separar correctamente en fuente y preparar los envases limpios y secos multiplica la recuperación real.",
  "Nunca deposites pilas, medicamentos vencidos, bombillos ahorradores ni aceite de cocina usado en las canecas domésticas: llévalos a los programas Posconsumo oficiales (Punto Azul, Pilas con el Ambiente, Lúmina).",
  "Un solo litro de aceite de cocina usado vertido por el sifón puede contaminar hasta 1.000 litros de agua. Enfríalo, cuélalo y entrégalo en una botella plástica bien cerrada en un punto ACU.",
  "Antes de desechar una caja de pizza, separa la tapa superior si está limpia y seca (aprovechable) y descarta únicamente la base engrasada (no aprovechable).",
  "Los recicladores de oficio lideran la economía circular en Colombia. Entregar los envases vacíos, enjuagados, secos y compactados dignifica y agiliza su trabajo."
];
