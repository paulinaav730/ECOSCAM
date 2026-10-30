import { PresetSample } from '../types';

export const SAMPLE_PRESETS_LIST: PresetSample[] = [
  {
    id: 'pet_bottle',
    title: 'Botella PET de Agua',
    subtitle: 'Plástico PET • Limpio y seco',
    category: 'Plástico',
    binColor: 'Blanco',
    binHexColor: '#FFFFFF',
    defaultCondition: 'limpio_seco',
    primaryMaterial: 'plastico_pet',
    queryName: 'Botella plástica PET de bebidas',
    imageThumbnail: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'banana_peel',
    title: 'Cáscara de Banano',
    subtitle: 'Orgánico • Compostable',
    category: 'Orgánico',
    binColor: 'Verde',
    binHexColor: '#16A34A',
    defaultCondition: 'organico_fresco',
    primaryMaterial: 'organico',
    queryName: 'Restos de frutas y verduras crudas',
    imageThumbnail: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'cardboard_box',
    title: 'Caja de Cartón Limpia',
    subtitle: 'Cartón • Limpio y seco',
    category: 'Papel y Cartón',
    binColor: 'Blanco',
    binHexColor: '#FFFFFF',
    defaultCondition: 'limpio_seco',
    primaryMaterial: 'carton',
    queryName: 'Caja de cartón corrugado limpia',
    imageThumbnail: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'pizza_box_greasy',
    title: 'Caja de Pizza con Grasa',
    subtitle: 'Cartón • Parcialmente contaminado',
    category: 'Separación por Partes',
    binColor: 'Negro',
    binHexColor: '#1E293B',
    defaultCondition: 'parcialmente_contaminado',
    primaryMaterial: 'carton',
    queryName: 'Caja de pizza con grasa',
    imageThumbnail: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'aluminum_can',
    title: 'Lata de Aluminio',
    subtitle: 'Aluminio • Limpio y seco',
    category: 'Metal',
    binColor: 'Blanco',
    binHexColor: '#FFFFFF',
    defaultCondition: 'limpio_seco',
    primaryMaterial: 'aluminio',
    queryName: 'Lata de aluminio de bebidas',
    imageThumbnail: 'https://images.unsplash.com/photo-1584208124888-3a20b9c799e2?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'alkaline_battery',
    title: 'Pilas Usadas AA/AAA',
    subtitle: 'Posconsumo • Pilas con el Ambiente',
    category: 'Posconsumo Especial',
    binColor: 'Posconsumo',
    binHexColor: '#F59E0B',
    defaultCondition: 'contaminado_quimico',
    primaryMaterial: 'metal_quimico',
    queryName: 'Pilas domésticas usadas (AA, AAA, botón)',
    imageThumbnail: 'https://images.unsplash.com/photo-1619641805634-b867f535071c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'expired_medicine',
    title: 'Medicamentos Vencidos',
    subtitle: 'Posconsumo • Punto Azul',
    category: 'Posconsumo Especial',
    binColor: 'Posconsumo',
    binHexColor: '#F59E0B',
    defaultCondition: 'contaminado_quimico',
    primaryMaterial: 'farmaceutico',
    queryName: 'Medicamentos vencidos y blísteres farmacológicos',
    imageThumbnail: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'dirty_napkin',
    title: 'Servilleta Usada',
    subtitle: 'Papel • Contaminado con grasa',
    category: 'No Aprovechable',
    binColor: 'Negro',
    binHexColor: '#1E293B',
    defaultCondition: 'contaminado_grasa',
    primaryMaterial: 'papel',
    queryName: 'Servilletas usadas y papel higiénico',
    imageThumbnail: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80'
  }
];
