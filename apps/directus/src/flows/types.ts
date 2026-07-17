export interface OperationDefinition {
  /** Local key, referenced by name in Mustache templates ({{key.field}}) and by other operations' resolve/reject. */
  key: string;
  name: string;
  type: string;
  options: Record<string, unknown>;
  /** Key of the operation to run on success. Omit to end the chain. */
  resolve?: string;
  /** Key of the operation to run on failure. Omit to end the chain (flow just fails). */
  reject?: string;
}

export type FlowTrigger =
  { type: 'event'; scope: string[]; collections: string[] } | { type: 'schedule'; cron: string };

export interface FlowDefinition {
  name: string;
  icon: string;
  description: string;
  trigger: FlowTrigger;
  /** First operation is the flow's entry point. */
  operations: OperationDefinition[];
}
