window.PianoEngine = (() => {
  const freq={C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,C5:523.25};
  const meta={
    C4:{solfege:"Dó",letter:"C",number:"1",key:"C"},D4:{solfege:"Ré",letter:"D",number:"2",key:"V"},
    E4:{solfege:"Mi",letter:"E",number:"3",key:"B"},F4:{solfege:"Fá",letter:"F",number:"4",key:"N"},
    G4:{solfege:"Sol",letter:"G",number:"5",key:"M"},A4:{solfege:"Lá",letter:"A",number:"6",key:","},
    B4:{solfege:"Si",letter:"B",number:"7",key:"."},C5:{solfege:"Dó",letter:"C5",number:"1'",key:"/"}
  };
  let ctx;
  function audio(){ctx ||= new (window.AudioContext||window.webkitAudioContext)(); if(ctx.state==="suspended")ctx.resume(); return ctx}
  function play(note,duration=.42){
    if(!freq[note])return;
    const a=audio(),o=a.createOscillator(),g=a.createGain();
    o.type="triangle";o.frequency.value=freq[note];
    g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(.25,a.currentTime+.015);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);
    o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration+.03);
  }
  return {play,meta};
})();