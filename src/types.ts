export type PerfilUsuario = 'aluno' | 'agricultor' | 'professor';

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  regiao: string;
  criadoEm: string;
  pontos: number;
  badges: string[];
  turmaId?: string | null;
  notificacoesHabilitadas?: boolean;
  progresso: {
    cultivo: number; // 0 to 100
    derivados: number; // 0 to 100
    sustentabilidade: number; // 0 to 100
    quizzesFeitos: string[];
    aulasConcluidas: string[]; // list of lesson IDs
  };
}

export interface AlertaNotificacao {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: 'clima' | 'praga';
  lida: boolean;
  criadoEm: string;
}

export interface Aula {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'video' | 'texto' | 'infografico';
  conteudo: string; // URL YouTube or Markdown text
  imagemURL?: string | null;
  duracao: number; // minutes
  ordem: number;
  quizId?: string | null;
}

export interface Modulo {
  id: string; // 'cultivo' | 'derivados' | 'sustentabilidade'
  titulo: string;
  descricao: string;
  ordem: number;
  cor: string;
  icone: string; // emoji
  aulas: Aula[];
}

export interface Alternativa {
  id: string;
  texto: string;
}

export interface Pergunta {
  id: string;
  enunciado: string;
  alternativas: Alternativa[];
  respostaCorreta: string; // ID of correct alternative
  explicacao: string;
}

export interface Quiz {
  id: string;
  titulo: string;
  moduloId: string;
  perguntas: Pergunta[];
}

export interface RespostaQuiz {
  id?: string;
  usuarioId: string;
  quizId: string;
  acertos: number;
  total: number;
  percentual: number;
  concluidoEm: string;
}

export interface Turma {
  id: string;
  nome: string;
  professorId: string;
  escola: string;
  criadaEm: string;
  alunosIds: string[];
}

export interface RespostaForum {
  id: string;
  autorId: string;
  autorNome: string;
  autorPerfil: PerfilUsuario;
  conteudo: string;
  curtidas: number;
  curtidoPor: string[]; // UIDs
  criadoEm: string;
}

export interface PostForum {
  id: string;
  autorId: string;
  autorNome: string;
  autorPerfil: PerfilUsuario;
  titulo: string;
  conteudo: string;
  categoria: 'cultivo' | 'derivados' | 'pragas' | 'geral';
  curtidas: number;
  curtidoPor: string[]; // UIDs
  criadoEm: string;
  respostas: RespostaForum[];
}

export interface Diagnostico {
  id: string;
  usuarioId: string;
  fotoURL: string; // base64 or storage url
  praga: string;
  saudavel: boolean;
  gravidade: 'nenhuma' | 'leve' | 'moderada' | 'grave';
  descricao: string;
  recomendacoes: string[];
  prevencao: string[];
  criadoEm: string;
}

export interface CalendarioAgricola {
  mes: string; // 'Janeiro', 'Fevereiro', etc.
  etapaCultivo: string;
  atividades: string[];
  alertas: string[];
  dicas: string[];
}
