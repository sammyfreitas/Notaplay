(() => {
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const state={song:MUSICAS[0],mode:"aprender",display:"number",index:0,hits:0,errors:0,score:0,started:false,playing:false,timers:[],level:"todas",origin:"todas",type:"todas"};
  const keyMap={"1":"C4","2":"D4","3":"E4","4":"F4","5":"G4","6":"A4","7":"B4","c":"C4","v":"D4","b":"E4","n":"F4","m":"G4",",":"A4",".":"B4","/":"C5"};
  const levelName={facil:"FÁCIL",medio:"MÉDIO",dificil:"DIFÍCIL"};

  function clearTimers(){state.timers.forEach(clearTimeout);state.timers=[];state.playing=false}
  function reset(){clearTimers();state.index=0;state.hits=0;state.errors=0;state.score=0;state.started=false;updateStats();renderSequence();updateTarget();$("#progressBar").style.width="0%";$("#progressText").textContent=`0 / ${state.song.notas.length}`;$("#feedback").className="feedback";$("#feedback").textContent="Pronto! Clique em Iniciar.";$("#startBtn").innerHTML='<i class="fa-solid fa-play"></i> Iniciar'}
  function label(note,type=state.display){const m=PianoEngine.meta[note];return type==="solfege"?m.solfege:type==="letter"?m.letter:m.number}
  function fullLabel(note){const m=PianoEngine.meta[note];return `${m.solfege.toUpperCase()} · ${m.letter} · ${m.number}`}
  function updateStats(){$("#hits").textContent=state.hits;$("#errors").textContent=state.errors;$("#score").textContent=state.score.toLocaleString("pt-BR")}
  function renderSequence(){
    const box=$("#sequence");box.innerHTML="";let cursor=0;
    const groups=state.song.frases?.length?state.song.frases:[state.song.notas.length];
    groups.forEach(len=>{
      const phrase=document.createElement("div");phrase.className="phrase";
      state.song.notas.slice(cursor,cursor+len).forEach((n,j)=>{
        const i=cursor+j,s=document.createElement("span");
        s.className="seq-note"+(i<state.index?" done":i===state.index?" current":"");
        s.textContent=label(n);phrase.appendChild(s)
      });
      box.appendChild(phrase);cursor+=len;
    });
  }
  function updateTarget(){
    $$(".piano-key").forEach(k=>k.classList.remove("target"));
    const note=state.song.notas[state.index];
    if(!note){$("#nextNote").textContent="CONCLUÍDO ✓";return}
    $("#nextNote").textContent=fullLabel(note);
    if(state.mode==="aprender"&&state.started)$(`.piano-key[data-note="${note}"]`)?.classList.add("target")
  }
  function progress(){
    const total=state.song.notas.length,p=Math.min(100,state.index/total*100);
    $("#progressBar").style.width=p+"%";$("#progressText").textContent=`${Math.min(state.index,total)} / ${total}`
  }
  function finish(){
    state.started=false;$("#progressBar").style.width="100%";$("#progressText").textContent=`${state.song.notas.length} / ${state.song.notas.length}`;
    $("#feedback").className="feedback good";$("#feedback").textContent=`Música concluída! ${state.hits} acertos, ${state.errors} erros e ${state.score.toLocaleString("pt-BR")} pontos.`;
    $("#startBtn").innerHTML='<i class="fa-solid fa-rotate-right"></i> Jogar novamente';updateTarget()
  }
  function flash(note,cls="active"){
    const k=$(`.piano-key[data-note="${note}"]`);if(!k)return;k.classList.add(cls);setTimeout(()=>k.classList.remove(cls),180)
  }
  function userPlay(note){
    PianoEngine.play(note);flash(note);
    if(state.mode==="livre"){state.hits++;state.score+=10;updateStats();$("#feedback").textContent=fullLabel(note);return}
    if(!state.started||state.mode==="ouvir")return;
    const expected=state.song.notas[state.index];
    if(note===expected){state.hits++;state.score+=state.mode==="desafio"?150:100;state.index++;$("#feedback").className="feedback good";$("#feedback").textContent="✓ Certo!";updateStats();progress();renderSequence();updateTarget();if(state.index>=state.song.notas.length)finish()}
    else{state.errors++;state.score=Math.max(0,state.score-25);flash(note,"wrong");$("#feedback").className="feedback bad";$("#feedback").textContent=`✕ Tente novamente. A próxima é ${fullLabel(expected)}.`;updateStats()}
  }
  function autoPlay(notes=state.song.notas){
    clearTimers();state.playing=true;const speed=Number($("#speedSelect").value),gap=520/speed;
    notes.forEach((n,i)=>state.timers.push(setTimeout(()=>{PianoEngine.play(n,.35/speed);flash(n);$("#feedback").className="feedback";$("#feedback").textContent=`♪ ${fullLabel(n)}`},i*gap)));
    state.timers.push(setTimeout(()=>{state.playing=false;$("#feedback").textContent="Reprodução concluída."},notes.length*gap+100))
  }
  function selectSong(song){
    state.song=song;$("#songTitle").textContent=song.titulo;$("#songSubtitle").textContent=song.subtitulo;$("#difficultyBadge").textContent=levelName[song.nivel];
    $("#difficultyBadge").style.color=song.nivel==="dificil"?"var(--danger)":song.nivel==="medio"?"var(--warning)":"var(--success)";
    renderSongs();reset()
  }
  function renderSongs(){
    const q=$("#songSearch").value.trim().toLowerCase(),list=$("#songList");list.innerHTML="";
    const songs=MUSICAS.filter(s=>
      (state.level==="todas"||s.nivel===state.level) &&
      (state.origin==="todas"||s.origem===state.origin) &&
      (state.type==="todas"||s.tipo===state.type) &&
      s.titulo.toLowerCase().includes(q));
    $("#songCount").textContent=`${songs.length} músicas`;
    songs.forEach(s=>{const b=document.createElement("button");b.type="button";b.className="song-card"+(s.id===state.song.id?" active":"");const preview=s.notas.slice(0,12).map(n=>`<span>${label(n)}</span>`).join("");
      b.innerHTML=`<strong>${s.titulo}</strong><small><span class="level-dot ${s.nivel}"></span>${levelName[s.nivel]} · ${s.notas.length} notas</small><div class="song-notes-preview">${preview}${s.notas.length>12?"<span>…</span>":""}</div>`;b.addEventListener("click",()=>selectSong(s));list.appendChild(b)})
  }
  function setMode(mode){
    state.mode=mode;$$("[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    $("#modeMessage").textContent=mode==="livre"?"Toque livremente":mode==="aprender"?"Toque a nota destacada":mode==="ouvir"?"Ouça e acompanhe as teclas": "Acerte as notas e faça pontos";
    reset()
  }
  $$(".piano-key").forEach(k=>k.addEventListener("click",()=>userPlay(k.dataset.note)));
  window.addEventListener("keydown",e=>{if(["INPUT","SELECT","TEXTAREA"].includes(document.activeElement.tagName))return;const n=keyMap[e.key.toLowerCase()];if(n&&!e.repeat){e.preventDefault();userPlay(n)}});
  $$("[data-mode]").forEach(b=>b.addEventListener("click",()=>setMode(b.dataset.mode)));
  $$(".display").forEach(b=>b.addEventListener("click",()=>{state.display=b.dataset.display;$$(".display").forEach(x=>x.classList.toggle("active",x===b));renderSequence()}));
  $("#levelFilter").addEventListener("change",e=>{state.level=e.target.value;renderSongs()});
  $("#originFilter").addEventListener("change",e=>{state.origin=e.target.value;renderSongs()});
  $("#typeFilter").addEventListener("change",e=>{state.type=e.target.value;renderSongs()});
  $("#songSearch").addEventListener("input",renderSongs);
  $("#startBtn").addEventListener("click",()=>{
    if(state.mode==="ouvir"){autoPlay();return}
    if(state.index>=state.song.notas.length)reset();
    state.started=true;$("#startBtn").innerHTML='<i class="fa-solid fa-pause"></i> Em andamento';$("#feedback").textContent=state.mode==="livre"?"Toque o que quiser.":"Começou!";updateTarget()
  });
  $("#listenChunkBtn").addEventListener("click",()=>autoPlay(state.song.notas.slice(state.index,state.index+5)));
  $("#restartBtn").addEventListener("click",reset);
  $("#themeToggle").addEventListener("click",()=>{
    const html=document.documentElement,next=html.dataset.theme==="dark"?"light":"dark";html.dataset.theme=next;localStorage.setItem("notaplay-theme",next);
    $("#themeToggle i").className=next==="dark"?"fa-solid fa-sun":"fa-solid fa-moon"
  });
  const saved=localStorage.getItem("notaplay-theme");if(saved)document.documentElement.dataset.theme=saved;
  $("#themeToggle i").className=document.documentElement.dataset.theme==="dark"?"fa-solid fa-sun":"fa-solid fa-moon";
  renderSongs();reset();
})();