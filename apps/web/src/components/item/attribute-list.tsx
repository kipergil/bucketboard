import type { AttributeDefinition, ItemAttribute } from '@bucketboard/shared';

function formatValue(value: ItemAttribute['value'], definition: AttributeDefinition): string {
  if (value === null) return '—';
  if (Array.isArray(value)) {
    const labels = value.map((v) => definition.options?.find((o) => o.value === v)?.label ?? v);
    return labels.join(', ');
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (definition.type === 'select') {
    return definition.options?.find((o) => o.value === value)?.label ?? String(value);
  }
  return definition.unit ? `${value}${definition.unit}` : String(value);
}

export function AttributeList({
  attributes,
  definitions,
}: {
  attributes: ItemAttribute[];
  definitions: AttributeDefinition[];
}) {
  const definitionById = new Map(definitions.map((d) => [d.id, d]));
  const rows = attributes
    .map((attribute) => {
      const definitionId =
        typeof attribute.definition === 'string' ? attribute.definition : attribute.definition.id;
      const definition = definitionById.get(definitionId);
      if (!definition) return null;
      return { label: definition.label, value: formatValue(attribute.value, definition) };
    })
    .filter((row): row is { label: string; value: string } => row !== null);

  if (rows.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="text-muted-foreground">{row.label}</dt>
          <dd className="font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
