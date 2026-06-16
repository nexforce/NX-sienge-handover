import { PrismaClient } from '@prisma/client'
import { syncVersions } from '../scripts/sync-versions'

const prisma = new PrismaClient()

const documents = [
  { id: '1.0', nome: 'Pré Vendas', revisor: 'Elias Moreira' },
  { id: '2.0', nome: 'Vendas e Contratação', revisor: 'Vinicius Vieira Braz' },
  { id: '2.1', nome: 'Vendas — Contrato/Portfólio', revisor: 'Vinicius Vanoni' },
  { id: '2.2', nome: 'Vendas [Dev]', revisor: 'Jorge Souza' },
  { id: '3.0', nome: 'Aprovações', revisor: 'João Passaro' },
  { id: '4.0', nome: 'Precificação', revisor: 'Vinicius Vanoni' },
  { id: '4.1', nome: 'Precificação [Dev]', revisor: 'Jorge Souza' },
  { id: '5.0', nome: 'Minutas', revisor: 'Moisés Araújo' },
  { id: '5.1', nome: 'Minutas [Dev]', revisor: 'Jorge Souza' },
  { id: '6.0', nome: 'CS e Atendimento', revisor: 'Moisés Araújo' },
  { id: '7.0', nome: 'KPIs e Indicadores', revisor: 'Moisés Araújo' },
  { id: '8.0', nome: 'Governança e Permissões', revisor: 'Pedro Soave Neto' },
  { id: '8.1', nome: 'Integrações Oracle', revisor: 'Vinicius Vanoni' },
  { id: '8.2', nome: 'Integrações RD Station', revisor: 'Elias Moreira' },
  { id: '8.3', nome: 'Integrações Freshdesk', revisor: 'Moisés Araújo' },
]

async function main() {
  console.log('Seeding documents...')
  for (const doc of documents) {
    await prisma.document.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        nome: doc.nome,
        revisor: doc.revisor,
      },
    })
  }

  console.log('Syncing versions from disk (docs/processos/*/documentacao-gerada)...')
  await syncVersions()

  console.log('Seeding completed!')
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
