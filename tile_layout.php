<?php
declare(strict_types=1);
require __DIR__ . '/app/lib/auth.php';
require_admin_role('admin');

/**
 * Раскладка тротуарной плитки — генератор 4 схем раскладки (дизеринг-
 * градиент/штрихкод/растр/управляемый рандом) + спецификация закупки для
 * прямого участка отмостки. Изначально был отдельным HTML под конкретный
 * комплект «Новый город» (17,5×1,45 м, элементы 240/160/80×160); версия 2 —
 * полностью ПАРАМЕТРИЧЕСКАЯ: длина/ширина участка, ширина камня (высота
 * ряда) и произвольный список длин элементов через запятую задаются
 * вручную, модуль вычисляется как НОД всех длин. Это покрывает «любой
 * комплект плитки/брусчатки» без жёсткого каталога — готовые кнопки-
 * пресеты ниже лишь подставляют типовые сочетания, задать можно любые
 * другие размеры из технического листа поставщика.
 *
 * Художественные раскладки вариантов 2/3 («Штрихкод»/«Растр») заданы
 * ОТНОСИТЕЛЬНЫМИ весами полос (см. REL_B/REL_C) и масштабируются под любое
 * число модулей — та же ручная настройка, что была у оригинального
 * «Нового города», просто больше не привязана к его конкретной длине.
 *
 * Тема — Bootstrap/gisdata (card/table/form вместо собственных стилей
 * инструмента), см. также facade_cad.php и соседей по разделу «Инструменты».
 *
 * Доступ: только администраторам — внутренний расчётный инструмент, не
 * пользовательская услуга (в отличие от FACADE·CAD/TOPO·CAD/FACADE·FOTO).
 */
$pageTitle = 'Раскладка тротуарной плитки';
$pageIcon = 'bi-grid-3x3-gap-fill';
require __DIR__ . '/app/views/_head.php';
?>
<style>
  #tileTool svg { display: block; width: 100%; height: auto; border-radius: 4px; }
  #tileTool .fact-num { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; line-height: 1.15; }
  #tileTool .fact-lbl { font-size: 12px; color: var(--bs-secondary-color); }
  #tileTool .halves { display: grid; gap: 8px; }
  @media (min-width: 768px) { #tileTool .halves { grid-template-columns: 1fr 1fr; } }
  #tileTool .legend-chip { display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; padding: 4px 10px; font-size: 13px; }
  #tileTool .sw { width: 13px; height: 13px; border-radius: 3px; flex: none; }
  #tileTool .sum-badge { font-variant-numeric: tabular-nums; }
  #tileTool .preset-btn { font-size: 12px; }
  @media print {
    @page { size: A3 landscape; margin: 10mm; }
    #tileTool .no-print { display: none !important; }
  }
</style>

<div id="tileTool">
  <p class="text-secondary small mb-3" id="sub">Параметрическая схема — размеры задаются вручную</p>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-2">Исходные данные</h2>
      <div class="row g-3 no-print">
        <div class="col-6 col-md-3">
          <label class="form-label small text-secondary" for="pLen">Длина отмостки, мм</label>
          <input type="number" class="form-control form-control-sm" id="pLen" value="17500" step="50">
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small text-secondary" for="pWid">Ширина отмостки, мм</label>
          <input type="number" class="form-control form-control-sm" id="pWid" value="1450" step="50">
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small text-secondary" for="pRow">Ширина камня (высота ряда), мм</label>
          <input type="number" class="form-control form-control-sm" id="pRow" value="150" step="10">
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label small text-secondary" for="pJoint">Шов, мм</label>
          <input type="number" class="form-control form-control-sm" id="pJoint" value="3" step="1" min="1" max="10">
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label small text-secondary" for="pSizes">Длины элементов, мм (через запятую)</label>
          <input type="text" class="form-control form-control-sm" id="pSizes" value="100, 150, 200">
        </div>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-3 no-print">
        <button type="button" class="btn btn-sm btn-outline-light preset-btn" onclick="setP(150,'100, 150, 200')">150: 100/150/200 (модуль 50)</button>
        <button type="button" class="btn btn-sm btn-outline-light preset-btn" onclick="setP(150,'100, 150, 200, 250')">150: 100/150/200/250</button>
        <button type="button" class="btn btn-sm btn-outline-light preset-btn" onclick="setP(200,'100, 200, 300')">200: 100/200/300</button>
        <button type="button" class="btn btn-sm btn-outline-light preset-btn" onclick="setP(160,'80, 160, 240')">160: 80/160/240 (модуль 80, «Новый город»)</button>
        <button type="button" class="btn btn-sm btn-outline-light preset-btn" onclick="setP(160,'100, 160, 260')">160: 100/160/260</button>
      </div>
      <div id="grid" class="mt-3"></div>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-1">Вариант 1 — «Пепел». Дизеринг-градиент</h2>
      <p class="small text-secondary">Плавная растяжка серый → чёрный по всей длине, набранная не полосами,
        а вероятностным рассеиванием отдельных камней. Тёплые акценты «разогреваются» по ходу: жёлтые искры
        сгущаются в светлой трети, красные — в тёмной.</p>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Общий вид</div>
      <div id="A_full"></div>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Детально · левая и правая половины</div>
      <div class="halves" id="A_half"></div>
      <div class="d-flex flex-wrap gap-2 mt-3" id="A_leg"></div>
      <div class="table-responsive" id="A_tab"></div>
      <button type="button" class="btn btn-sm btn-outline-light mt-3 no-print" onclick="reroll()">Перегенерировать рассеивание</button>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-1">Вариант 2 — «Штрихкод». Ритм-код</h2>
      <p class="small text-secondary">Двадцать вертикальных полос переменной ширины по ряду Фибоначчи. Границы полос
        совпадают со швами плитки — края получаются идеально резкими. Редкие акцентные штрихи держат весь рисунок.</p>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Общий вид</div>
      <div id="B_full"></div>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Детально · левая и правая половины</div>
      <div class="halves" id="B_half"></div>
      <div class="d-flex flex-wrap gap-2 mt-3" id="B_leg"></div>
      <div class="table-responsive" id="B_tab"></div>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-1">Вариант 3 — «Растр». Гибрид градиента и кода</h2>
      <p class="small text-secondary">Градиент, собранный средствами штрихкода: чёрные полосы расширяются слева
        направо, серые промежутки сжимаются. Самый графичный и самый простой в укладке — бригада работает
        крупными зонами.</p>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Общий вид</div>
      <div id="C_full"></div>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Детально · левая и правая половины</div>
      <div class="halves" id="C_half"></div>
      <div class="d-flex flex-wrap gap-2 mt-3" id="C_leg"></div>
      <div class="table-responsive" id="C_tab"></div>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-1">Вариант 4 — «Хаос». Управляемый рандом</h2>
      <p class="small text-secondary">Цвет каждого камня — случайный, но с двумя поправками: <b>доминанта</b> (один
        цвет держит фон, остальные — вкраплениями) и <b>разбивка скоплений</b> (не даёт трём одинаковым камням
        встать подряд и «сесть» на такой же в соседнем ряду).</p>

      <div class="d-flex flex-wrap align-items-center gap-3 p-3 rounded-3 no-print mb-3"
           style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1)">
        <label class="small text-secondary d-flex align-items-center gap-2 mb-0">Серый, %
          <input type="number" class="form-control form-control-sm" id="wG" value="62" min="0" max="100" step="2" style="width:64px"></label>
        <label class="small text-secondary d-flex align-items-center gap-2 mb-0">Чёрный, %
          <input type="number" class="form-control form-control-sm" id="wB" value="24" min="0" max="100" step="2" style="width:64px"></label>
        <label class="small text-secondary d-flex align-items-center gap-2 mb-0">Жёлтый, %
          <input type="number" class="form-control form-control-sm" id="wY" value="8" min="0" max="100" step="1" style="width:64px"></label>
        <label class="small text-secondary d-flex align-items-center gap-2 mb-0">Красный, %
          <input type="number" class="form-control form-control-sm" id="wR" value="6" min="0" max="100" step="1" style="width:64px"></label>
        <span class="badge sum-badge" id="wSum">100%</span>
        <button type="button" class="btn btn-sm btn-outline-light" onclick="normalizeW()">Нормализовать до 100%</button>
        <div class="form-check mb-0">
          <input class="form-check-input" type="checkbox" id="wAC" checked>
          <label class="form-check-label small" for="wAC">разбивать скопления</label>
        </div>
        <div class="vr d-none d-md-block"></div>
        <div class="btn-group btn-group-sm">
          <button type="button" class="btn btn-outline-light" onclick="preset(62,24,8,6)">Гранит</button>
          <button type="button" class="btn btn-outline-light" onclick="preset(78,10,7,5)">Крапина</button>
          <button type="button" class="btn btn-outline-light" onclick="preset(40,40,12,8)">Соль-перец</button>
          <button type="button" class="btn btn-outline-light" onclick="preset(46,20,26,8)">Песчаник</button>
          <button type="button" class="btn btn-outline-light" onclick="preset(25,25,25,25)">Чистый рандом</button>
        </div>
        <div class="vr d-none d-md-block"></div>
        <button type="button" class="btn btn-sm btn-primary" onclick="rerollD()">Перебросить</button>
      </div>

      <div class="text-uppercase text-secondary small mb-1" style="letter-spacing:.06em">Общий вид</div>
      <div id="D_full"></div>
      <div class="text-uppercase text-secondary small mt-3 mb-1" style="letter-spacing:.06em">Детально · левая и правая половины</div>
      <div class="halves" id="D_half"></div>
      <div class="d-flex flex-wrap gap-2 mt-3" id="D_leg"></div>
      <div class="table-responsive" id="D_tab"></div>
      <div class="alert alert-warning bg-opacity-10 small mt-3 mb-0">
        Проценты не обязаны в сумме давать ровно 100 — раскладка нормализует их сама при генерации,
        но бейдж и кнопка «Нормализовать» помогают держать значения читаемыми.
        Суммарную долю жёлтого и красного выше 15% поднимать не стоит — иначе акценты перестают быть акцентами.
      </div>
    </div>
  </div>

  <div class="card surface-card mb-3">
    <div class="card-body">
      <h2 class="h6 mb-2">Спецификация закупки</h2>
      <div class="d-flex align-items-center gap-2 no-print mb-3">
        <label class="small text-secondary" for="wWaste">Запас на подрезку, %</label>
        <input type="number" class="form-control form-control-sm" id="wWaste" value="7" min="0" max="50" step="0.5" style="width:80px">
      </div>
      <div class="table-responsive" id="buy"></div>
      <div class="alert alert-warning bg-opacity-10 small mt-3 mb-0">
        <b>Перед заказом проверьте заводскую комплектацию.</b>
        «Новый город» и другие комплекты отгружаются поддонами с фиксированной пропорцией типоразмеров.
        Сверяйте раскладку по м² каждого цвета, а не по штукам — если заводская пропорция сильно отличается
        от расчётной, меняйте состав ряда, а не докупайте штучно.
      </div>
      <ul class="small text-secondary mt-3 mb-0">
        <li>Толщина: для пешей нагрузки достаточно 40 мм, под заезд автомобиля — 60 мм.</li>
        <li>Уклон от стены 2–3% — это ~3,5 см перепада на 1,45 м ширины.</li>
        <li>Все цвета — одной партией (одна замесная серия), иначе оттенок между поддонами «поплывёт».</li>
        <li>Укладку вести одновременно из 3–4 поддонов вперемешку — это гасит разнотон внутри партии.</li>
      </ul>
    </div>
  </div>
</div>

<script>
(function(){
/* ================= палитра ================= */
var NAMES={gray:'Серый',black:'Чёрный',yellow:'Жёлтый',red:'Красный'};
var KEYS=['gray','black','yellow','red'];
var SHADES={
  gray  :['#9a9a95','#a3a39e','#91918c'],
  black :['#3a3a3f','#434348','#333338'],
  yellow:['#c6a24d','#d0ad57','#bc9744'],
  red   :['#9d4433','#a84c3a','#93402f']
};

/* ================= геометрия (пересчитывается) ================= */
var G={};

function gcd(a,b){while(b){var t=a%b;a=b;b=t;}return a;}

function recalc(){
  var len   = Math.max(500, +document.getElementById('pLen').value||17500);
  var wid   = Math.max(200, +document.getElementById('pWid').value||1450);
  var rowW  = Math.max(20,  +document.getElementById('pRow').value||150);
  var joint = Math.min(10, Math.max(1, +document.getElementById('pJoint').value||3));

  var raw=(document.getElementById('pSizes').value||'').split(/[,;\s]+/)
          .map(function(s){return parseInt(s,10);})
          .filter(function(n){return n>0;});
  if(!raw.length) raw=[100,150,200];
  raw.sort(function(a,b){return a-b;});

  var mod=raw[0]; for(var i=1;i<raw.length;i++) mod=gcd(mod,raw[i]);
  var sizes=raw.map(function(v){return v/mod;});          /* размеры в модулях */
  var minU=sizes[0], avgU=0;
  for(i=0;i<sizes.length;i++) avgU+=sizes[i]; avgU/=sizes.length;

  /* ряды по ширине */
  var rows=Math.max(1, Math.floor((wid+joint)/(rowW+joint)));
  var widUsed=rows*rowW+(rows-1)*joint;
  var widLeft=wid-widUsed;

  /* модули по длине: подбираем так, чтобы шов вышел не тоньше заданного */
  var units=Math.floor(len/mod);
  while(units>minU){
    var cnt=Math.max(2, Math.round(units/avgU));
    var jw=(len-units*mod)/(cnt-1);
    if(jw>=joint) break;
    units--;
  }
  var lenUsed=units*mod;
  var cntEst=Math.max(2,Math.round(units/avgU));
  var jointReal=(len-lenUsed)/(cntEst-1);

  G={len:len,wid:wid,rowW:rowW,joint:joint,mod:mod,raw:raw,sizes:sizes,minU:minU,avgU:avgU,
     rows:rows,units:units,widUsed:widUsed,widLeft:widLeft,lenUsed:lenUsed,jointReal:jointReal,
     LEN:units*mod, WID:rows*rowW};
  return G;
}

function fmt(n,d){return n.toFixed(d===undefined?0:d).replace('.',',');}
function label(u){return (u*G.mod)+'×'+G.rowW;}

function gridHTML(){
  var areaTotal=G.len*G.wid/1e6, areaTile=G.rows*G.rowW*G.lenUsed/1e6;
  var h='<div class="row g-3">'+
    '<div class="col-6 col-md-2"><div class="fact-num">'+G.rows+' ряд.</div><div class="fact-lbl">'+G.rows+' × '+G.rowW+' мм + швы</div></div>'+
    '<div class="col-6 col-md-2"><div class="fact-num">'+G.units+' мод.</div><div class="fact-lbl">модуль '+G.mod+' мм · '+G.units+' × '+G.mod+' = '+G.lenUsed+' мм</div></div>'+
    '<div class="col-6 col-md-2"><div class="fact-num">'+fmt(areaTotal,2)+' м²</div><div class="fact-lbl">площадь отмостки</div></div>'+
    '<div class="col-6 col-md-2"><div class="fact-num">'+fmt(areaTile,2)+' м²</div><div class="fact-lbl">покрытие плиткой</div></div>'+
    '<div class="col-6 col-md-2"><div class="fact-num">'+fmt(G.jointReal,1)+' мм</div><div class="fact-lbl">расчётный поперечный шов</div></div>'+
    '</div>';

  var cls, ttl, txt;
  if(G.widLeft<=2){
    cls='alert-success'; ttl='Ширина села в модуль без подрезки';
    txt=G.rows+' ряд. × '+G.rowW+' мм + '+(G.rows-1)+' шв. = '+G.widUsed+' мм при заданных '+G.wid+' мм. Остаток '+fmt(G.widLeft,0)+' мм — в пределах шва.';
  } else if(G.widLeft<G.rowW*0.45){
    cls='alert-warning'; ttl='По ширине нужна доборная полоса '+fmt(G.widLeft,0)+' мм';
    txt=G.rows+' ряд. × '+G.rowW+' мм + '+(G.rows-1)+' шв. = '+G.widUsed+' мм, до '+G.wid+' мм не хватает '+fmt(G.widLeft,0)+' мм. '+
        'Полосу режут вдоль и ставят к стене (под отливом её почти не видно) либо расширяют шов до '+
        fmt((G.wid-G.rows*G.rowW)/(G.rows-1),1)+' мм. Третий путь — изменить ширину отмостки до '+
        G.widUsed+' или '+((G.rows+1)*G.rowW+G.rows*G.joint)+' мм, тогда подрезки не будет вовсе.';
  } else {
    cls='alert-warning'; ttl='По ширине остаётся '+fmt(G.widLeft,0)+' мм';
    txt='Остаток великоват для шва: либо доборная полоса '+fmt(G.widLeft,0)+' мм у стены, либо ширина отмостки '+
        ((G.rows+1)*G.rowW+G.rows*G.joint)+' мм под '+(G.rows+1)+' полных рядов.';
  }
  h+='<div class="alert '+cls+' bg-opacity-10 small mt-3 mb-0"><b class="d-block mb-1">'+ttl+'</b>'+txt+'</div>';

  h+='<div class="alert alert-info bg-opacity-10 small mt-2 mb-0"><b class="d-block mb-1">Длина</b>Ряд набирается из '+G.units+' модулей по '+G.mod+
     ' мм = '+G.lenUsed+' мм плитки. Оставшиеся '+fmt(G.len-G.lenUsed,0)+
     ' мм расходятся на ~'+Math.max(1,Math.round(G.units/G.avgU)-1)+' поперечных швов по '+
     fmt(G.jointReal,1)+' мм. Поперечная подрезка не требуется.</div>';
  return h;
}

/* ================= ГПСЧ ================= */
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;
  var t=Math.imul(seed^seed>>>15,1|seed);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

/* ================= набор ряда ================= */
/* заполняет ровно need модулей, не оставляя хвост меньше минимального элемента */
function fill(need,rnd){
  var out=[],s=G.sizes,minU=G.minU,guard=0;
  while(need>0 && guard++<20000){
    var ok=[],i;
    for(i=0;i<s.length;i++){
      var rest=need-s[i];
      if(s[i]<=need && (rest===0 || rest>=minU)) ok.push(s[i]);
    }
    if(!ok.length){                      /* тупик — берём максимально возможное */
      var mx=0;
      for(i=0;i<s.length;i++) if(s[i]<=need && s[i]>mx) mx=s[i];
      if(!mx){out.push(need);break;}
      out.push(mx); need-=mx; continue;
    }
    var v=ok[(rnd()*ok.length)|0];
    out.push(v); need-=v;
  }
  return out;
}

/* ряд с разбежкой поперечных швов относительно предыдущего */
function freeRow(rnd,prev){
  var a=fill(G.units,rnd);
  for(var pass=0;pass<3;pass++){
    var pos=0;
    for(var i=0;i<a.length-1;i++){
      pos+=a[i];
      if(prev[pos]){
        for(var j=i+1;j<a.length;j++){
          if(a[j]!==a[i]){
            var np=pos-a[i]+a[j];
            if(!prev[np]){var t=a[i];a[i]=a[j];a[j]=t;pos=np;}
            break;
          }
        }
      }
    }
  }
  return a;
}

/* ================= полосы ================= */
function scaleBands(rel,total,minU){
  var sum=0,i; for(i=0;i<rel.length;i++) sum+=rel[i].r;
  var out=[],acc=0;
  for(i=0;i<rel.length;i++){
    var w=Math.round(rel[i].r/sum*total);
    if(w<minU) w=minU;
    out.push({w:w,c:rel[i].c}); acc+=w;
  }
  var diff=total-acc,k=0,guard=0;
  while(diff>0 && guard++<1e5){ out[k%out.length].w++; diff--; k++; }
  while(diff<0 && guard++<1e5){
    var b=out[k%out.length]; if(b.w>minU){b.w--;diff++;} k++;
  }
  return out;
}

/* ================= сборка ================= */
function buildFree(seed,colorFn){
  var r=rng(seed),tiles=[],prev={},row,i;
  for(row=0;row<G.rows;row++){
    var a=freeRow(r,prev),cur={},x=0;
    for(i=0;i<a.length;i++){
      var u=a[i];
      tiles.push({x:x*G.mod,y:row*G.rowW,u:u,c:colorFn((x+u/2)*G.mod,r)});
      x+=u; cur[x]=1;
    }
    prev=cur;
  }
  return tiles;
}

function buildBands(seed,rel){
  var bands=scaleBands(rel,G.units,G.minU),r=rng(seed),tiles=[],row,i,k;
  for(row=0;row<G.rows;row++){
    var x=0;
    for(k=0;k<bands.length;k++){
      var seg=fill(bands[k].w,r);
      for(i=0;i<seg.length;i++){
        tiles.push({x:x*G.mod,y:row*G.rowW,u:seg[i],c:bands[k].c});
        x+=seg[i];
      }
    }
  }
  return tiles;
}

function pickW(r,w){
  var s=w[0]+w[1]+w[2]+w[3],v=r()*s;
  if(v<w[0])           return 'gray';
  if(v<w[0]+w[1])      return 'black';
  if(v<w[0]+w[1]+w[2]) return 'yellow';
  return 'red';
}

function buildRandom(seed,w,anti){
  var r=rng(seed),tiles=[],prevB={},prevC=null,row,i,k;
  for(row=0;row<G.rows;row++){
    var a=freeRow(r,prevB),cur={},colArr=new Array(G.units),x=0,leftC=null,run=0;
    for(i=0;i<a.length;i++){
      var u=a[i],c=pickW(r,w);
      if(anti){
        for(var att=0;att<8;att++){
          var bad=false;
          if(c===leftC && run>=2) bad=true;
          if(!bad && prevC && c===leftC){
            var same=0;
            for(k=x;k<x+u;k++) if(prevC[k]===c) same++;
            if(same===u) bad=true;
          }
          if(!bad) break;
          c=pickW(r,w);
        }
      }
      run=(c===leftC)?run+1:1; leftC=c;
      tiles.push({x:x*G.mod,y:row*G.rowW,u:u,c:c});
      for(k=x;k<x+u;k++) colArr[k]=c;
      x+=u; cur[x]=1;
    }
    prevB=cur; prevC=colArr;
  }
  return tiles;
}

/* ================= цветовые правила ================= */
function colorGradient(xc,r){
  var t=xc/G.LEN;
  var pY=0.100*Math.exp(-Math.pow((t-0.30)/0.17,2));
  var pR=0.105*Math.exp(-Math.pow((t-0.68)/0.17,2));
  var v=r();
  if(v<pY)    return 'yellow';
  if(v<pY+pR) return 'red';
  return (r()<0.04+0.92*Math.pow(t,1.25))?'black':'gray';
}

/* полосы заданы относительными весами — масштабируются под любой модуль */
var REL_B=[
 {r:13,c:'gray'}, {r:3,c:'black'}, {r:21,c:'gray'},  {r:2,c:'yellow'},{r:8,c:'gray'},
 {r:34,c:'black'},{r:5,c:'yellow'},{r:13,c:'black'}, {r:2,c:'red'},   {r:8,c:'gray'},
 {r:21,c:'black'},{r:3,c:'yellow'},{r:13,c:'gray'},  {r:2,c:'red'},   {r:34,c:'gray'},
 {r:5,c:'black'}, {r:8,c:'gray'},  {r:2,c:'red'},    {r:13,c:'black'},{r:8,c:'gray'}
];
var REL_C=[
 {r:21,c:'gray'},{r:1,c:'yellow'},{r:21,c:'gray'},{r:1,c:'yellow'},
 {r:13,c:'gray'},{r:2,c:'yellow'},{r:13,c:'gray'},{r:2,c:'yellow'},
 {r:13,c:'gray'},{r:3,c:'black'}, {r:8,c:'gray'}, {r:3,c:'red'},
 {r:8,c:'gray'}, {r:5,c:'black'}, {r:8,c:'gray'}, {r:5,c:'red'},
 {r:5,c:'gray'}, {r:8,c:'black'}, {r:5,c:'gray'}, {r:8,c:'black'},
 {r:3,c:'gray'}, {r:13,c:'black'},{r:3,c:'gray'}, {r:13,c:'black'},
 {r:2,c:'gray'}, {r:21,c:'black'},{r:2,c:'gray'}, {r:8,c:'black'}
];

/* ================= отрисовка ================= */
function svg(tiles,vx,vw,seed){
  var r=rng(seed+7),s=[],J=Math.max(2,G.mod*0.07);
  s.push('<svg viewBox="'+vx+' 0 '+vw+' '+G.WID+'" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">');
  s.push('<rect x="'+vx+'" y="0" width="'+vw+'" height="'+G.WID+'" fill="#2a2d33"/>');
  for(var i=0;i<tiles.length;i++){
    var t=tiles[i],w=t.u*G.mod-J;
    if(t.x+w<vx || t.x>vx+vw){r();continue;}
    var pal=SHADES[t.c];
    s.push('<rect x="'+(t.x+J/2)+'" y="'+(t.y+J/2)+'" width="'+w+'" height="'+(G.rowW-J)+
           '" fill="'+pal[(r()*pal.length)|0]+'"/>');
  }
  s.push('</svg>');
  return s.join('');
}

function tally(tiles){
  var t={units:0,n:0},i,j;
  for(i=0;i<KEYS.length;i++){t[KEYS[i]]={u:0,n:0,s:{}};}
  for(i=0;i<tiles.length;i++){
    var x=tiles[i],o=t[x.c];
    o.u+=x.u; o.n++; o.s[x.u]=(o.s[x.u]||0)+1; t.units+=x.u; t.n++;
  }
  return t;
}
function areaOf(t,k){return t[k].u*G.mod*G.rowW/1e6;}

function legendHTML(t){
  var out='';
  for(var i=0;i<KEYS.length;i++){
    var k=KEYS[i]; if(!t[k].n) continue;
    out+='<span class="legend-chip"><span class="sw" style="background:'+SHADES[k][0]+'"></span><b>'+
         NAMES[k]+'</b> '+fmt(100*t[k].u/t.units,1)+'% · '+fmt(areaOf(t,k),2)+' м² · '+t[k].n+' шт</span>';
  }
  return out;
}

function tableHTML(t){
  var sz=G.sizes.slice().reverse(),i,j;
  var out='<table class="table table-clean align-middle small"><thead><tr><th>Цвет</th>';
  for(j=0;j<sz.length;j++) out+='<th class="text-end">'+label(sz[j])+'</th>';
  out+='<th class="text-end">Всего, шт</th><th class="text-end">Площадь, м²</th><th class="text-end">Доля</th></tr></thead><tbody>';
  var sum=[]; for(j=0;j<sz.length;j++) sum[j]=0;
  for(i=0;i<KEYS.length;i++){
    var k=KEYS[i]; if(!t[k].n) continue;
    out+='<tr><td>'+NAMES[k]+'</td>';
    for(j=0;j<sz.length;j++){var v=t[k].s[sz[j]]||0; sum[j]+=v; out+='<td class="text-end">'+v+'</td>';}
    out+='<td class="text-end">'+t[k].n+'</td><td class="text-end">'+fmt(areaOf(t,k),2)+'</td><td class="text-end">'+fmt(100*t[k].u/t.units,1)+'%</td></tr>';
  }
  out+='</tbody><tfoot><tr><td>Итого</td>';
  for(j=0;j<sz.length;j++) out+='<td class="text-end">'+sum[j]+'</td>';
  out+='<td class="text-end">'+t.n+'</td><td class="text-end">'+fmt(t.units*G.mod*G.rowW/1e6,2)+'</td><td class="text-end">100%</td></tr></tfoot></table>';
  return out;
}

function render(id,tiles,seed){
  document.getElementById(id+'_full').innerHTML=svg(tiles,0,G.LEN,seed);
  document.getElementById(id+'_half').innerHTML=
     svg(tiles,0,G.LEN/2,seed)+svg(tiles,G.LEN/2,G.LEN/2,seed);
  var t=tally(tiles);
  document.getElementById(id+'_leg').innerHTML=legendHTML(t);
  document.getElementById(id+'_tab').innerHTML=tableHTML(t);
  return t;
}

function wastePct(){
  var w=+document.getElementById('wWaste').value;
  return (isFinite(w) && w>=0) ? w : 7;
}

function buyTable(all){
  var waste=wastePct(), mult=1+waste/100;
  var out='<table class="table table-clean align-middle small"><thead><tr><th>Вариант</th>';
  for(var j=0;j<KEYS.length;j++) out+='<th class="text-end">'+NAMES[KEYS[j]]+', м²</th>';
  out+='<th class="text-end">Итого, м²</th><th class="text-end">Заказ +'+fmt(waste,1)+'%, м²</th></tr></thead><tbody>';
  for(var i=0;i<all.length;i++){
    var t=all[i].t,tot=t.units*G.mod*G.rowW/1e6;
    out+='<tr><td>'+all[i].name+'</td>';
    for(j=0;j<KEYS.length;j++) out+='<td class="text-end">'+fmt(areaOf(t,KEYS[j]),2)+'</td>';
    out+='<td class="text-end">'+fmt(tot,2)+'</td><td class="text-end"><b>'+fmt(Math.ceil(tot*mult*10)/10,1)+'</b></td></tr>';
  }
  return out+'</tbody></table>';
}

/* ================= вес цвета: сумма-бейдж + нормализация ================= */
function readW(){
  var g=+document.getElementById('wG').value||0,b=+document.getElementById('wB').value||0,
      y=+document.getElementById('wY').value||0,d=+document.getElementById('wR').value||0;
  if(g+b+y+d<=0){g=62;b=24;y=8;d=6;}
  return [g,b,y,d];
}
function updateSumBadge(){
  var w=readW(), sum=w[0]+w[1]+w[2]+w[3];
  var el=document.getElementById('wSum');
  el.textContent=fmt(sum,0)+'%';
  el.className='badge sum-badge '+(Math.abs(sum-100)<0.5?'text-bg-success':'text-bg-danger');
}
function normalizeW(){
  var w=readW(), sum=w[0]+w[1]+w[2]+w[3];
  if(sum<=0){ preset(62,24,8,6); return; }
  var k=100/sum;
  document.getElementById('wG').value=Math.round(w[0]*k);
  document.getElementById('wB').value=Math.round(w[1]*k);
  document.getElementById('wY').value=Math.round(w[2]*k);
  document.getElementById('wR').value=Math.round(w[3]*k);
  draw();
}
function preset(g,b,y,d){
  document.getElementById('wG').value=g; document.getElementById('wB').value=b;
  document.getElementById('wY').value=y; document.getElementById('wR').value=d; draw();
}
function setP(rowW,sizes){
  document.getElementById('pRow').value=rowW;
  document.getElementById('pSizes').value=sizes; draw();
}
window.preset=preset;
window.setP=setP;
window.normalizeW=normalizeW;

var seedA=20260806,seedD=777001;
function reroll(){seedA=(Math.random()*1e9)|0;draw();}
function rerollD(){seedD=(Math.random()*1e9)|0;draw();}
window.reroll=reroll;
window.rerollD=rerollD;

function draw(){
  recalc();
  updateSumBadge();
  document.getElementById('sub').textContent=
    'Отмостка '+fmt(G.len/1000,2)+' × '+fmt(G.wid/1000,2)+' м · комплект '+
    G.raw.map(function(v){return v+'×'+G.rowW;}).join(' / ')+' · модуль '+G.mod+' мм';
  document.getElementById('grid').innerHTML=gridHTML();

  var tA=render('A',buildFree(seedA,colorGradient),seedA);
  var tB=render('B',buildBands(4242,REL_B),4242);
  var tC=render('C',buildBands(1337,REL_C),1337);
  var tD=render('D',buildRandom(seedD,readW(),document.getElementById('wAC').checked),seedD);

  document.getElementById('buy').innerHTML=buyTable([
    {name:'1 — «Пепел», дизеринг-градиент',t:tA},
    {name:'2 — «Штрихкод», ритм-код',t:tB},
    {name:'3 — «Растр», гибрид',t:tC},
    {name:'4 — «Хаос», управляемый рандом',t:tD}
  ]);
}

['pLen','pWid','pRow','pSizes','pJoint','wG','wB','wY','wR','wAC','wWaste'].forEach(function(id){
  var el=document.getElementById(id);
  el.addEventListener('change',draw);
  if(el.tagName==='INPUT'&&el.type!=='checkbox') el.addEventListener('input',function(){
    clearTimeout(window._t); window._t=setTimeout(draw,400);
  });
});
draw();
})();
</script>
<?php
require __DIR__ . '/app/views/_foot.php';
