export interface AttributeDefinitionSeed {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'url' | 'date';
  options?: Array<{ label: string; value: string }>;
  unit?: string;
  required: boolean;
  filterable: boolean;
  /** Category slug this applies to; omit for tenant-wide. */
  categorySlug?: string;
}

export const attributeDefinitionSeeds: AttributeDefinitionSeed[] = [
  {
    key: 'pack_size',
    label: 'Pack size',
    type: 'text',
    unit: 'g',
    required: false,
    filterable: false,
  },
  {
    key: 'organic',
    label: 'Organic',
    type: 'boolean',
    required: false,
    filterable: true,
  },
  {
    key: 'dietary',
    label: 'Dietary',
    type: 'multiselect',
    options: [
      { label: 'Vegan', value: 'vegan' },
      { label: 'Vegetarian', value: 'vegetarian' },
      { label: 'Gluten-free', value: 'gluten_free' },
      { label: 'Halal', value: 'halal' },
      { label: 'Kosher', value: 'kosher' },
      { label: 'Dairy-free', value: 'dairy_free' },
    ],
    required: false,
    filterable: true,
  },
  {
    key: 'country_of_origin',
    label: 'Country of origin',
    type: 'text',
    required: false,
    filterable: true,
  },
  {
    key: 'roast_level',
    label: 'Roast level',
    type: 'select',
    options: [
      { label: 'Light', value: 'light' },
      { label: 'Medium', value: 'medium' },
      { label: 'Dark', value: 'dark' },
    ],
    required: false,
    filterable: true,
    categorySlug: 'tea-coffee',
  },
  {
    key: 'spice_level',
    label: 'Spice level',
    type: 'select',
    options: [
      { label: 'Mild', value: 'mild' },
      { label: 'Medium', value: 'medium' },
      { label: 'Hot', value: 'hot' },
    ],
    required: false,
    filterable: true,
    categorySlug: 'world-foods',
  },
];
