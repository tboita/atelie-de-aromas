/* Conhecimento do ateliê: famílias, notas, produtos e regras. Portado do app original sem alterações de conteúdo. */
export const FAM=[
 {n:'Cítrico',d:'Abre a vela: limão, bergamota, capim-limão. Evapora rápido.'},
 {n:'Marinho',d:'Ar de mar e brisa. Pede madeira no fundo.'},
 {n:'Verde e chá',d:'Chás, folhas, bambu. Ponte entre fresco e floral.'},
 {n:'Herbal',d:'Lavanda, alecrim, ervas de benzedeira.'},
 {n:'Amadeirado',d:'Madeiras: fundo estável que segura o topo.'},
 {n:'Resinoso',d:'Resinas, couro, patchouli. Fortes: perto de 15%.'},
 {n:'Especiado',d:'Cravo, canela, pimenta rosa. Aquecem a fórmula.'},
 {n:'Gourmand',d:'Baunilha, mel, chocolate, café. Doces e fixadores.'},
 {n:'Floral',d:'Flor de laranjeira, ylang ylang, rosa, jasmim.'},
 {n:'Frutal',d:'Caju, maracujá, pitanga, figo, maçã.'}
];
// [nome, família, camadas possíveis (t,c,f), forte, apelidos]
const NOTES_RAW=[
 ['Bergamota',0,'t'],['Limão',0,'t',0,['limao siciliano']],['Laranja',0,'t',0,['laranja doce']],['Capim-limão',0,'t',0,['capim limao','lemongrass']],['Mexerica',0,'t',0,['tangerina']],
 ['Marina',1,'tc'],['Ocean',1,'t',0,['oceano']],['Mar e Sal',1,'tc'],
 ['Bamboo e Chá Branco',2,'tc',0,['bamboo','cha branco']],['Chá verde',2,'t'],['Chá preto',2,'tc',0,['cha preto suave']],['Cascas e Folhas',2,'c'],['Erva-mate',2,'c',0,['mate']],
 ['Alecrim',3,'t',0,['alecrim ll']],['Lavanda',3,'tc',0,['lavanda francesa','alfazema']],['Erva-doce',3,'tc'],['Sálvia',3,'t'],['Eucalipto',3,'t'],['Erva-cidreira',3,'tc'],['Zimbro',3,'t'],
 ['Madeira',4,'f'],['Cedro',4,'f'],['Sândalo',4,'f'],['Carvalho',4,'f'],['Palo Santo',4,'cf'],['Vetiver',4,'f',1],
 ['Patchouli',5,'f',1],['Âmbar',5,'f'],['Almíscar',5,'f'],['Benjoim',5,'f'],['Couro',5,'cf'],['Madeira defumada',5,'cf'],['Priprioca',5,'cf'],['Mirra',5,'f'],['Olíbano',5,'cf'],
 ['Cravo',6,'tc',0,['cravo flor']],['Canela',6,'tc'],['Pimenta rosa',6,'tc',0,['aroeira']],['Cardamomo',6,'t'],['Gengibre',6,'t'],
 ['Baunilha',7,'f'],['Mel',7,'f'],['Chocolate',7,'cf'],['Café torrado',7,'tc'],['Cappuccino',7,'tc'],
 ['Flor de laranjeira',8,'tc'],['Ylang Ylang',8,'c'],['Jasmim',8,'c',0,['jasmim sambac']],['Rosa',8,'c'],['Gerânio',8,'c'],['Flor de figo',8,'c'],
 ['Maçã com Canela',9,'t'],['Caju',9,'t'],['Maracujá',9,'t'],['Pitanga Preta',9,'t',0,['pitanga']],['Figo',9,'tc'],['Pequi',9,'c']
];
export const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\(.*?\)/g,' ')
 .replace(/\bessencia( de)?\b/g,' ').replace(/\b(para vela|de vela|cosmetica|lipossoluvel|hidro plus|hidrossoluvel|francesa|ll|oleo essencial)\b/g,' ')
 .replace(/-/g,' ').replace(/\s+/g,' ').trim();
export const NOTES=NOTES_RAW.map(([nome,f,c,forte,al])=>({nome,f,c:c.split(''),forte:!!forte,al:al||[]}));
const IDX={}; NOTES.forEach(n=>{IDX[norm(n.nome)]=n; n.al.forEach(a=>IDX[norm(a)]=n)});
const memo=new Map();
export function noteFor(name){const k=norm(name); if(!k)return null; if(memo.has(k))return memo.get(k);
 let r=IDX[k]||null; if(!r){let bl=0; for(const a in IDX){if((' '+k+' ').includes(' '+a+' ')&&a.length>bl){r=IDX[a];bl=a.length}}}
 memo.set(k,r); return r;}
export const keyOf=name=>{const n=noteFor(name);return n?n.nome:norm(name)};
export const famColor=f=>`var(--f${f})`;

export const PROD={
 vela:{n:'Vela',base:110,dose:9.1,lb:'Cera (g)',un:'g',tipos:['vela'],tipoNome:'Essência para vela',
   prep:'Banho-maria: cera de 60 a 70 °C. Fora do fogo, essência a 60 °C; mexer 2 min; despejar de 55 a 60 °C. Endurecer 24 h e curar 7 dias antes de avaliar.',lim:10},
 sabonete:{n:'Sabonete em barra',base:270,dose:3,lb:'Massa da receita (g)',un:'g',tipos:['cosmetica','oleo'],tipoNome:'Essência cosmética',
   prep:'Banho-maria sem ferver: derreter a base, juntar manteiga e babaçu. Fora do fogo, essência a 65 °C; a base não volta ao fogo. Despejar e borrifar álcool. Fazer 2 ou 3 barras por vez.',lim:3},
 manteiga:{n:'Manteiga corporal',base:50,dose:1,lb:'Pote (g)',un:'g',tipos:['cosmetica','oleo'],tipoNome:'Essência cosmética',
   prep:'Banho-maria baixo: derreter manteiga e babaçu. Gelar até ficar opaca e firme por cima; juntar polvilho e essência; bater 3 a 5 min. Teste de toque após 24 h.'},
 liquido:{n:'Sabonete líquido',base:250,dose:.5,lb:'Base (ml)',un:'ml',tipos:['hidro'],tipoNome:'Essência hidrossolúvel',
   prep:'Temperatura ambiente, sem aquecer. Mexer sem bater; descansar 24 h.'},
 cabelo:{n:'Shampoo e condicionador',base:100,dose:1,lb:'Barra (g)',un:'g',tipos:['oleo'],tipoNome:'Óleo essencial',
   prep:'Shampoo: derreter a cerca de 70 °C; óleos essenciais a cerca de 45 °C. Condicionador: derreter a cerca de 80 °C (o BTMS precisa); óleos a cerca de 50 °C.'}
};
export const STATUS={ideia:'A criar','a-testar':'A testar',refazer:'Refazer',aprovada:'Aprovada'};
export const TIPOS={vela:'Essência para vela',cosmetica:'Essência cosmética',hidro:'Essência hidrossolúvel',oleo:'Óleo essencial',insumo:'Insumo e embalagem'};
export const LAYN={t:'Topo',c:'Coração',f:'Fundo'};


export const PLANOS=[
 {nome:'Harmonia',desc:'Famílias vizinhas no círculo: transição suave entre as camadas.',offs:[[0,1,-1,2,-2],[-1,1,0,-2,2]]},
 {nome:'Contraste',desc:'Uma camada vem da família oposta: mais personalidade.',offs:[[5,4,-4,6],[1,-1,0,2,-2]]},
 {nome:'Tríade',desc:'Três famílias equidistantes no círculo.',offs:[[3,4,-3],[-3,-4,3,4]]},
 {nome:'Só com o que tenho',desc:'Usa apenas essências do estoque para este produto.',offs:[[0,1,-1,2,-2,3,-3,4,-4,5],[1,-1,0,2,-2,3,-3,4,-4,5]],only:true}
];

export const PASSOS={
 vela:[['Derreta a cera em banho-maria','60 a 70 °C'],['Tire do fogo e espere a temperatura baixar','60 °C'],['Junte as essências pesadas e mexa devagar por 2 minutos','60 °C'],['Despeje no recipiente, com o pavio já fixado','55 a 60 °C'],['Deixe endurecer 24 h, corte o pavio a 0,5 cm e cure 7 dias antes de avaliar','']],
 sabonete:[['Derreta a base em banho-maria, sem ferver',''],['Junte a manteiga e o babaçu (com o leite em pó já misturado neles, quando houver) ou a argila em pasta',''],['Fora do fogo, junte as essências; a base não volta ao fogo','65 °C'],['Despeje, borrife álcool e embrulhe depois de 2 h','']],
 manteiga:[['Derreta a manteiga com o babaçu em banho-maria baixo',''],['Leve à geladeira até ficar opaca e firme por cima',''],['Junte o polvilho e as gotas de essência',''],['Bata com o mini mixer de 3 a 5 minutos e envase',''],['Espere 24 h e faça o teste de toque no antebraço','']],
 liquido:[['Coloque a base e o extrato glicólico','ambiente'],['Junte as essências e mexa sem bater','ambiente'],['Descanse 24 h antes de usar','']],
 shampoo:[['Derreta SCI, álcool cetílico, manteiga, babaçu e glicerina em banho-maria até virar pasta','70 °C'],['Fora do fogo, misture o polvilho e a argila',''],['Junte os óleos essenciais','45 °C'],['Pressione bem na forma e desenforme após 24 a 48 h','']],
 condicionador:[['Derreta BTMS, álcool cetílico, manteiga e babaçu em banho-maria','80 °C'],['Fora do fogo, junte andiroba, azeite e glicerina',''],['Junte os óleos essenciais','50 °C'],['Enforme e espere endurecer','']]
};

export const fmt=n=>(Math.round(n*100)/100).toLocaleString('pt-BR',{maximumFractionDigits:2});
export const r1=n=>Math.round(n*10)/10;
export function dose(g,un){const u=un==='ml'?'ml':'g';let s=u==='g'?`${fmt(g)} g · ${fmt(g)} ml`:`${fmt(g)} ml`;if(g>0&&g<=1.5)s+=` · ${Math.round(g*20)} gotas`;return s}
export const hoje=()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)};
export const ABAS=['circulo','receitas','calc','guia','velas','estoque','compras','diario'];
