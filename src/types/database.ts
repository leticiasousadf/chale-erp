export type CentroCusto = {
  id: string; nome: string; descricao?: string; cor: string; created_at: string
}
export type Categoria = {
  id: string; nome: string; cor: string; icone: string; created_at: string
}
export type Subcategoria = {
  id: string; categoria_id: string; nome: string
}
export type Fornecedor = {
  id: string; nome: string; telefone?: string; cidade?: string
  tipo_servico?: string; avaliacao?: number; observacoes?: string; created_at: string
}
export type Gasto = {
  id: string; titulo: string; descricao?: string; valor: number; data: string
  categoria_id?: string; subcategoria_id?: string; centro_custo_id?: string
  fornecedor_id?: string; tipo: 'produto' | 'servico'; status: 'pago' | 'pendente' | 'parcelado'
  forma_pagamento?: string; responsavel?: string; observacoes?: string; created_at: string
  categorias?: Categoria; centro_custos?: CentroCusto; fornecedores?: Fornecedor
}
export type Orcamento = {
  id: string; titulo: string; valor_previsto: number; categoria_id?: string
  centro_custo_id?: string; gasto_id?: string; prioridade: 'baixa' | 'media' | 'alta'
  status: 'planejado' | 'em_negociacao' | 'aprovado' | 'executado'
  observacoes?: string; created_at: string
}
export type EtapaObra = {
  id: string; nome: string; status: 'planejado' | 'em_andamento' | 'concluido'
  percentual: number; previsao_inicio?: string; previsao_fim?: string
  centro_custo_id?: string; created_at: string
}
