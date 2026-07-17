export interface CategoryTreeNode {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  children?: CategoryTreeNode[];
}

/**
 * Launch tenant category tree — UK supermarket products, 3 levels deep,
 * ~50 categories. Nothing here is vertical-specific at the schema level;
 * this is just seed data for the `supermarket` tenant.
 */
export const supermarketCategoryTree: CategoryTreeNode[] = [
  {
    name: 'Fresh Food',
    slug: 'fresh-food',
    icon: '🥬',
    children: [
      {
        name: 'Fruit & Vegetables',
        slug: 'fruit-veg',
        children: [
          { name: 'Fresh Fruit', slug: 'fresh-fruit' },
          { name: 'Fresh Vegetables', slug: 'fresh-vegetables' },
          { name: 'Salad', slug: 'salad' },
        ],
      },
      {
        name: 'Meat & Poultry',
        slug: 'meat-poultry',
        children: [
          { name: 'Beef', slug: 'beef' },
          { name: 'Chicken & Turkey', slug: 'chicken-turkey' },
          { name: 'Pork & Lamb', slug: 'pork-lamb' },
        ],
      },
      { name: 'Fish & Seafood', slug: 'fish-seafood' },
      {
        name: 'Dairy, Eggs & Fridge',
        slug: 'dairy-eggs-fridge',
        children: [
          { name: 'Milk', slug: 'milk' },
          { name: 'Cheese', slug: 'cheese' },
          { name: 'Yoghurt', slug: 'yoghurt' },
          { name: 'Eggs', slug: 'eggs' },
        ],
      },
      {
        name: 'Bakery',
        slug: 'bakery',
        children: [
          { name: 'Bread', slug: 'bread' },
          { name: 'Cakes & Desserts', slug: 'cakes-desserts' },
        ],
      },
    ],
  },
  {
    name: 'Food Cupboard',
    slug: 'food-cupboard',
    icon: '🥫',
    children: [
      { name: 'Pasta, Rice & Noodles', slug: 'pasta-rice-noodles' },
      { name: 'Tins, Cans & Packets', slug: 'tins-cans-packets' },
      { name: 'Cereals', slug: 'cereals' },
      { name: 'Snacks & Crisps', slug: 'snacks-crisps' },
      { name: 'Chocolate & Sweets', slug: 'chocolate-sweets' },
      { name: 'Cooking Sauces & Condiments', slug: 'sauces-condiments' },
      { name: 'Herbs, Spices & Oils', slug: 'herbs-spices-oils' },
    ],
  },
  {
    name: 'Frozen',
    slug: 'frozen',
    icon: '🧊',
    children: [
      { name: 'Frozen Vegetables', slug: 'frozen-vegetables' },
      { name: 'Frozen Meat & Fish', slug: 'frozen-meat-fish' },
      { name: 'Ice Cream & Desserts', slug: 'ice-cream-desserts' },
      { name: 'Ready Meals', slug: 'frozen-ready-meals' },
    ],
  },
  {
    name: 'Drinks',
    slug: 'drinks',
    icon: '🥤',
    children: [
      { name: 'Soft Drinks', slug: 'soft-drinks' },
      { name: 'Tea & Coffee', slug: 'tea-coffee' },
      { name: 'Juices & Smoothies', slug: 'juices-smoothies' },
      { name: 'Beer, Wine & Spirits', slug: 'beer-wine-spirits' },
    ],
  },
  {
    name: 'World Foods',
    slug: 'world-foods',
    icon: '🌍',
    children: [
      { name: 'Turkish & Middle Eastern', slug: 'turkish-middle-eastern' },
      { name: 'Greek & Mediterranean', slug: 'greek-mediterranean' },
      { name: 'Asian', slug: 'asian' },
      { name: 'Indian', slug: 'indian' },
    ],
  },
  {
    name: 'Household',
    slug: 'household',
    icon: '🧽',
    children: [
      { name: 'Cleaning', slug: 'cleaning' },
      { name: 'Laundry', slug: 'laundry' },
      { name: 'Paper & Plastic', slug: 'paper-plastic' },
    ],
  },
  {
    name: 'Health & Beauty',
    slug: 'health-beauty',
    icon: '🧴',
    children: [
      { name: 'Toiletries', slug: 'toiletries' },
      { name: 'Vitamins & Supplements', slug: 'vitamins-supplements' },
    ],
  },
  { name: 'Baby & Kids', slug: 'baby-kids', icon: '🍼' },
  { name: 'Pet Supplies', slug: 'pet-supplies', icon: '🐾' },
];

export function countCategories(nodes: CategoryTreeNode[]): number {
  return nodes.reduce(
    (sum, node) => sum + 1 + (node.children ? countCategories(node.children) : 0),
    0,
  );
}
