import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  increment,
  setDoc,
  getDocs,
  limit
} from 'firebase/firestore';
import { MessageSquare, Heart, Send, User, Trash2, Filter, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { PostForum, RespostaForum } from '../types';

const INITIAL_POSTS: Omit<PostForum, 'id'>[] = [
  {
    autorId: 'seeder_1',
    autorNome: 'Seu Raimundo de Piripiri',
    autorPerfil: 'agricultor',
    titulo: 'Como combater a Antracnose na floração do cajueiro?',
    conteudo: 'Amigos, meus cajueiros anões estão começando a soltar as primeiras flores, mas notei umas manchinhas pretas nos cabinhos das flores. Temo que seja Antracnose por causa das chuvas finas que deram semana passada. O que posso aplicar de forma orgânica que não espante as abelhas?',
    categoria: 'pragas',
    curtidas: 12,
    curtidoPor: [],
    criadoEm: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
    respostas: [
      {
        id: 'reply_1',
        autorId: 'demo_professor_mestre',
        autorNome: 'Prof. Adalberto Rocha',
        autorPerfil: 'professor',
        conteudo: 'Olá Raimundo! Isso é sim sintoma inicial de Antracnose. Como está no início da floração, você pode pulverizar a Calda Bordalesa diluída a 0,5% ou usar urina de vaca curtida (1%). Tente aplicar bem cedo ou no final da tarde para as abelhas polinizadoras não serem afetadas. Remova também qualquer ramo velho seco do chão!',
        curtidas: 8,
        curtidoPor: [],
        criadoEm: new Date(Date.now() - 3600000 * 24 * 1.8).toISOString()
      },
      {
        id: 'reply_2',
        autorId: 'seeder_2',
        autorNome: 'Dona Maria de Fátima',
        autorPerfil: 'agricultor',
        conteudo: 'Eu usei a calda bordalesa no ano passado e salvou minha colheita de caju amarelo! Pode confiar nas dicas do Professor Adalberto.',
        curtidas: 4,
        curtidoPor: [],
        criadoEm: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString()
      }
    ]
  },
  {
    autorId: 'seeder_3',
    autorNome: 'Juliana Mendes',
    autorPerfil: 'aluno',
    titulo: 'Dúvida na clarificação da Cajuína caseira',
    conteudo: 'Pessoal, estou fazendo minha primeira cajuína para o projeto de química da escola aqui em Picos. Usei a gelatina incolor para clarificar, mas o líquido ainda ficou um pouco turvo depois de filtrar no algodão. Será que pus pouca gelatina ou filtrei rápido demais?',
    categoria: 'derivados',
    curtidas: 6,
    curtidoPor: [],
    criadoEm: new Date(Date.now() - 3600000 * 18).toISOString(), // 18 hours ago
    respostas: [
      {
        id: 'reply_3',
        autorId: 'demo_agricultor_familiar',
        autorNome: 'Dona Maria de Fátima',
        autorPerfil: 'agricultor',
        conteudo: 'Oi Juliana! O segredo é misturar a gelatina incolor muito bem e deixar em repouso absoluto por pelo menos 20 minutos antes de mexer. A "borra" precisa decantar todinha. Se filtrou rápido demais, o algodão pode ter ficado solto no funil. Aperte bem o algodão no gargalo do funil, o suco tem que gotejar devagarzinho!',
        curtidas: 5,
        curtidoPor: [],
        criadoEm: new Date(Date.now() - 3600000 * 16).toISOString()
      }
    ]
  }
];

export default function Forum() {
  const { user, addPoints } = useAuth();
  const [posts, setPosts] = useState<PostForum[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  
  // New Post Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'cultivo' | 'derivados' | 'pragas' | 'geral'>('geral');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active Post for Replies
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadLocalForum = () => {
    console.log("[Fórum] Carregando posts locais (localStorage)...");
    const cached = localStorage.getItem('cajutech_local_forum_posts');
    if (cached) {
      try {
        setPosts(JSON.parse(cached));
      } catch (e) {
        console.error("Erro ao fazer parse dos posts locais:", e);
        initializeLocalForum();
      }
    } else {
      initializeLocalForum();
    }
    setLoading(false);
  };

  const initializeLocalForum = () => {
    const formattedInitial: PostForum[] = INITIAL_POSTS.map((p, idx) => ({
      id: `local_post_${idx}_${Date.now()}`,
      ...p
    }));
    localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(formattedInitial));
    setPosts(formattedInitial);
  };

  useEffect(() => {
    const useLocal = !user || user.uid.startsWith('demo_');

    if (useLocal) {
      loadLocalForum();
      return;
    }

    // Realtime connection to Forum Collection
    const q = query(collection(db, 'forum'), orderBy('criadoEm', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setLoading(true);
        try {
          // If Firestore is empty, seed it
          for (const p of INITIAL_POSTS) {
            await addDoc(collection(db, 'forum'), p);
          }
        } catch (err) {
          console.error("Erro ao seedar fórum no Firestore:", err);
          loadLocalForum();
        }
        setLoading(false);
      } else {
        const loaded: PostForum[] = [];
        snapshot.forEach((doc) => {
          loaded.push({ id: doc.id, ...doc.data() } as PostForum);
        });
        setPosts(loaded);
        localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(loaded));
        setLoading(false);
      }
    }, (error) => {
      console.warn("Erro no listener de fórum, usando fallback local:", error);
      loadLocalForum();
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newContent.trim()) return;

    setSubmittingPost(true);
    try {
      const newPost: Omit<PostForum, 'id'> = {
        autorId: user.uid,
        autorNome: user.nome,
        autorPerfil: user.perfil,
        titulo: newTitle,
        conteudo: newContent,
        categoria: newCategory,
        curtidas: 0,
        curtidoPor: [],
        criadoEm: new Date().toISOString(),
        respostas: []
      };

      const useLocal = user.uid.startsWith('demo_') || user.uid.startsWith('post_demo_');

      if (useLocal) {
        const localId = `local_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const createdPost: PostForum = { id: localId, ...newPost };
        const updatedPosts = [createdPost, ...posts];
        setPosts(updatedPosts);
        localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(updatedPosts));
      } else {
        try {
          await addDoc(collection(db, 'forum'), newPost);
        } catch (dbErr) {
          console.warn("Falha ao salvar no Firestore, salvando localmente:", dbErr);
          const localId = `local_post_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const createdPost: PostForum = { id: localId, ...newPost };
          const updatedPosts = [createdPost, ...posts];
          setPosts(updatedPosts);
          localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(updatedPosts));
        }
      }

      // Gamification +15 points
      try {
        await addPoints(15, 'Postou no fórum comunitário');
      } catch (pointsErr) {
        console.warn("Erro ao registrar pontos de gamificação:", pointsErr);
      }

      // Clear Form
      setNewTitle('');
      setNewContent('');
      setNewCategory('geral');
      setShowNewPostForm(false);
    } catch (err) {
      console.error("Erro ao criar post no fórum:", err);
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (post: PostForum) => {
    if (!user) return;
    const isLiked = post.curtidoPor?.includes(user.uid);
    const updatedLikes = isLiked ? Math.max(0, post.curtidas - 1) : post.curtidas + 1;
    const updatedLikedPor = isLiked 
      ? post.curtidoPor.filter(uid => uid !== user.uid)
      : [...(post.curtidoPor || []), user.uid];

    const updatedPosts = posts.map(p => p.id === post.id ? { ...p, curtidas: updatedLikes, curtidoPor: updatedLikedPor } : p);
    
    // Optimistic Update
    setPosts(updatedPosts);
    localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(updatedPosts));

    const useLocal = post.id.startsWith('local_post_') || post.id.startsWith('post_demo_') || user.uid.startsWith('demo_');

    if (!useLocal) {
      try {
        await updateDoc(doc(db, 'forum', post.id), {
          curtidas: updatedLikes,
          curtidoPor: updatedLikedPor
        });
      } catch (err) {
        console.warn("Erro ao atualizar curtida no Firestore, mantido localmente:", err);
      }
    }
  };

  const handleAddReply = async (post: PostForum) => {
    if (!user || !replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      const newReply: RespostaForum = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        autorId: user.uid,
        autorNome: user.nome,
        autorPerfil: user.perfil,
        conteudo: replyContent,
        curtidas: 0,
        curtidoPor: [],
        criadoEm: new Date().toISOString()
      };

      const updatedRespostas = [...(post.respostas || []), newReply];
      const updatedPosts = posts.map(p => p.id === post.id ? { ...p, respostas: updatedRespostas } : p);

      // Optimistic update
      setPosts(updatedPosts);
      localStorage.setItem('cajutech_local_forum_posts', JSON.stringify(updatedPosts));

      const useLocal = post.id.startsWith('local_post_') || post.id.startsWith('post_demo_') || user.uid.startsWith('demo_');

      if (!useLocal) {
        try {
          await updateDoc(doc(db, 'forum', post.id), {
            respostas: updatedRespostas
          });
        } catch (err) {
          console.warn("Erro ao responder no Firestore, mantido localmente:", err);
        }
      }

      // Gamification +10 points
      try {
        await addPoints(10, 'Respondeu uma pergunta no fórum');
      } catch (pointsErr) {
        console.warn("Erro ao registrar pontos de gamificação:", pointsErr);
      }

      setReplyContent('');
      setReplyToPostId(null);
    } catch (err) {
      console.error("Erro ao responder no fórum:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredPosts = activeCategory === 'todos' 
    ? posts 
    : posts.filter(p => p.categoria === activeCategory);

  const getPerfilLabelColor = (perfil: string) => {
    switch (perfil) {
      case 'professor': return 'bg-purple-50 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
      case 'agricultor': return 'bg-art-cream dark:bg-art-cream/20 text-art-cream-text dark:text-art-cream-text border-art-cream-border dark:border-art-cream-border/20';
      default: return 'bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/40';
    }
  };

  const getPerfilLabel = (perfil: string) => {
    switch (perfil) {
      case 'professor': return '👨‍🏫 Professor';
      case 'agricultor': return '🌾 Agricultor';
      default: return '🎓 Aluno';
    }
  };

  return (
    <div className="space-y-4" id="community-forum">
      {/* Search & Category Filter Section */}
      <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-art-dark flex items-center gap-2">
            💬 Fórum Comunitário Piauí
          </h3>
          <p className="text-xs text-art-muted">Tire dúvidas, compartilhe receitas de cajuína e comemore sua colheita</p>
        </div>

        <button
          onClick={() => setShowNewPostForm(!showNewPostForm)}
          className="bg-art-green hover:opacity-95 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all shadow-sm shrink-0 cursor-pointer"
        >
          {showNewPostForm ? 'Fechar Formulário' : '📝 Fazer uma Pergunta'}
        </button>
      </div>

      {/* New Post Form */}
      {showNewPostForm && (
        <form onSubmit={handleCreatePost} className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-4 animate-slide-up">
          <h4 className="font-serif font-bold text-art-dark text-sm">Qual a sua dúvida ou relato?</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Título da Pergunta</label>
              <input 
                type="text"
                placeholder="Ex: Como tirar a mancha preta da folha do cajueiro?"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full bg-art-bg border border-art-border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Categoria</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full bg-art-bg border border-art-border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-semibold"
              >
                <option value="geral">💬 Assuntos Gerais</option>
                <option value="cultivo">🌳 Cultivo e Poda</option>
                <option value="derivados">🌰 Cajuína e Doces</option>
                <option value="pragas">🐛 Combate a Pragas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-art-muted uppercase mb-1.5">Conteúdo da mensagem</label>
            <textarea 
              rows={4}
              placeholder="Explique detalhadamente sua dúvida para que professores e outros agricultores possam te ajudar..."
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              required
              className="w-full bg-art-bg border border-art-border rounded-xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark leading-relaxed font-medium"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewPostForm(false)}
              className="px-4 py-2 rounded-full text-xs text-art-muted hover:bg-art-bg font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submittingPost}
              className="bg-art-green hover:opacity-95 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              {submittingPost ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Publicando...</span>
                </>
              ) : (
                <span>Publicar Pergunta 🚀</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'todos', label: 'Todos os tópicos', emoji: '🌟' },
          { id: 'cultivo', label: 'Cultivo', emoji: '🌳' },
          { id: 'derivados', label: 'Cajuína & Doces', emoji: '🌰' },
          { id: 'pragas', label: 'Pragas', emoji: '🐛' },
          { id: 'geral', label: 'Geral', emoji: '💬' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
              activeCategory === cat.id 
                ? 'bg-art-green text-white border-art-green shadow-sm'
                : 'bg-white dark:bg-art-gray-bg/40 text-art-muted border-art-border hover:bg-art-bg'
            }`}
          >
            <span>{cat.emoji} {cat.label}</span>
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl p-12 border border-art-border text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-art-green animate-spin mb-3" />
          <p className="text-xs text-art-muted font-medium">Conectando ao Fórum em Tempo Real...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white dark:bg-art-gray-bg/40 rounded-3xl p-12 border border-art-border text-center">
          <MessageSquare className="w-10 h-10 text-art-border mx-auto mb-3" />
          <p className="text-sm font-bold text-art-dark">Nenhum tópico encontrado</p>
          <p className="text-xs text-art-muted max-w-xs mx-auto mt-2 leading-relaxed">Seja o primeiro a fazer uma pergunta nesta categoria!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-art-gray-bg/40 rounded-3xl shadow-sm border border-art-border p-6 space-y-4 hover:border-art-orange/30 hover:shadow-md transition-all">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-art-cream border border-art-cream-border flex items-center justify-center text-art-cream-text text-sm font-bold uppercase">
                    {post.autorNome.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-xs text-art-dark">{post.autorNome}</strong>
                      <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-md ${getPerfilLabelColor(post.autorPerfil)}`}>
                        {getPerfilLabel(post.autorPerfil)}
                      </span>
                    </div>
                    <span className="text-[10px] text-art-muted">
                      {new Date(post.criadoEm).toLocaleDateString('pt-BR')} às {new Date(post.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold text-art-muted bg-art-bg px-3 py-1 rounded-full border border-art-border">
                  {post.categoria === 'pragas' ? '🐛 Pragas' : post.categoria === 'derivados' ? '🌰 Derivados' : post.categoria === 'cultivo' ? '🌳 Cultivo' : '💬 Geral'}
                </span>
              </div>

              {/* Title & Content */}
              <div className="space-y-1.5">
                <h4 className="font-serif font-bold text-base text-art-dark">{post.titulo}</h4>
                <p className="text-xs text-art-muted leading-relaxed font-medium whitespace-pre-wrap">{post.conteudo}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 text-xs text-art-muted pt-3 border-t border-art-border">
                <button 
                  onClick={() => handleLikePost(post)}
                  className={`flex items-center gap-1.5 font-bold hover:text-red-500 transition-all cursor-pointer ${
                    post.curtidoPor?.includes(user?.uid || '') ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.curtidoPor?.includes(user?.uid || '') ? 'fill-current' : ''}`} />
                  <span>{post.curtidas || 0} Curtidas</span>
                </button>

                <button 
                  onClick={() => setReplyToPostId(replyToPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 font-bold hover:text-art-green transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{(post.respostas || []).length} Respostas</span>
                </button>
              </div>

              {/* Nested replies section */}
              {(post.respostas || []).length > 0 && (
                <div className="space-y-3 bg-art-bg rounded-2xl p-4 border border-art-border mt-3">
                  {post.respostas.map((rep) => (
                    <div key={rep.id} className="text-xs space-y-1.5 pb-2.5 border-b border-art-border last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-art-dark text-[11px]">{rep.autorNome}</strong>
                          <span className={`text-[8px] font-bold border px-1 py-0.2 rounded-md ${getPerfilLabelColor(rep.autorPerfil)}`}>
                            {getPerfilLabel(rep.autorPerfil)}
                          </span>
                        </div>
                        <span className="text-[9px] text-art-muted font-mono">
                          {new Date(rep.criadoEm).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-art-dark/80 leading-relaxed font-medium">{rep.conteudo}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Form */}
              {replyToPostId === post.id && (
                <div className="flex gap-2 items-center pt-2">
                  <input 
                    type="text"
                    placeholder="Escreva um conselho ou resposta para esta pergunta..."
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    className="flex-1 bg-art-bg border border-art-border rounded-full px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-art-green text-art-dark font-medium"
                  />
                  <button 
                    onClick={() => handleAddReply(post)}
                    disabled={submittingReply}
                    className="p-2 bg-art-green disabled:bg-stone-300 text-white rounded-full hover:opacity-90 transition-all shadow-sm shrink-0 cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]"
                  >
                    {submittingReply ? (
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
