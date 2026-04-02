export type ModelConfig = Readonly<{
  model: string
  temperature: number
}>

export type Variant = Readonly<{
  name: string
  analysis: ModelConfig
  generation: ModelConfig
}>

export const variants: readonly Variant[] = [
  {
    name: 'foxtrot',
    analysis: { model: 'anthropic/claude-sonnet-4.6', temperature: 0.3 },
    generation: { model: 'anthropic/claude-sonnet-4.6', temperature: 0.1 },
  },
]
