<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#FAF9F5">
<title>Within — личный ИИ-собеседник</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root{
  --page:#EDE9E1; --bg:#FAF9F5; --card:#fff;
  --ink:#3A3A3C; --ink2:#6E6E70; --ink3:#8A8A8E; --ink4:#A2A29F; --ink5:#C4C2BD;
  --blue:#5F7D8F; --blue-d:#4A6675; --blue-t:#EAF0F3; --blue-t2:#E4EAEE;
  --lav:#8E7FA8; --lav2:#7A6E96; --lav-t:#F1ECF4; --lav-t2:#EFEAF3;
  --green:#A6BFA4; --green-d:#5E7D5C; --green-t:#EDF2EB; --green-t2:#DCE8DA;
  --beige:#F3EDE3; --beige2:#F6F4EF; --beige3:#F0EBE4;
  --line:rgba(58,58,60,.08); --line2:rgba(58,58,60,.06); --line3:rgba(58,58,60,.05);
  --danger:#8C6058; --danger2:#A9645A; --danger3:#C08A80;
  --sat:env(safe-area-inset-top); --sab:env(safe-area-inset-bottom);
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;height:100%}
body{
  background:var(--page);
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,sans-serif;
  color:var(--ink);-webkit-font-smoothing:antialiased;
  overflow:hidden;
}
button{font:inherit;color:inherit;border:0;background:none;margin:0;padding:0;cursor:pointer}
a{color:var(--blue);text-decoration:none}

/* ---------- animations ---------- */
@keyframes om-breathe{0%,100%{transform:scale(.72);opacity:.45}50%{transform:scale(1.12);opacity:.85}}
@keyframes om-dot{0%,100%{opacity:.25;transform:translateY(0)}50%{opacity:.8;transform:translateY(-2px)}}
@keyframes om-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes om-wave{0%,100%{transform:scaleY(.28)}50%{transform:scaleY(1)}}
@keyframes om-aura{0%,100%{transform:scale(.9);opacity:.4}50%{transform:scale(1.12);opacity:.72}}
@keyframes om-slide{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
@keyframes om-fade{from{opacity:0}to{opacity:1}}
@keyframes om-sheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes om-scrim{from{opacity:0}to{opacity:1}}
@keyframes om-pop{from{opacity:0;transform:scale(.96) translateY(6px)}to{opacity:1;transform:none}}
.rm *{animation:none!important;transition:none!important}

/* ---------- shell ---------- */
#app{
  position:relative;width:100%;max-width:440px;margin:0 auto;
  height:100vh;height:100dvh;background:var(--bg);
  display:flex;flex-direction:column;overflow:hidden;
}
@media(min-width:480px){
  body{display:flex;align-items:center;justify-content:center;padding:22px}
  #app{height:min(880px,94dvh);border-radius:34px;box-shadow:0 24px 70px rgba(58,58,60,.22),0 4px 16px rgba(58,58,60,.08);border:1px solid rgba(58,58,60,.06)}
}
.layer{position:absolute;inset:0;background:var(--bg);display:flex;flex-direction:column;overflow:hidden;z-index:10}
.layer.anim{animation:om-slide .34s cubic-bezier(.22,.8,.28,1)}
.col{display:flex;flex-direction:column}
.scroll{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch}
.scroll::-webkit-scrollbar{width:0}
.scroll>*{flex-shrink:0}
.pad-top{padding-top:calc(var(--sat))}

/* ---------- typography ---------- */
.h1{font-size:24px;font-weight:600;line-height:1.2;letter-spacing:-.01em}
.h2{font-size:20px;font-weight:600;line-height:1.25}
.big{font-size:28px;font-weight:600;line-height:1.2;letter-spacing:-.01em}
.sub{font-size:15px;color:var(--ink3);line-height:1.5}
.muted{color:var(--ink3)}
.tiny{font-size:13px;color:var(--ink4)}
.eyebrow{font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:var(--ink4)}

/* ---------- buttons ---------- */
.btn{min-height:52px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:16px;font-size:17px;font-weight:600;width:100%;transition:transform .12s,filter .12s;padding:0 18px;text-align:center}
.btn:active{transform:scale(.98)}
.btn-primary{background:var(--blue);color:#fff}
.btn-primary:active{filter:brightness(.95)}
.btn-soft{background:var(--beige);color:var(--ink);font-weight:500;font-size:16px}
.btn-soft2{background:var(--beige3);color:var(--ink);font-weight:500}
.btn-danger{background:var(--danger);color:#fff}
.btn-danger2{background:var(--danger2);color:#fff}
.btn-link{min-height:44px;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--blue)}
.card{background:var(--card);border-radius:22px;border:1px solid var(--line2)}
.grouped{background:var(--card);border-radius:20px;border:1px solid var(--line2);overflow:hidden}
.grouped .row{min-height:56px;display:flex;align-items:center;gap:12px;padding:0 16px;border-bottom:1px solid var(--line3)}
.grouped .row:last-child{border-bottom:0}
.chevron{color:var(--ink5);flex:none}
.pill{min-height:36px;display:inline-flex;align-items:center;padding:0 13px;border-radius:12px;font-size:14px;white-space:nowrap;transition:transform .1s}
.pill:active{transform:scale(.96)}
.pill-on{background:var(--blue);color:#fff}
.pill-off{background:var(--card);border:1px solid rgba(58,58,60,.1)}
.tag{font-size:12px;padding:4px 9px;border-radius:9px;background:var(--beige);color:var(--ink2)}

/* header */
.topbar{flex:none;display:flex;align-items:center;gap:12px;padding:calc(var(--sat) + 16px) 20px 10px}
.topbar .ttl{font-size:17px;font-weight:600;flex:1;min-width:0}
.iconbtn{width:34px;height:34px;display:flex;align-items:center;justify-content:center;margin:-6px;border-radius:50%;flex:none}
.iconbtn:active{background:rgba(58,58,60,.06)}

/* tabbar */
.tabbar{flex:none;display:grid;grid-template-columns:repeat(4,1fr);padding:9px 4px calc(14px + var(--sab));border-top:1px solid var(--line);background:rgba(250,249,245,.94);backdrop-filter:blur(8px)}
.tabbar .t{display:flex;flex-direction:column;align-items:center;gap:4px;min-height:44px;justify-content:center;color:var(--ink4)}
.tabbar .t.on{color:var(--blue)}
.tabbar .t span{font-size:11px;font-weight:400}
.tabbar .t.on span{font-weight:600}
.tabbar .t:active{opacity:.6}

/* mood cells */
.moodq{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:9px 0;border-radius:16px;min-height:64px;border:1.5px solid transparent;transition:transform .1s}
.moodq:active{transform:scale(.95)}
.moodq span{font-size:10px;line-height:1.15;text-align:center;color:var(--ink2);max-width:46px}

.inp{min-height:48px;display:flex;align-items:center;padding:0 16px;border-radius:15px;background:var(--beige2);border:1px solid rgba(58,58,60,.07);font-size:16px;color:var(--ink3)}
.field{min-height:56px;border-radius:16px;background:var(--card);border:1px solid rgba(58,58,60,.1);padding:13px 15px;font-size:16px;line-height:1.5;width:100%;resize:none;color:var(--ink);font-family:inherit}
.field::placeholder{color:var(--ink4)}
.field:focus{outline:none;border-color:#9FB6C4}

.toast{position:fixed;left:50%;bottom:calc(96px + var(--sab));transform:translateX(-50%) translateY(16px);background:#3A3A3C;color:#fff;font-size:14px;padding:11px 18px;border-radius:14px;opacity:0;pointer-events:none;transition:.28s;z-index:200;max-width:82%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,.2)}
.toast.show{opacity:1;transform:translateX(-50%)}

.scrim{position:absolute;inset:0;background:rgba(58,58,60,.35);z-index:40;animation:om-scrim .25s ease}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--bg);border-radius:28px 28px 0 0;padding:22px 22px calc(28px + var(--sab));display:flex;flex-direction:column;gap:16px;z-index:41;animation:om-sheet .34s cubic-bezier(.22,.8,.28,1)}
.grip{align-self:center;width:38px;height:4px;border-radius:2px;background:rgba(58,58,60,.16)}

/* chat */
.bubble{max-width:82%;padding:13px 15px;font-size:16px;line-height:1.5;border-radius:20px}
.b-ai{align-self:flex-start;background:var(--card);border:1px solid var(--line2);border-radius:20px 20px 20px 6px}
.b-me{align-self:flex-end;background:var(--blue-t2);border-radius:20px 20px 6px 20px}
.chat-scroll{flex:1;min-height:0;overflow-y:auto;padding:16px 16px 6px;display:flex;flex-direction:column;gap:12px}
.daychip{align-self:center;font-size:12px;color:var(--ink4);background:var(--beige);padding:4px 12px;border-radius:10px}
.send{width:48px;height:48px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;flex:none;transition:transform .12s}
.send:active{transform:scale(.92)}
.fbchip{min-height:32px;display:flex;align-items:center;padding:0 11px;border-radius:11px;border:1px solid rgba(58,58,60,.12);font-size:13px;color:var(--ink2)}
.qchip{min-height:34px;flex:none;display:flex;align-items:center;padding:0 12px;border-radius:12px;background:var(--beige);font-size:13px;white-space:nowrap}
.qchip:active{background:#e9e2d5}

.fab{position:absolute;right:18px;bottom:calc(96px + var(--sab));width:56px;height:56px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(95,125,143,.35);z-index:15}
.fab:active{transform:scale(.94)}

.seg{display:flex;gap:6px;background:var(--beige);padding:4px;border-radius:15px}
.seg button{flex:1;min-height:38px;border-radius:12px;font-size:14px;font-weight:600;color:var(--ink3)}
.seg button.on{background:#fff;color:var(--ink);box-shadow:0 1px 3px rgba(58,58,60,.08)}

/* paywall / plus */
.plan{position:relative;display:flex;align-items:center;gap:12px;padding:15px 16px;border-radius:20px;background:#fff;border:1.5px solid var(--line);text-align:left;width:100%;transition:transform .1s}
.plan:active{transform:scale(.99)}
.plan.on{border-color:var(--blue);background:#fff}
.plan .radio{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(58,58,60,.22);display:flex;align-items:center;justify-content:center;flex:none}
.plan.on .radio{border-color:var(--blue)}
.plan.on .radio>div{width:11px;height:11px;border-radius:50%;background:var(--blue)}
.plan .badge{position:absolute;top:-9px;right:14px;font-size:11px;font-weight:600;letter-spacing:.02em;color:#fff;background:var(--blue);padding:3px 9px;border-radius:8px}
.plan .badge.save{background:#5E7D5C}
.lock{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:#8A7440;background:#F5F0E4;padding:4px 9px;border-radius:9px}
.plusrow{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,#EFE9F4,#EAF0F3);border:1px solid var(--line2)}
.plusbadge{font-size:11px;font-weight:700;letter-spacing:.04em;color:#fff;background:var(--lav);padding:3px 8px;border-radius:7px}
</style>
</head>
<body>
<div id="app"></div>
<div class="toast" id="toast"></div>

<script>
"use strict";
const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

/* ============================ config ============================ */
// Leave API_URL empty to run standalone (built-in scripted replies for Лея).
// Set it to your deployed backend origin (within-bot.js) to enable the real
// AI companion powered by the Claude API. Example: "https://within.example.com".
const CONFIG = { API_URL: "" };

/* ============================ data ============================ */
const MOODS = [
  ['очень тяжело','M4 19 C8 8, 16 8, 20 19','#8E7FA8'],
  ['тревожно','M4 14 L8 10 L12 15 L16 9 L20 13','#9FB6C4'],
  ['грустно','M4 16 C8 11, 16 11, 20 16','#9FB6C4'],
  ['спокойно','M4 13 H20','#A6BFA4'],
  ['хорошо','M4 11 C8 16, 16 16, 20 11','#A6BFA4'],
  ['отлично','M4 10 C8 18, 16 18, 20 10','#C4A96A'],
];
const GOALS = ['снизить тревогу','справиться со стрессом','понять свои эмоции','улучшить отношения','повысить уверенность в себе','просто выговориться'];
const STYLES = [
  ['Мягкий и поддерживающий','Больше тепла, меньше советов. Лея сначала выслушает.'],
  ['Спокойный и нейтральный','Ровный тон без лишних эмоций и оценок.'],
  ['Прямой и структурированный','Чёткие вопросы, шаги и короткие выводы.'],
];
const FORMATS = [
  ['Выговориться','Лея больше слушает и задаёт мягкие вопросы, не спешит с советами.','#F1ECF4','#8E7FA8','M11 11h12M11 16h8'],
  ['Разобраться в ситуации','Разложить произошедшее на факты, эмоции и возможные шаги.','#EAF0F3','#5F7D8F','M11 22V12M17 22V9M23 22v-6'],
  ['Снизить тревогу','Дыхание, заземление и другие короткие техники успокоения.','#EDF2EB','#5E7D5C','M9 20c5 0 6-8 8-8s3 8 8 8'],
  ['Принять решение','Сравнить варианты, страхи, риски и то, что для вас важно.','#F5F0E4','#8A7440','M17 9v16M11 15l6-6 6 6'],
  ['Подвести итоги дня','Короткая вечерняя рефлексия на пять минут.','#EFEAF3','#7A6E96','M23 19a6 6 0 11-7-8 5 5 0 007 8z'],
];
const PRACTICES = [
  ['Дыхание по квадрату','Четыре равных счёта: вдох, пауза, выдох, пауза','2 мин','просто','#EDF2EB','#5E7D5C','M13 13h18v18H13z'],
  ['Техника 5–4–3–2–1','Вернуться в настоящее через органы чувств','4 мин','просто','#EAF0F3','#4A6675','M14 30l4-16 4 10 4-6 4 12'],
  ['Сканирование тела','Пройти вниманием от макушки до стоп','7 мин','средне','#F1ECF4','#7A6E96','M22 12v20M15 19h14M17 30l5-5 5 5'],
  ['Дневник автоматических мыслей','Записать мысль и посмотреть на неё со стороны','6 мин','средне','#F5F0E4','#8A7440','M15 13h14v18H15zM19 19h6M19 24h8'],
  ['Что под моим контролем','Разделить то, на что вы влияете, и остальное','5 мин','просто','#EAF0F3','#4A6675','M22 12a10 10 0 100 20 10 10 0 000-20zM22 18v8'],
  ['Подготовка ко сну','Замедлиться и отпустить день','9 мин','просто','#EFEAF3','#7A6E96','M30 26a8 8 0 11-9-11 7 7 0 009 11z'],
];
const BREATH = [
  ['Вдох','Медленный вдох на четыре счёта','Считайте про себя: раз, два, три, четыре. Если сбились — просто начните заново, это нормально.'],
  ['Задержка','Мягкая пауза на четыре счёта','Не напрягайтесь. Просто дайте воздуху остаться внутри — раз, два, три, четыре.'],
  ['Выдох','Спокойный выдох на четыре счёта','Отпускайте воздух плавно, без усилия. С выдохом тело понемногу расслабляется.'],
  ['Пауза','Тишина на четыре счёта','Останьтесь в этой тишине. Скоро начнём новый круг — вы можете завершить в любой момент.'],
];
// Гайды практик по индексу PRACTICES. type: 'breath' (анимация дыхания) | 'guided' (спокойный круг) | 'reflect' (шаги с полем ввода).
const PRACTICE_STEPS = {
  1: { type:'guided', tint:'#EAF0F3', ink:'#4A6675', steps:[
    ['5 вещей, которые видите','Оглянитесь вокруг и медленно назовите про себя пять вещей, которые видите прямо сейчас.'],
    ['4 звука вокруг','Прислушайтесь. Найдите четыре звука — близкие и далёкие. Просто отметьте их.'],
    ['3 ощущения в теле','Почувствуйте три прикосновения: одежда на коже, стул, пол под ногами.'],
    ['2 запаха','Сделайте медленный вдох носом. Уловите два запаха, даже едва заметных.'],
    ['1 вкус','Обратите внимание на вкус во рту. Всего один. Вы снова здесь, в настоящем.'],
  ]},
  2: { type:'guided', tint:'#F1ECF4', ink:'#7A6E96', steps:[
    ['Устройтесь удобно','Сядьте или лягте так, чтобы телу было спокойно. Глаза можно мягко прикрыть.'],
    ['Макушка и лицо','Перенесите внимание на макушку и лицо. Заметьте напряжение — и мягко отпустите его.'],
    ['Плечи и руки','Опустите плечи. Пройдите вниманием по рукам до самых кончиков пальцев.'],
    ['Грудь и живот','Почувствуйте, как дыхание поднимает и опускает грудь и живот. Ничего не меняйте.'],
    ['Ноги и стопы','Проведите вниманием по ногам до стоп. Почувствуйте опору под собой.'],
    ['Всё тело целиком','Ощутите тело целиком — спокойное и тяжёлое. Побудьте здесь ещё пару вдохов.'],
  ]},
  3: { type:'reflect', tint:'#F5F0E4', ink:'#8A7440', steps:[
    ['Что случилось','Коротко опишите ситуацию, которая вызвала сильную эмоцию.','Например: разговор на планёрке…'],
    ['Какая мысль появилась','Запишите первую автоматическую мысль. Что пронеслось в голове?','«Я не справляюсь»…'],
    ['Что говорит против','Какие факты не поддерживают эту мысль? Что бы вы сказали другу в такой ситуации?','Можно по пунктам…'],
    ['Более взвешенная мысль','Сформулируйте мысль спокойнее и точнее. Как она ощущается теперь?','Более мягкая версия…'],
  ]},
  4: { type:'reflect', tint:'#EAF0F3', ink:'#4A6675', steps:[
    ['На что я влияю','Назовите то, что действительно в ваших руках в этой ситуации.','Мои действия, слова, выбор…'],
    ['На что не влияю','А теперь — то, что вам неподвластно. Это можно отпустить.','Реакции других, прошлое…'],
    ['Один маленький шаг','Выберите один шаг из того, на что вы влияете. Самый маленький.','Что сделаю сегодня…'],
  ]},
  5: { type:'guided', tint:'#EFEAF3', ink:'#7A6E96', steps:[
    ['Приглушите свет','Сделайте пространство темнее и тише. Уберите телефон подальше от кровати.'],
    ['Отпустите день','Мысленно поблагодарите этот день и разрешите себе больше ничего не решать.'],
    ['Медленное дыхание','Дышите чуть медленнее обычного. Пусть выдох будет длиннее вдоха.'],
    ['Расслабьте тело','Опустите плечи, разожмите челюсть, отпустите ноги. Тело тяжелеет.'],
    ['Тихие мысли','Если мысли приходят — просто отмечайте их и отпускайте. Вы уже отдыхаете.'],
  ]},
};
function practiceSteps(id){
  if(id===0) return { type:'breath', steps: BREATH.map(b=>[b[1],b[2],b[0]]) }; // [title, text, phaseWord]
  return PRACTICE_STEPS[id] || PRACTICE_STEPS[1];
}

const ANSWER = 'Похоже, этот разговор задел что-то важное для вас.\n\nВы возвращаетесь к нему мыслями — часто так бывает, когда осталось что-то несказанное.\n\nЧто из сказанного руководителем задело сильнее всего?';
const REPLIES = [
  'Спасибо, что поделились этим. Похоже, сейчас внутри много всего — давайте попробуем распутать это по одной ниточке. Что чувствуется сильнее всего прямо сейчас?',
  'Я вас слышу. Это правда непросто. Если попробовать назвать эмоцию одним словом — какое слово подошло бы?',
  'Звучит так, будто вам пришлось держать это в себе какое-то время. Что было бы для вас маленьким шагом к облегчению сегодня?',
  'Понимаю. Иногда важно просто проговорить, не решая ничего сразу. Хотите остаться с этим чувством или посмотреть, откуда оно растёт?',
];
const CRISIS_WORDS = ['не хочу жить','жить не хочется','покончить','покончить с собой','суицид','убить себя','свести счёты','наложить на себя руки','не вижу смысла','смысла жить','лучше бы меня не было','причинить себе','себе навред','умереть'];
// Кризисные контакты (Россия). Замените на локальные при запуске в другом регионе.
const CRISIS_CONTACTS = [
  ['Экстренные службы','Единый номер, круглосуточно','112','112'],
  ['Телефон доверия','Бесплатно, анонимно, круглосуточно','8 800 2000-122','88002000122'],
  ['Психологическая помощь МЧС','Круглосуточно','+7 495 989-50-50','+74959895050'],
];

/* ============================ subscription (Within Plus) ============================ */
const FREE_LIMIT = 5;                     // бесплатных сообщений Лее в день
const PLANS = [
  { id:'plan_week',  stars:149,  days:7,   label:'Неделя', per:'149 ⭐ в неделю',          badge:'',           sub:false },
  { id:'plan_month', stars:399,  days:30,  label:'Месяц',  per:'автопродление · ≈ 92 ⭐/нед', badge:'Популярный', sub:true  },
  { id:'plan_year',  stars:2490, days:365, label:'Год',    per:'≈ 48 ⭐ в неделю',          badge:'−48%',       sub:false },
];
const PLUS_FEATURES = [
  ['Безлимитные разговоры с Леей','M4 11 C8 16, 16 16, 20 11'],
  ['Голосовые разговоры','M6.5 4h3l1.5 4-2 1.5a10 10 0 005.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.7 1.5C11.6 18.3 5.7 12.4 5 6.2A1.5 1.5 0 016.5 4z'],
  ['Все практики и техники','M4 12l5 5L20 6'],
  ['Тренды и наблюдения за всё время','M4 16c5 0 6-8 8-8s3 8 8 8'],
  ['Более глубокие, вдумчивые ответы','M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4l3 2'],
  ['Экспорт дневника в CSV','M12 4v10M8 10l4 4 4-4M5 20h14'],
];
const PAYWALL_COPY = {
  messages:  ['Продолжайте разговор без ограничений', 'Бесплатно — 5 сообщений в день. С Within Plus Лея всегда на связи, столько, сколько нужно.'],
  voice:     ['Поговорите с Леей голосом', 'Голосовые разговоры доступны во Within Plus — вместе с безлимитным чатом и практиками.'],
  practices: ['Откройте все практики', 'Дыхание по квадрату бесплатно. Остальные техники — сканирование тела, работа с мыслями, подготовка ко сну — во Within Plus.'],
  insights:  ['Смотрите тренды за всё время', 'Наблюдения за неделю бесплатны. Динамика настроения за весь период и глубокие выводы — во Within Plus.'],
  export:    ['Заберите свои записи', 'Экспорт дневника в CSV доступен во Within Plus.'],
  '':        ['Within Plus', 'Больше пространства для себя: безлимитные разговоры, голос, все практики и наблюдения.'],
};

/* ============================ state ============================ */
const LS='within.v1';
const DEFAULT = {
  onboarded:false,
  mood:3, goals:[0,2], style:0, intensity:7,
  rm: (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || false,
  toggles:[true,true,false], freq:0, remHour:21,
  historyOff:false,
  plus:false, plusUntil:0, sub:false, msgDay:'', msgCount:0,
  moodLog:null, practicesDone:5, dialogs:4,
  entries:[
    {mood:1, when:'сегодня, 21:40', short:'21:40', text:'Разговор с руководителем на планёрке. Долго не мог переключиться.', tag:'работа', intensity:7, thoughts:'«Я недостаточно хорош», «меня не воспринимают серьёзно».', support:'Прогулка и спокойный разговор с кем-то близким.'},
    {mood:3, when:'2 авг', short:'2 авг', text:'Прогулка после работы. К вечеру стало легче.', tag:'восстановление', intensity:3, thoughts:'', support:''},
  ],
};
let S = load();
function load(){ let s; try{ const r=JSON.parse(localStorage.getItem(LS)); s = r ? Object.assign(JSON.parse(JSON.stringify(DEFAULT)), r) : JSON.parse(JSON.stringify(DEFAULT)); }catch(e){ s=JSON.parse(JSON.stringify(DEFAULT)); }
  if(s.moodLog==null) s.moodLog = seedMoodLog();   // сид только для новых; после удаления остаётся []
  return s; }
function save(){ try{ const {onboarded,mood,goals,style,intensity,rm,toggles,freq,remHour,historyOff,entries,plus,plusUntil,sub,msgDay,msgCount,moodLog,practicesDone,dialogs}=S; localStorage.setItem(LS, JSON.stringify({onboarded,mood,goals,style,intensity,rm,toggles,freq,remHour,historyOff,entries,plus,plusUntil,sub,msgDay,msgCount,moodLog,practicesDone,dialogs})); }catch(e){} }

/* ---- date & mood-log helpers (data-driven diary/observations) ---- */
const MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
function ymd(dt){ const z=n=>String(n).padStart(2,'0'); return dt.getFullYear()+'-'+z(dt.getMonth()+1)+'-'+z(dt.getDate()); }
function pluralRu(n,one,few,many){ const m10=n%10,m100=n%100; if(m10===1&&m100!==11)return one; if(m10>=2&&m10<=4&&(m100<10||m100>=20))return few; return many; }
function seedMoodLog(){ const out=[]; const base=new Date(); const daysAgo=[13,12,10,9,7,6,4,3,2,1,0]; const pat=[3,4,2,3,1,3,4,5,3,2,4]; daysAgo.forEach((da,i)=>{ const dt=new Date(base); dt.setDate(dt.getDate()-da); out.push({d:ymd(dt), m:pat[i]}); }); return out; }
function logMood(m){ if(typeof m!=='number') return; const d=ymd(new Date()); S.moodLog=(S.moodLog||[]).filter(x=>x.d!==d); S.moodLog.push({d,m}); if(S.moodLog.length>500) S.moodLog=S.moodLog.slice(-500); save(); }

// имя пользователя из Telegram (в демо остаётся «Алексей»)
let USERNAME = 'Алексей';
try{ const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; if(u && u.first_name) USERNAME = u.first_name; }catch(e){}

// ephemeral / session
let V = { tab:0, stack:[], modal:null, diaryView:'entries', point:4,
  chat:null, call:null, pracId:0, pracStep:0, pracNotes:{}, obSlide:0, obGoals:[0,2], obStyle:0,
  netOffline:false, entryDraft:null };

/* ============================ helpers ============================ */
const $ = s=>document.querySelector(s);
const app = $('#app');
function h(strings,...v){ return strings.map((s,i)=>s+(v[i]==null?'':v[i])).join(''); }
function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function haptic(t){ try{ if(!tg||!tg.HapticFeedback)return; if(t==='sel')tg.HapticFeedback.selectionChanged(); else tg.HapticFeedback.impactOccurred(t||'light'); }catch(e){} }
function notif(t){ try{ tg&&tg.HapticFeedback&&tg.HapticFeedback.notificationOccurred(t); }catch(e){} }
let toastT;
function toast(msg){ const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('show'),1900); }
function rm(){ return S.rm; }

function svg(path, attrs){
  attrs=attrs||{};
  const size=attrs.size||24, vb=attrs.vb||'0 0 24 24', st=attrs.stroke||'currentColor', sw=attrs.sw||1.7;
  const op=attrs.op!=null?` opacity="${attrs.op}"`:'';
  return `<svg width="${size}" height="${size}" viewBox="${vb}" fill="none" stroke="${st}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op}><path d="${path}"></path></svg>`;
}
const IC = {
  back:'M15 5l-7 7 7 7', plus:'M12 5v14M5 12h14', dots:'M6 12h.01M12 12h.01M18 12h.01',
  search:'', chevR:'M9 5l7 7-7 7', check:'M4 12l5 5L20 6', send:'M12 19V5M6 11l6-6 6 6',
  mic:'M6 12a6 6 0 0012 0M12 18v2.5', pause:'M9 5v14M15 5v14', subtitles:'M4 6h16M4 12h11M4 18h8',
  chatIcon:'M4.5 6h15v9.5H11l-4.5 3.5v-3.5h-2Z',
  phone:'M6.5 4h3l1.5 4-2 1.5a10 10 0 005.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.7 1.5C11.6 18.3 5.7 12.4 5 6.2A1.5 1.5 0 016.5 4z',
};
function moodShape(i, opts){
  opts=opts||{}; const m=MOODS[i]||MOODS[3]; const size=opts.size||26; const stroke=opts.stroke||m[2];
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${opts.sw||1.8}" stroke-linecap="round"><path d="${m[1]}"></path></svg>`;
}
// avatar wave (Лея)
function avatar(size, stroke){
  stroke=stroke||'#8E7FA8'; const s=size;
  return `<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="20" fill="#F1ECF4"></circle><path d="M8 24c6 0 8-9 12-9s6 9 12 9" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"></path><path d="M8 29c6 0 8-6 12-6s6 6 12 6" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round" opacity=".45"></path></svg>`;
}
function anim(name, def){ return rm()?'none':def; }

/* ============================ subscription helpers ============================ */
function isPlus(){ return !!S.plus && (S.plusUntil||0) > Date.now(); }
function touchMsgDay(){ const d=new Date().toISOString().slice(0,10); if(S.msgDay!==d){ S.msgDay=d; S.msgCount=0; save(); } }
function remainingFree(){ touchMsgDay(); return Math.max(0, FREE_LIMIT - S.msgCount); }
function applyEnt(e){ if(!e) return; S.plus=!!e.plus; S.plusUntil=e.until||0; S.sub=!!(e.plus&&e.sub); if(!e.plus && typeof e.count==='number'){ S.msgDay=new Date().toISOString().slice(0,10); S.msgCount=e.count; } save(); }
function fetchEntitlement(){
  if(!CONFIG.API_URL) return Promise.resolve();
  return fetch(CONFIG.API_URL.replace(/\/$/,'')+'/api/entitlement',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ initData: tg?tg.initData:'' })
  }).then(r=>r.json()).then(applyEnt).catch(()=>{});
}
function plusUntilLabel(){
  if(!isPlus()) return '';
  const d=new Date(S.plusUntil);
  return d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}).replace(/\s*г\.?$/,'');
}
function openPaywall(reason){ if(isPlus()){ push('paywall',{reason:'manage'}); return; } push('paywall',{reason:reason||''}); }
function planById(id){ return PLANS.find(p=>p.id===id)||PLANS[1]; }
function buyPlus(){
  const plan=planById(V.plan||'plan_month');
  if(CONFIG.API_URL && tg && tg.openInvoice){
    toast('Открываю оплату…');
    fetch(CONFIG.API_URL.replace(/\/$/,'')+'/api/invoice',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ initData: tg.initData, plan: plan.id })
    }).then(r=>r.json()).then(j=>{
      if(!j.link){ toast('Оплата недоступна, попробуйте позже'); return; }
      tg.openInvoice(j.link, status=>{
        if(status==='paid'){ notif('success'); fetchEntitlement().then(()=>{ V.stack=[]; V.tab=0; render(); toast('Within Plus активирован ✨'); }); }
        else if(status==='failed') toast('Оплата не прошла');
      });
    }).catch(()=>toast('Не удалось начать оплату'));
    return;
  }
  // Демо/standalone: без бэкенда имитируем успешную покупку, чтобы был виден результат.
  S.plus=true; S.plusUntil=Date.now()+plan.days*86400000; S.sub=!!plan.sub; save();
  notif('success'); pop(); toast('Демо: Within Plus активирован ✨');
}
function cancelSub(){
  if(CONFIG.API_URL){
    fetch(CONFIG.API_URL.replace(/\/$/,'')+'/api/cancel-sub',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ initData: tg?tg.initData:'' })
    }).then(r=>r.json()).then(e=>{ applyEnt(e); render(); toast('Автопродление отключено. Доступ — до конца оплаченного срока.'); }).catch(()=>toast('Не удалось отменить, попробуйте позже'));
    return;
  }
  S.sub=false; save(); render(); toast('Автопродление отключено (демо).');
}
function csvCell(s){ s=(s==null?'':String(s)).replace(/"/g,'""'); return '"'+s+'"'; }
function exportDiary(){
  if(!S.entries.length){ toast('В дневнике пока нет записей'); return; }
  const rows=[['Дата','Настроение','Интенсивность','Что произошло','Мысли','Что поддержало бы','Тег']];
  S.entries.forEach(e=>rows.push([e.when||e.short||'', (MOODS[e.mood]?MOODS[e.mood][0]:''), e.intensity||'', e.text||'', e.thoughts||'', e.support||'', e.tag||'']));
  const csv='﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
  try{
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='within-dnevnik.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
    haptic('light'); notif('success'); toast('Дневник экспортирован в CSV');
  }catch(err){ toast('Экспорт недоступен в этой среде'); }
}
function saveReminders(){
  save();
  if(CONFIG.API_URL){
    let tz='UTC'; try{ tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'; }catch(e){}
    fetch(CONFIG.API_URL.replace(/\/$/,'')+'/api/reminders',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ initData: tg?tg.initData:'', toggles:S.toggles, freq:S.freq, hour:S.remHour, tz })
    }).catch(()=>{});
  }
  pop(); notif('success');
  toast(S.freq===2?'Напоминания выключены':'Напоминания сохранены на '+String(S.remHour||21).padStart(2,'0')+':00');
}
function saveThought(kind){
  const msgs = V.chat ? V.chat.msgs.filter(m=>m.who===kind && m.text && m.text.trim()) : [];
  const text = (msgs.slice(-1)[0]||{}).text;
  if(!text){ toast('Пока нечего сохранять'); return; }
  addEntry({mood:(typeof S.mood==='number'?S.mood:3), when:'сегодня · из разговора', short:'сегодня', text:text.trim(), tag:'из разговора', intensity:0, thoughts:'', support:''});
  haptic('light'); notif('success'); toast('Сохранено в дневник');
}
function freeBannerHTML(){
  if(isPlus()) return '';
  return `<div id="freeBanner" style="flex:none;padding:6px 14px 0"><div style="background:var(--beige);border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:8px;justify-content:center;font-size:13px;color:var(--ink2)"><span>Сегодня осталось <span id="freeN">${remainingFree()}</span> из ${FREE_LIMIT} сообщений</span><button data-a="paywall" data-r="messages" style="color:var(--blue);font-weight:600;white-space:nowrap">Within Plus</button></div></div>`;
}
function patchFreeBanner(){ const el=$('#freeBanner'); if(!el) return; if(isPlus()){ el.style.display='none'; return; } const s=$('#freeN'); if(s) s.textContent=remainingFree(); }

/* ============================ mood row component ============================ */
function moodRow(variant){
  // variant: 'home' (icon+label), 'list' (row+check), 'icons' (bg light), 'icons2' (bg2)
  if(variant==='list'){
    return MOODS.map((m,i)=>{
      const on=i===S.mood;
      return `<button class="moodq" data-a="mood" data-i="${i}" style="min-height:64px;flex-direction:row;justify-content:flex-start;gap:14px;padding:0 16px;border-radius:20px;background:${on?'#fff':'#FDFCFA'};border-color:${on?'var(--blue)':'var(--line)'}">
        ${moodShape(i,{size:30})}
        <span style="font-size:16px;flex:1;max-width:none;text-align:left;color:var(--ink)">${m[0]}</span>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#5F7D8F" stroke-width="2" stroke-linecap="round" opacity="${on?1:0}"><path d="M3.5 9.5L7 13l7.5-8"></path></svg>
      </button>`;
    }).join('');
  }
  const iconsOnly = variant==='icons'||variant==='icons2';
  const act = variant==='home' ? 'mood-home' : 'mood';
  return MOODS.map((m,i)=>{
    const on=i===S.mood;
    const bg = variant==='icons2' ? (on?'#fff':'#FDFCFA') : (on?'#fff':'transparent');
    const border = on?'var(--blue)':'rgba(58,58,60,.09)';
    return `<button class="moodq" data-a="${act}" data-i="${i}" style="background:${bg};border-color:${border}${iconsOnly?';min-height:auto;padding:9px 0;justify-content:center':''}">
      ${moodShape(i,{size:iconsOnly?24:26})}
      ${iconsOnly?'':`<span>${m[0]}</span>`}
    </button>`;
  }).join('');
}

/* ============================ tab bar ============================ */
function tabbar(active){
  const defs=[
    ['Главная','M4 11 L12 4.5 L20 11 V20 H4 Z'],
    ['Диалог','M4.5 6 h15 v9.5 h-8.5 l-4.5 3.5 v-3.5 h-2 Z'],
    ['Дневник','M6.5 4 h11 v16 h-11 Z M9.5 8.5 h5 M9.5 12.5 h5'],
    ['Профиль','M12 11.2 a3.4 3.4 0 1 0 0-6.8 a3.4 3.4 0 0 0 0 6.8 Z M5.4 19.8 c.9-3.6 3.6-5.4 6.6-5.4 s5.7 1.8 6.6 5.4'],
  ];
  return `<div class="tabbar">${defs.map((d,i)=>`
    <button class="t ${i===active?'on':''}" data-a="tab" data-i="${i}">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d[1]}"></path></svg>
      <span>${d[0]}</span>
    </button>`).join('')}</div>`;
}
function backHeader(title, right){
  return `<div class="topbar">
    <button class="iconbtn" data-a="pop">${svg(IC.back,{stroke:'#8A8A8E',sw:1.8})}</button>
    <div class="ttl">${esc(title)}</div>
    ${right||''}
  </div>`;
}

/* ============================ ROOT TABS ============================ */
function screenHome(){
  const e = S.entries[0];
  const moodedToday=false;
  return `<div class="col" style="flex:1;min-height:0">
    <div class="scroll pad-top" style="display:flex;flex-direction:column;gap:11px;padding:20px 18px 8px">
      <div style="display:flex;flex-direction:column;gap:3px">
        <div class="h1">${greeting()}, ${esc(USERNAME)}</div>
        <div class="sub">Как вы себя чувствуете сегодня?</div>
      </div>
      <div style="display:flex;gap:6px;justify-content:space-between">${moodRow('home')}</div>

      <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;gap:12px;align-items:center">
          ${avatar(40)}
          <div style="font-size:18px;font-weight:600;line-height:1.25">Что сейчас занимает ваши мысли?</div>
        </div>
        <button class="inp" data-a="dialog-from" style="width:100%">Написать об этом…</button>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${['Мне тревожно','Я устал','Не могу принять решение','Произошёл конфликт','Хочу разобраться в себе']
            .map(t=>`<button class="pill" data-a="dialog-seed" data-t="${esc(t)}" style="background:var(--blue-t);min-height:36px">${t}</button>`).join('')}
        </div>
      </div>

      <button class="card" data-a="breathe" style="background:var(--green-t);border:0;padding:16px 18px;display:flex;align-items:center;gap:14px;width:100%;text-align:left">
        <svg width="42" height="42" viewBox="0 0 42 42"><circle cx="21" cy="21" r="20" fill="none" stroke="#A6BFA4" stroke-width="1.5"></circle><circle cx="21" cy="21" r="9" fill="#A6BFA4" opacity=".45"></circle></svg>
        <div style="flex:1;display:flex;flex-direction:column;gap:3px"><div style="font-size:16px;font-weight:600">Снизить напряжение за 2 минуты</div><div class="sub" style="color:var(--ink2)">Дыхание по квадрату</div></div>
        <span class="pill" style="background:#fff;font-weight:600;color:#4E6B4C;min-height:40px">Начать</span>
      </button>

      ${!isPlus()?`<button class="plusrow" data-a="paywall" data-r="" style="width:100%;text-align:left">
        <div style="width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex:none">${avatar(30)}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:3px"><div style="font-size:15px;font-weight:600;display:flex;align-items:center;gap:8px">Within Plus <span class="plusbadge">PLUS</span></div><div class="tiny" style="color:var(--ink2)">Безлимитные разговоры, голос, все практики</div></div>
        ${svg(IC.chevR,{stroke:'#8E7FA8',sw:2,size:16})}
      </button>`:''}

      <div style="background:var(--beige);border-radius:20px;padding:13px 14px;display:flex;align-items:center;gap:12px">
        <div style="flex:1;font-size:15px;line-height:1.4;color:var(--ink2)">Сегодня вы ещё не отмечали своё настроение</div>
        <button class="pill" data-a="mark-mood" style="background:#fff;font-weight:600;min-height:40px">Отметить</button>
      </div>

      ${e?`<button class="card" data-a="view-entry" data-i="0" style="padding:14px;text-align:left;display:flex;flex-direction:column;gap:7px;border-radius:20px">
        <div style="display:flex;justify-content:space-between;align-items:center"><div class="eyebrow">Последняя запись</div><div class="tiny">${esc(e.when)}</div></div>
        <div style="font-size:15px;line-height:1.5;color:var(--ink)">«${esc(e.text.split('.')[0])}».</div>
      </button>`:''}

      <button data-a="practices" class="btn-link" style="margin-top:2px">Все практики →</button>
    </div>
    ${tabbar(0)}
  </div>`;
}
function greeting(){ const hr=new Date().getHours(); if(hr<6)return 'Доброй ночи'; if(hr<12)return 'Доброе утро'; if(hr<18)return 'Добрый день'; return 'Добрый вечер'; }

function screenDiary(){
  const seg = `<div class="seg" style="margin:0 0 4px"><button class="${V.diaryView==='entries'?'on':''}" data-a="diary-view" data-v="entries">Записи</button><button class="${V.diaryView==='obs'?'on':''}" data-a="diary-view" data-v="obs">Наблюдения</button></div>`;
  const body = V.diaryView==='obs' ? diaryObs() : diaryEntries();
  return `<div class="col" style="flex:1;min-height:0">
    <div class="scroll pad-top" style="display:flex;flex-direction:column;gap:12px;padding:20px 18px 8px">
      ${seg}
      ${body}
    </div>
    ${V.diaryView==='entries' && S.entries.length ? `<button class="fab" data-a="new-entry">${svg(IC.plus,{stroke:'#fff',sw:2})}</button>`:''}
    ${tabbar(2)}
  </div>`;
}
function diaryEntries(){
  if(!S.entries.length) return emptyDiary();
  // calendar — текущий месяц, подсвечены дни с отметкой настроения, сегодня выделен
  const now=new Date(), yy=now.getFullYear(), mo=now.getMonth(), td=now.getDate();
  const dim=new Date(yy,mo+1,0).getDate();
  const lead=(new Date(yy,mo,1).getDay()+6)%7;                 // смещение до понедельника
  const prefix=ymd(new Date(yy,mo,1)).slice(0,7);
  const marked=new Set((S.moodLog||[]).filter(x=>x.d.slice(0,7)===prefix).map(x=>+x.d.slice(8,10)));
  let cal='';
  for(let i=0;i<lead;i++) cal+='<div></div>';
  for(let i=1;i<=dim;i++){ const on=marked.has(i), sel=i===td;
    cal+=`<div style="aspect-ratio:1;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:12px;background:${sel?'var(--blue)':on?'var(--blue-t)':'transparent'};color:${sel?'#fff':on?'#4A6675':'var(--ink4)'};border:1px solid ${sel?'var(--blue)':'transparent'}">${i}</div>`; }
  const filters=['Все','Тревога','Работа','Сон'].map((f,i)=>`<span class="pill ${i===0?'pill-on':'pill-off'}">${f}</span>`).join('');
  const entries=S.entries.map((e,i)=>`
    <div class="card" data-a="view-entry" data-i="${i}" role="button" style="padding:15px 16px;text-align:left;display:flex;flex-direction:column;gap:9px;border-radius:20px;cursor:pointer">
      <div style="display:flex;align-items:center;gap:10px">
        ${moodShape(e.mood,{size:24})}
        <div style="flex:1;font-size:15px;font-weight:600">${cap(MOODS[e.mood][0])}</div>
        <div class="tiny">${esc(e.short)}</div>
      </div>
      <div style="font-size:15px;line-height:1.5">${esc(e.text)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div style="display:flex;gap:6px">${e.tag?`<span class="tag">${esc(e.tag)}</span>`:''}</div><button data-a="discuss-entry" data-i="${i}" style="font-size:13px;color:var(--blue);font-weight:600;padding:4px 0">Обсудить с Леей →</button></div>
    </div>`).join('');
  return `
    <div style="display:flex;align-items:center;justify-content:space-between"><div class="h1">Дневник</div><div style="font-size:15px;color:var(--blue)">${MONTHS[new Date().getMonth()]}</div></div>
    <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:10px">
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;font-size:11px;color:var(--ink4);text-align:center">${['пн','вт','ср','чт','пт','сб','вс'].map(d=>`<div>${d}</div>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">${cal}</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px">${filters}</div>
    ${entries}`;
}
function weekSlots(){
  const now=new Date(); const dow=(now.getDay()+6)%7;         // 0=пн
  const mon=new Date(now); mon.setDate(now.getDate()-dow);
  const names=['пн','вт','ср','чт','пт','сб','вс']; const out=[];
  for(let i=0;i<7;i++){ const dt=new Date(mon); dt.setDate(mon.getDate()+i); const key=ymd(dt);
    const marks=(S.moodLog||[]).filter(x=>x.d===key); const m=marks.length?marks[marks.length-1].m:null;
    out.push({key, m, label:names[i], dt}); }
  return out;
}
function deriveInsights(){
  const log=(S.moodLog||[]); if(log.length<3) return [];
  const out=[]; const recent=log.slice(-14);
  // серия дней подряд
  let streak=0; const set=new Set(log.map(x=>x.d)); const d=new Date();
  while(set.has(ymd(d))){ streak++; d.setDate(d.getDate()-1); }
  if(streak>=2) out.push(['Вы отмечаете настроение '+streak+' '+pluralRu(streak,'день','дня','дней')+' подряд — так наблюдения точнее.','#EDF2EB','#5E7D5C','M4 12l5 5L20 6']);
  // самое частое настроение
  const cnt={}; recent.forEach(x=>cnt[x.m]=(cnt[x.m]||0)+1);
  const top=+Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a])[0];
  out.push(['Чаще всего в последние дни вы отмечали «'+MOODS[top][0]+'».','#EAF0F3','#4A6675','M12 4a8 8 0 100 16 8 8 0 000-16zM12 8v4']);
  // тренд
  const r=recent.slice(-3), p=recent.slice(-7,-3), avg=a=>a.reduce((s,x)=>s+x.m,0)/a.length;
  if(r.length>=2 && p.length>=2){ const dr=avg(r)-avg(p);
    if(dr>=0.6) out.push(['Настроение за последние дни понемногу улучшается.','#EDF2EB','#5E7D5C','M4 16c5 0 6-8 8-8s3 8 8 8']);
    else if(dr<=-0.6) out.push(['В последние дни настроение снижается — будьте к себе бережнее.','#F3EDE3','#8A7440','M4 8c5 0 6 8 8 8s3-8 8-8']); }
  return out.slice(0,3);
}
function diaryObs(){
  const slots=weekSlots();
  const range=slots[0].dt.getDate()+' '+MONTHS[slots[0].dt.getMonth()].slice(0,3).toLowerCase()+' — '+slots[6].dt.getDate()+' '+MONTHS[slots[6].dt.getMonth()].slice(0,3).toLowerCase();
  const pts=slots.map((s,i)=>({i, x:18+i*44, y:s.m==null?null:(92-s.m*13.6), m:s.m})).filter(p=>p.y!=null);
  const total=(S.moodLog||[]).length;
  if(total<2){
    return `<div style="display:flex;flex-direction:column;gap:4px"><div class="h1">Наблюдения</div><div class="sub" style="color:var(--ink3)">${range}</div></div>
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:40px 20px;text-align:center;min-height:44vh">
        ${svg('M4 16c5 0 6-8 8-8s3 8 8 8',{stroke:'#9FB6C4',sw:2,size:52})}
        <div style="display:flex;flex-direction:column;gap:8px"><div class="h2">Наблюдения появятся скоро</div><div class="sub" style="color:var(--ink2);font-size:16px">Отмечайте настроение несколько дней — и здесь появится динамика и первые выводы.</div></div>
        <button class="btn btn-primary" data-a="mark-mood" style="width:auto;padding:0 24px;min-height:48px">Отметить настроение</button>
      </div>`;
  }
  if(V.point==null || slots[V.point]==null || slots[V.point].m==null){ const withData=pts.map(p=>p.i); V.point=withData.length?withData[withData.length-1]:0; }
  const line=pts.map((p,k)=>(k?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');
  const area=pts.length>=2 ? line+' L'+pts[pts.length-1].x.toFixed(1)+' 96 L'+pts[0].x.toFixed(1)+' 96 Z' : '';
  const dots=pts.map(p=>`<circle cx="${p.x}" cy="${p.y.toFixed(1)}" r="${p.i===V.point?6:4}" fill="${p.i===V.point?'#5F7D8F':'#9FB6C4'}" stroke="#fff" stroke-width="2" data-a="chart-point" data-i="${p.i}" style="cursor:pointer"></circle>`).join('');
  const sel=slots[V.point]; const label=sel? sel.label+' · '+(sel.m==null?'нет отметки':MOODS[sel.m][0]) : '';
  const ins=deriveInsights();
  const insights=ins.length? ins.map(i=>`<div style="background:${i[1]};border-radius:20px;padding:15px 16px;display:flex;gap:12px;align-items:flex-start">${svg(i[3],{stroke:i[2],size:22})}<div style="font-size:15px;line-height:1.5">${i[0]}</div></div>`).join('')
    : `<div style="background:var(--beige);border-radius:20px;padding:15px 16px" class="sub" style="color:var(--ink2)">Отмечайте настроение ещё пару дней — и здесь появятся выводы.</div>`;
  const stats=[[String(S.entries.length),pluralRu(S.entries.length,'запись','записи','записей')],[String(S.practicesDone||0),pluralRu(S.practicesDone||0,'практика','практики','практик')],[String(S.dialogs||0),pluralRu(S.dialogs||0,'разговор','разговора','разговоров')]];
  return `
    <div style="display:flex;flex-direction:column;gap:4px"><div class="h1">Наблюдения</div><div class="sub" style="color:var(--ink3)">${range}</div></div>
    <div class="card" style="padding:18px 16px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;padding:0 2px"><div style="font-size:15px;font-weight:600">Настроение за неделю</div><div class="sub" style="color:var(--ink3)" id="pointLabel">${label}</div></div>
      <svg viewBox="0 0 300 120" style="width:100%;height:120px">
        <path d="M4 96h292" stroke="rgba(58,58,60,.08)" stroke-width="1"></path>
        <path d="M4 60h292" stroke="rgba(58,58,60,.06)" stroke-width="1" stroke-dasharray="3 5"></path>
        ${area?`<path d="${area}" fill="#EAF0F3"></path>`:''}
        ${line?`<path d="${line}" fill="none" stroke="#9FB6C4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>`:''}
        ${dots}
      </svg>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);font-size:12px;color:var(--ink4);text-align:center">${slots.map(s=>`<div>${s.label}</div>`).join('')}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">${insights}</div>
    <div style="display:flex;gap:10px">
      ${stats.map(s=>`<div class="card" style="flex:1;padding:14px;display:flex;flex-direction:column;gap:3px;border-radius:18px"><div style="font-size:24px;font-weight:600">${s[0]}</div><div class="tiny" style="color:var(--ink3)">${s[1]}</div></div>`).join('')}
    </div>
    ${!isPlus()?`<button class="card" data-a="paywall" data-r="insights" style="padding:15px 16px;text-align:left;display:flex;align-items:center;gap:14px;border-radius:20px">
      <div style="width:44px;height:44px;border-radius:14px;background:var(--lav-t);display:flex;align-items:center;justify-content:center;flex:none">${svg('M4 16c5 0 6-8 8-8s3 8 8 8',{stroke:'#7A6E96',sw:1.8,size:22})}</div>
      <div style="flex:1;display:flex;flex-direction:column;gap:3px"><div style="font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px">Тренды за всё время <span class="lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A7440" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="9.5" rx="3"></rect><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"></path></svg>Plus</span></div><div class="sub" style="color:var(--ink3);font-size:14px">Динамика настроения по месяцам и глубокие выводы</div></div>
      ${svg(IC.chevR,{stroke:'#8E7FA8',sw:2,size:16})}
    </button>`:''}
    <div class="tiny" style="line-height:1.5;padding:0 2px">Это наблюдения, а не медицинские заключения. Они основаны только на ваших отметках.</div>`;
}
function emptyDiary(){
  return `
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:40px 16px;text-align:center;min-height:56vh">
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none"><rect x="26" y="10" width="68" height="80" rx="16" fill="#F3EDE3"></rect><path d="M42 34h36M42 48h26M42 62h32" stroke="#D6CCBC" stroke-width="3" stroke-linecap="round"></path></svg>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="h2">Здесь появятся ваши записи</div>
        <div class="sub" style="color:var(--ink2);font-size:16px">Записи о настроении и важных событиях. Отмечайте настроение несколько дней, чтобы увидеть первые наблюдения.</div>
      </div>
      <button class="btn btn-primary" data-a="new-entry" style="width:auto;padding:0 24px;min-height:48px">Создать первую запись</button>
    </div>`;
}
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

function screenProfile(){
  const profileTop=[['Имя',USERNAME,'edit-name'],['Стиль общения Леи',STYLES[S.style][0].split(' и ')[0],'edit-style'],['Цели',S.goals.length+' выбрано','edit-goals']];
  const profileMid=[['Напоминания','ежедневно, 21:00','reminders'],['Оформление','как в Telegram',''],['Язык','Русский',''],['Анимации',rm()?'выключены':'включены','rm-toggle']];
  const profileBottom=[['Приватность и данные','privacy'],['Правила безопасного использования','safety'],['Политика конфиденциальности','privacy-policy'],['Условия использования','terms'],['Написать в поддержку','support'],['О приложении · by Kapin Group','about']];
  const grp=(rows,val)=>`<div class="grouped">${rows.map(r=>`
    <button class="row" data-a="${r[val?2:1]||'noop'}" style="text-align:left;width:100%">
      <span style="flex:1;font-size:16px">${r[0]}</span>
      ${val&&r[1]?`<span style="font-size:15px;color:var(--ink3)">${r[1]}</span>`:''}
      ${svg(IC.chevR,{stroke:'#C4C2BD',sw:2,size:16})}
    </button>`).join('')}</div>`;
  return `<div class="col" style="flex:1;min-height:0">
    <div class="scroll pad-top" style="display:flex;flex-direction:column;gap:12px;padding:20px 18px 8px">
      <div style="display:flex;align-items:center;gap:14px">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--blue-t2);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;color:#4A6675">${esc((USERNAME[0]||'A').toUpperCase())}</div>
        <div style="display:flex;flex-direction:column;gap:3px"><div class="h2">${esc(USERNAME)}</div><div class="sub" style="color:var(--ink3)">С вами 18 дней</div></div>
      </div>
      <button class="plusrow" data-a="paywall" data-r="" style="width:100%;text-align:left">
        <div style="width:40px;height:40px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex:none">${avatar(30)}</div>
        <div style="flex:1;display:flex;flex-direction:column;gap:3px">
          <div style="font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px">Within Plus <span class="plusbadge">PLUS</span></div>
          <div class="tiny" style="color:var(--ink2)">${isPlus()?('активен'+(plusUntilLabel()?' до '+plusUntilLabel():'')):'Безлимит, голос, все практики'}</div>
        </div>
        ${isPlus()?`<span style="font-size:13px;color:#5E7D5C;font-weight:600">Активен</span>`:svg(IC.chevR,{stroke:'#8E7FA8',sw:2,size:16})}
      </button>
      ${grp(profileTop,true)}
      ${grp(profileMid,true)}
      ${grp(profileBottom,false)}
      <div class="tiny" style="line-height:1.5;padding:0 2px">Within by Kapin Group. Лея — ИИ-собеседник: она не является врачом или психологом и не ставит диагнозов.</div>
    </div>
    ${tabbar(3)}
  </div>`;
}

/* ============================ PUSHED SCREENS ============================ */
function pushDialogEntry(){ // 07 new dialog format
  return `<div class="layer col" style="flex:1">
    <div class="topbar"><div class="ttl" style="font-size:24px">С чего начнём?</div><button class="iconbtn" data-a="pop">${svg('M18 6L6 18M6 6l12 12',{stroke:'#8A8A8E',sw:1.8,size:22})}</button></div>
    <div style="padding:0 20px 10px" class="sub">Выберите формат — его можно сменить в разговоре.</div>
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:10px">
      ${FORMATS.map((f,i)=>`<button class="card" data-a="open-chat" data-fmt="${i}" style="padding:16px;text-align:left;display:flex;gap:14px;align-items:flex-start;border-radius:20px">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="flex:none"><circle cx="17" cy="17" r="16" fill="${f[2]}"></circle><path d="${f[4]}" stroke="${f[3]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <div style="display:flex;flex-direction:column;gap:4px"><div style="font-size:17px;font-weight:600">${f[0]}</div><div class="sub" style="color:var(--ink3)">${f[1]}</div></div>
      </button>`).join('')}
    </div>
    <div style="flex:none;padding:14px 20px calc(30px + var(--sab))"><button class="btn btn-soft" data-a="open-chat" data-fmt="-1">Просто открыть диалог</button></div>
  </div>`;
}

function pushChat(){
  V.chat = V.chat || freshChat();
  const st=V.chat;
  return `<div class="layer col" style="flex:1" id="chatLayer">
    <div style="flex:none;display:flex;align-items:center;gap:12px;padding:calc(var(--sat) + 12px) 18px 12px;border-bottom:1px solid var(--line2);background:rgba(250,249,245,.96)">
      <button class="iconbtn" data-a="pop">${svg(IC.back,{stroke:'#8A8A8E',sw:1.8,size:20})}</button>
      ${avatar(36)}
      <div style="flex:1;display:flex;flex-direction:column"><div style="font-size:16px;font-weight:600">Лея</div><div class="tiny" style="color:var(--ink3)">${st.fmt>=0?FORMATS[st.fmt][0]:'Готова вас выслушать'}</div></div>
      <button class="iconbtn" data-a="start-call">${svg(IC.phone,{stroke:'#5F7D8F',sw:1.7,size:22})}</button>
      <button class="iconbtn" data-a="history">${svg('M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',{stroke:'#8A8A8E',sw:1.7,size:22})}</button>
    </div>
    <div class="chat-scroll" id="chatScroll"></div>
    ${freeBannerHTML()}
    <div style="flex:none;padding:8px 14px 0;display:flex;flex-wrap:wrap;align-items:center;gap:6px">
      <button class="qchip" data-a="q-mood">Отметить эмоцию</button>
      <button class="qchip" data-a="q-save">Сохранить мысль</button>
      <button class="qchip" data-a="q-ex">Упражнение</button>
    </div>
    <div style="flex:none;display:flex;align-items:flex-end;gap:9px;padding:12px 14px calc(20px + var(--sab))">
      <textarea id="chatInput" class="field" rows="1" placeholder="Что сейчас происходит…" style="min-height:48px;max-height:120px;border-radius:22px;padding:13px 16px;line-height:1.3;white-space:nowrap;overflow-x:hidden"></textarea>
      <button class="send" data-a="send">${svg(IC.send,{stroke:'#fff',sw:2,size:21})}</button>
    </div>
  </div>`;
}
function freshChat(){
  return { fmt:-1, thinking:false, typingId:null, seeded:false,
    msgs:[
      {who:'day',text:'Сегодня'},
      {who:'ai',text:'Вы можете рассказать столько, сколько сейчас комфортно. С чего хотите начать?'},
    ]};
}
function renderChat(){
  const box=$('#chatScroll'); if(!box) return; const st=V.chat;
  box.innerHTML = st.msgs.map(m=>chatMsgHTML(m)).join('');
  if(st.thinking) box.insertAdjacentHTML('beforeend', thinkingHTML());
  box.scrollTop=box.scrollHeight;
}
function chatMsgHTML(m){
  if(m.who==='day') return `<div class="daychip">${esc(m.text)}</div>`;
  if(m.who==='me') return `<div class="bubble b-me">${esc(m.text)}</div>`;
  if(m.who==='exercise') return exerciseCardHTML();
  if(m.who==='ai'){
    const fb = m.feedback? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">${['Это помогло','Не совсем','Сохранить','Объяснить проще'].map(t=>`<button class="fbchip" data-a="fb" data-t="${esc(t)}">${t}</button>`).join('')}</div>`:'';
    return `<div style="align-self:flex-start;max-width:86%;display:flex;flex-direction:column"><div class="bubble b-ai" style="max-width:none;white-space:pre-wrap">${esc(m.text)}</div>${fb}</div>`;
  }
  return '';
}
function thinkingHTML(){
  const d=(delay)=>`<div style="width:6px;height:6px;border-radius:50%;background:#8E7FA8;animation:${anim('dot','om-dot 1.4s ease-in-out '+delay+' infinite')}"></div>`;
  return `<div style="align-self:flex-start;display:flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line2);border-radius:20px;padding:12px 16px"><div style="display:flex;gap:4px">${d('0s')}${d('.2s')}${d('.4s')}</div><span class="sub" style="color:var(--ink3)">Обдумываю ваш ответ…</span></div>`;
}
function exerciseCardHTML(){
  return `<div style="align-self:flex-start;width:88%;background:var(--green-t);border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;align-items:center;gap:12px">
      <svg width="40" height="40" viewBox="0 0 40 40"><rect x="6" y="6" width="28" height="28" rx="9" fill="none" stroke="#A6BFA4" stroke-width="1.6"></rect><rect x="14" y="14" width="12" height="12" rx="4" fill="#A6BFA4" opacity=".5"></rect></svg>
      <div style="flex:1;display:flex;flex-direction:column;gap:2px"><div style="font-size:16px;font-weight:600">Дыхание по квадрату</div><div class="sub" style="color:var(--ink2)">2 минуты · без звука</div></div>
    </div>
    <div style="font-size:14px;line-height:1.5;color:#4E6B4C">Четыре равных счёта: вдох, пауза, выдох, пауза. Можно остановиться в любой момент.</div>
    <div style="display:flex;gap:8px"><button class="btn btn-primary" data-a="breathe" style="flex:1;min-height:44px;font-size:15px;border-radius:14px">Начать практику</button><button style="min-height:44px;display:flex;align-items:center;padding:0 16px;border-radius:14px;background:#fff;font-size:15px;color:#4E6B4C" data-a="ex-later">Позже</button></div>
  </div>`;
}
function deliverReply(reply, crisis){
  const st=V.chat; st.thinking=false;
  if(crisis){ renderChat(); setTimeout(()=>V.stack_push('crisis'),250); return; }
  const msg={who:'ai',text: rm()?reply:'', feedback:true};
  st.msgs.push(msg); renderChat();
  if(rm()) return;
  let n=0; clearInterval(st.iTimer);
  st.iTimer=setInterval(()=>{ n++; msg.text=reply.slice(0,n); const box=$('#chatScroll');
    if(!box){clearInterval(st.iTimer);return;}
    const bubbles=box.querySelectorAll('.b-ai'); const last=bubbles[bubbles.length-1];
    if(last){ last.textContent=msg.text; box.scrollTop=box.scrollHeight; }
    if(n>=reply.length) clearInterval(st.iTimer);
  },24);
}
function fetchReply(st){
  const history = st.msgs
    .filter(m=>m.who==='me'||m.who==='ai')
    .map(m=>({role:m.who==='me'?'user':'assistant', content:m.text}))
    .filter(m=>m.content && m.content.trim());
  return fetch(CONFIG.API_URL.replace(/\/$/,'')+'/api/chat',{
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ initData: tg?tg.initData:'', style:S.style, goals:S.goals, name:USERNAME, messages:history })
  }).then(r=>{ if(!r.ok) throw new Error('http '+r.status); return r.json(); });
}
function chatSend(text){
  const st=V.chat; text=(text||'').trim(); if(!text) return;
  // crisis detection (client-side, instant — server mirrors this)
  if(CRISIS_WORDS.some(w=>text.toLowerCase().includes(w))){
    st.msgs.push({who:'me',text}); renderChat();
    setTimeout(()=>V.stack_push('crisis'),350); return;
  }
  // free daily limit → paywall (server enforces authoritatively too)
  if(!isPlus() && remainingFree()<=0){ openPaywall('messages'); return; }

  st.msgs.push({who:'me',text});
  if(V.netOffline || (CONFIG.API_URL && !navigator.onLine)){ renderChat(); showOfflineInline(); return; }
  st.thinking=true; renderChat(); haptic('light');

  // Живой бэкенд возможен только внутри Telegram (нужен initData). Вне Telegram — демо-ответы.
  if(CONFIG.API_URL && tg && tg.initData){
    fetchReply(st).then(r=>{
      applyEnt(r.ent); patchFreeBanner();
      if(r.limit){ st.thinking=false; renderChat(); openPaywall('messages'); return; }
      deliverReply(r.reply || 'Я рядом. Расскажите, что сейчас происходит?', r.crisis);
    }).catch(()=>{ st.thinking=false; renderChat(); showOfflineInline(); });
    return;
  }
  // standalone scripted fallback
  if(!isPlus()){ S.msgCount++; save(); patchFreeBanner(); }
  const reply = st.replyIdx==null?ANSWER:REPLIES[(st.replyIdx)%REPLIES.length];
  st.replyIdx=(st.replyIdx==null?0:st.replyIdx+1);
  const delay = rm()?300:1600;
  st.tTimer=setTimeout(()=>deliverReply(reply), delay);
}
function showOfflineInline(){
  const box=$('#chatScroll'); if(!box)return;
  box.insertAdjacentHTML('beforeend',`<div style="align-self:flex-end;display:flex;align-items:center;gap:6px;font-size:13px;color:var(--ink4)">${svg('M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',{stroke:'#A2A29F',sw:2,size:14})}не отправлено</div>
  <div style="margin-top:8px;background:var(--beige);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px;align-items:flex-start">
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#8A8A8E" stroke-width="1.7" stroke-linecap="round"><path d="M8 18c8-7 20-7 28 0M13 25c5-4 13-4 18 0M19 32c2-1.5 4-1.5 6 0"></path><path d="M34 10L10 34" stroke="#A9645A"></path></svg>
    <div style="font-size:17px;font-weight:600">Не удалось подключиться</div>
    <div class="sub" style="color:var(--ink2);font-size:15px">Проверьте интернет и попробуйте ещё раз. Ваше сообщение сохранено.</div>
    <button class="pill pill-on" data-a="retry-send" style="min-height:44px;padding:0 20px;font-weight:600">Повторить</button>
  </div>`);
  box.scrollTop=box.scrollHeight;
}

/* --------- voice call flow (25,26,27) ---------- */
function pushPrecall(){
  return `<div class="layer col" style="flex:1">
    ${backHeader('Голосовой разговор')}
    <div class="scroll" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:4px 30px 8px;text-align:center">
      <div style="width:140px;height:140px;flex:none;position:relative;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:0;border-radius:50%;background:#E8E1EE;animation:${anim('aura','om-aura 6s ease-in-out infinite')}"></div>
        <div style="position:relative">${avatar(104,'#8E7FA8')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="big">Поговорить голосом</div>
        <div class="sub" style="color:var(--ink2);font-size:16px">Иногда проще сказать вслух, чем написать. Можно молчать, делать паузы и завершить разговор в любой момент.</div>
      </div>
      <div class="card" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;width:100%;text-align:left">
        ${[['M6 12a6 6 0 0012 0M12 18v2.5','Микрофон','включён','M9 3.5h6v11H9z'],['M4 9h4l5-4v14l-5-4H4z','Голос собеседника','спокойный',''],['M4 6h16M4 12h11M4 18h8','Субтитры разговора','показывать','']]
          .map(r=>`<div style="display:flex;align-items:center;gap:10px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5F7D8F" stroke-width="1.7" stroke-linecap="round" style="flex:none">${r[3]?`<rect x="9" y="3.5" width="6" height="11" rx="3"></rect>`:''}<path d="${r[0]}"></path></svg><span style="flex:1;font-size:15px">${r[1]}</span><span class="sub" style="color:var(--ink3)">${r[2]}</span></div>`).join('')}
      </div>
      <div class="tiny" style="line-height:1.5">Разговор слышите только вы. Запись голоса не сохраняется — в дневник попадает только текст, который вы сами сохраните.</div>
    </div>
    <div style="flex:none;padding:0 22px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-primary" data-a="call-go">${svg(IC.phone,{stroke:'#fff',sw:1.9,size:20})}Позвонить</button>
      <button class="btn btn-soft" data-a="pop">Лучше напишу</button>
    </div>
  </div>`;
}
function pushIncall(){
  V.call=V.call||{sec:0};
  const bars=[.62,.9,.45,1,.7,.95,.5,.8,.58].map((hh,i)=>`<div style="width:6px;height:38px;border-radius:3px;background:#9B8DB8;transform-origin:bottom;animation:${anim('wave','om-wave '+(1+hh*0.8).toFixed(2)+'s ease-in-out '+(i*0.11).toFixed(2)+'s infinite')}"></div>`).join('');
  return `<div class="layer col" style="flex:1;background:#F4F1F6">
    <div style="flex:none;display:flex;flex-direction:column;align-items:center;gap:4px;padding:calc(var(--sat) + 20px) 22px 0"><div style="font-size:17px;font-weight:600">Лея</div><div style="font-size:15px;color:#7A6E96" id="callTimer">${fmtTimer(V.call.sec)}</div></div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;padding:0 26px">
      <div style="width:190px;height:190px;position:relative;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:0;border-radius:50%;background:#E4D9EE;animation:${anim('aura','om-aura 6s ease-in-out infinite')}"></div>
        <div style="position:absolute;inset:26px;border-radius:50%;background:#EFE9F4"></div>
        <svg width="96" height="96" viewBox="0 0 40 40" style="position:relative"><path d="M8 24c6 0 8-9 12-9s6 9 12 9" fill="none" stroke="#7A6E96" stroke-width="1.9" stroke-linecap="round"></path><path d="M8 29c6 0 8-6 12-6s6 6 12 6" fill="none" stroke="#7A6E96" stroke-width="1.4" stroke-linecap="round" opacity=".5"></path></svg>
      </div>
      <div style="display:flex;align-items:flex-end;gap:5px;height:44px">${bars}</div>
      <div style="font-size:15px;color:#7A6E96">Лея говорит</div>
      <div class="card" style="padding:16px;width:100%;display:flex;flex-direction:column;gap:8px;border:1px solid var(--line3)">
        <div class="eyebrow">Субтитры</div>
        <div style="font-size:16px;line-height:1.5">«Вы можете рассказать столько, сколько сейчас комфортно. Я никуда не спешу — давайте остановимся на том, что было тяжелее всего».</div>
      </div>
    </div>
    <div style="flex:none;padding:0 22px calc(30px + var(--sab));display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;justify-content:space-between;gap:10px">
        ${[[IC.mic,'Микрофон'],[IC.subtitles,'Субтитры'],[IC.pause,'Пауза']].map(b=>`<div style="flex:1;min-height:64px;border-radius:18px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px">${svg(b[0],{stroke:'#3A3A3C',size:22})}<span style="font-size:12px;color:var(--ink2)">${b[1]}</span></div>`).join('')}
        <button style="flex:1;min-height:64px;border-radius:18px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px" data-a="call-tochat"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3A3A3C" stroke-width="1.7" stroke-linecap="round"><path d="${IC.phone}"></path><path d="M4 20L20 4" opacity=".45"></path></svg><span style="font-size:12px;color:var(--ink2)">В чат</span></button>
      </div>
      <button class="btn btn-danger" data-a="call-end">Завершить разговор</button>
    </div>
  </div>`;
}
function pushPostcall(){
  const t = V.call?fmtTimer(V.call.sec):'7:12';
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;display:flex;align-items:center;gap:12px;padding:calc(var(--sat) + 18px) 20px 10px"><div style="flex:1;font-size:17px;font-weight:600">Разговор завершён</div><div class="sub" style="color:var(--ink3)">${t}</div></div>
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:12px">
        <div class="eyebrow">О чём говорили</div>
        <div style="font-size:16px;line-height:1.55">Разговор с руководителем и ощущение, что вашу работу оценили формально. Вы заметили, что сильнее всего задело не содержание, а тон.</div>
        <div style="height:1px;background:var(--line2)"></div>
        <div class="eyebrow">Что вы решили попробовать</div>
        <div style="font-size:16px;line-height:1.55">Вернуться к разговору через день и спросить про конкретные ожидания.</div>
        <div class="tiny" style="line-height:1.5">Это черновик заметки. Вы можете отредактировать её перед сохранением.</div>
      </div>
      <div style="background:var(--lav-t);border-radius:20px;padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="font-size:16px;line-height:1.5;color:#5A5068">Как вы себя чувствуете после разговора?</div>
        <div style="display:flex;gap:6px">${moodRow('icons2')}</div>
      </div>
      <div style="background:var(--green-t);border-radius:20px;padding:15px 16px;display:flex;align-items:center;gap:14px">
        <svg width="38" height="38" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" stroke="#A6BFA4" stroke-width="1.5"></circle><circle cx="20" cy="20" r="8" fill="#A6BFA4" opacity=".45"></circle></svg>
        <div style="flex:1;font-size:15px;line-height:1.45;color:#4E6B4C">После таких разговоров многим помогает две минуты тишины и дыхания</div>
      </div>
    </div>
    <div style="flex:none;padding:12px 20px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-primary" data-a="postcall-save">Сохранить в дневник</button>
      <button class="btn btn-soft" data-a="call-done-chat">Продолжить в чате</button>
    </div>
  </div>`;
}
function fmtTimer(sec){ return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'); }

/* --------- history (10) ---------- */
const HISTORY=[
  {title:'Разговор с руководителем',date:'сегодня',excerpt:'Разобрали, что именно задело в обратной связи',tags:['работа','тревога']},
  {title:'Не могу уснуть',date:'2 авг',excerpt:'Практика подготовки ко сну, вернулись к мыслям о неделе',tags:['сон','напряжение']},
  {title:'Ссора с сестрой',date:'31 июля',excerpt:'Что хотелось сказать и что получилось сказать',tags:['отношения']},
  {title:'Выбор между двумя офферами',date:'28 июля',excerpt:'Сравнили страхи, риски и то, что важно',tags:['решение','работа']},
];
function pushHistory(){
  return `<div class="layer col" style="flex:1">
    <div class="topbar"><button class="iconbtn" data-a="pop">${svg(IC.back,{stroke:'#8A8A8E',sw:1.8})}</button><div class="ttl" style="font-size:24px">Разговоры</div>${svg('M11 11m-6 0a6 6 0 1012 0a6 6 0 10-12 0M16 16l4 4',{stroke:'#8A8A8E',sw:1.8,size:22})}</div>
    <div class="scroll" style="padding:0 20px 8px;display:flex;flex-direction:column;gap:10px">
      ${S.historyOff?`<div style="background:var(--beige);border-radius:20px;padding:16px" class="sub">История разговоров отключена в настройках приватности.</div>`:
        HISTORY.map(hh=>`<button class="card" data-a="open-chat" data-fmt="-1" style="padding:15px 16px;text-align:left;display:flex;flex-direction:column;gap:7px;border-radius:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div style="font-size:16px;font-weight:600">${hh.title}</div><div class="tiny" style="white-space:nowrap">${hh.date}</div></div>
        <div class="sub" style="color:var(--ink3);font-size:14px">${hh.excerpt}</div>
        <div style="display:flex;gap:6px;margin-top:2px">${hh.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </button>`).join('')}
      <div style="margin-top:6px;background:var(--beige);border-radius:20px;padding:16px" class="sub" style="color:var(--ink2)">Начните разговор, когда будете готовы. История хранится только у вас — её можно удалить в настройках.</div>
    </div>
    <div style="flex:none;padding:0 20px calc(20px + var(--sab))"><button class="btn btn-primary" data-a="open-chat" data-fmt="-1">Открыть новый диалог</button></div>
  </div>`;
}

/* --------- practices catalog (15) + flow (16) ---------- */
function pushPractices(){
  const filters=['Тревога','Стресс','Сон','Самооценка'].map((f,i)=>`<span class="pill ${i===0?'pill-on':'pill-off'}">${f}</span>`).join('');
  return `<div class="layer col" style="flex:1">
    ${backHeader('Практики')}
    <div class="scroll" style="padding:2px 18px 8px;display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;flex-wrap:wrap;gap:8px">${filters}</div>
      ${PRACTICES.map((p,i)=>`<button class="card" data-a="practice-start" data-i="${i}" style="padding:15px 16px;text-align:left;display:flex;gap:14px;align-items:center;border-radius:20px">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" style="flex:none"><rect x="1.5" y="1.5" width="41" height="41" rx="14" fill="${p[4]}"></rect><path d="${p[6]}" stroke="${p[5]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>
        <div style="flex:1;display:flex;flex-direction:column;gap:4px">
          <div style="font-size:16px;font-weight:600">${p[0]}</div>
          <div class="sub" style="color:var(--ink3);font-size:14px;line-height:1.4">${p[1]}</div>
          <div style="display:flex;gap:6px;margin-top:2px;align-items:center"><span class="tag" style="padding:3px 8px">${p[2]}</span><span class="tag" style="padding:3px 8px">${p[3]}</span>${i>0 && !isPlus()?`<span class="lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A7440" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="9.5" rx="3"></rect><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"></path></svg>Plus</span>`:''}</div>
        </div>
      </button>`).join('')}
    </div>
  </div>`;
}
function pushPractice(){
  const id=V.pracId||0; const p=PRACTICES[id]; const guide=practiceSteps(id);
  const steps=guide.steps; const n=steps.length; const step=V.pracStep||0;
  if(step>=n) return practiceDone();
  const s=steps[step];
  const pct=((step+1)/n)*100;
  const bg = guide.type==='breath' ? '#F4F7F3' : (guide.type==='reflect' ? '#FAF9F5' : '#F6F4F8');
  const last = step===n-1;
  let visual;
  if(guide.type==='breath'){
    visual=`<div style="width:220px;height:220px;position:relative;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;inset:0;border-radius:50%;background:#DCE8DA;animation:${anim('breathe','om-breathe 9s ease-in-out infinite')}"></div>
      <div style="position:absolute;inset:38px;border-radius:50%;border:1.5px solid rgba(122,150,120,.4)"></div>
      <div style="font-size:19px;font-weight:600;color:#3E5A3C;z-index:1">${s[2]}</div>
    </div>`;
  } else {
    const tint=guide.tint||'#E8E1EE', ink=guide.ink||'#7A6E96';
    visual=`<div style="width:150px;height:150px;position:relative;display:flex;align-items:center;justify-content:center">
      <div style="position:absolute;inset:0;border-radius:50%;background:${tint};animation:${anim('aura','om-aura 6s ease-in-out infinite')}"></div>
      <div style="position:relative;font-size:30px;font-weight:600;color:${ink}">${step+1}</div>
    </div>`;
  }
  const body = guide.type==='reflect'
    ? `<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:22px;padding:8px 24px">
         <div style="display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center">${visual}
           <div class="h2" style="font-size:22px">${s[0]}</div>
           <div class="sub" style="color:var(--ink2);font-size:16px">${s[1]}</div>
         </div>
         <textarea class="field" id="pracInput" rows="3" placeholder="${esc(s[2]||'')}" style="min-height:96px">${esc(V.pracNotes[step]||'')}</textarea>
       </div>`
    : `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;padding:0 32px;text-align:center">
         ${visual}
         <div style="display:flex;flex-direction:column;gap:10px">
           <div class="h2" style="font-size:22px">${s[0]}</div>
           <div class="sub" style="color:var(--ink2);font-size:16px">${s[1]}</div>
         </div>
       </div>`;
  return `<div class="layer col" style="flex:1;background:${bg}">
    <div style="flex:none;display:flex;align-items:center;justify-content:space-between;padding:calc(var(--sat) + 18px) 22px 0"><div class="sub" style="color:var(--ink2)">${esc(p?p[0]:'Практика')} · шаг ${step+1} из ${n}</div><button class="sub" data-a="pop" style="color:var(--ink2)">Выйти</button></div>
    <div style="flex:none;padding:14px 22px 0"><div style="height:4px;border-radius:2px;background:rgba(58,58,60,.1);overflow:hidden"><div style="width:${pct}%;height:100%;background:#A6BFA4;transition:width .4s"></div></div></div>
    ${body}
    <div style="flex:none;padding:0 22px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:10px">
        ${step>0?`<button style="width:64px;min-height:52px;display:flex;align-items:center;justify-content:center;border-radius:16px;background:#fff;border:1px solid rgba(58,58,60,.1)" data-a="practice-back">${svg(IC.back,{stroke:'#3A3A3C',sw:1.8,size:20})}</button>`:''}
        <button class="btn btn-primary" data-a="practice-next" style="flex:1">${last?'Завершить':'Дальше'}</button>
      </div>
    </div>
  </div>`;
}
function practiceDone(){
  const p=PRACTICES[V.pracId||0];
  return `<div class="layer col" style="flex:1;background:#F4F7F3">
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:0 30px;text-align:center">
      <div style="width:120px;height:120px;position:relative;display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;inset:0;border-radius:50%;background:#DCE8DA;animation:${anim('aura','om-aura 6s ease-in-out infinite')}"></div>
        ${svg('M6 12l4 4 8-9',{stroke:'#4E6B4C',sw:2.2,size:40})}
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="big" style="font-size:26px">Практика завершена</div>
        <div class="sub" style="color:var(--ink2);font-size:16px">${esc(p?p[0]:'')} — вы уделили себе несколько минут. Как вы сейчас?</div>
      </div>
      <div style="display:flex;gap:6px;width:100%">${moodRow('icons2')}</div>
    </div>
    <div style="flex:none;padding:12px 22px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-primary" data-a="practice-save">Сохранить в дневник</button>
      <button class="btn btn-soft" data-a="pop">Готово</button>
    </div>
  </div>`;
}

/* --------- new entry (12) & view entry (13) ---------- */
function pushNewEntry(){
  V.entryDraft = V.entryDraft || {mood:S.mood, intensity:S.intensity, what:'', thoughts:'', support:''};
  const d=V.entryDraft;
  const scale=Array.from({length:10},(_,i)=>`<button data-a="intensity" data-i="${i}" style="flex:1;height:${16+i*3}px;border-radius:7px;background:${i<d.intensity?'#9FB6C4':'rgba(58,58,60,.1)'}"></button>`).join('');
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;display:flex;align-items:center;gap:12px;padding:calc(var(--sat) + 18px) 20px 10px"><div style="flex:1;font-size:17px;font-weight:600">Новая запись</div><button class="sub" data-a="pop" style="color:var(--ink3);font-size:16px">Отмена</button></div>
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-direction:column;gap:10px"><div style="font-size:16px;font-weight:600">Как вы себя чувствуете?</div>
        <div style="display:flex;gap:6px">${moodRow('icons')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><div style="font-size:16px;font-weight:600">Насколько сильно?</div><div style="font-size:15px;color:var(--blue);font-weight:600">${d.intensity} из 10</div></div>
        <div style="display:flex;gap:5px;align-items:flex-end;height:44px">${scale}</div>
        <div style="display:flex;justify-content:space-between" class="tiny"><span>слабо</span><span>очень сильно</span></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px">
        <label style="display:flex;flex-direction:column;gap:7px"><div style="font-size:15px;font-weight:600">Что произошло? <span style="font-weight:400;color:var(--ink4)">— необязательно</span></div><textarea class="field" id="e-what" rows="2" placeholder="Например: разговор на планёрке">${esc(d.what)}</textarea></label>
        <label style="display:flex;flex-direction:column;gap:7px"><div style="font-size:15px;font-weight:600">Какие мысли появились? <span style="font-weight:400;color:var(--ink4)">— необязательно</span></div><textarea class="field" id="e-thoughts" rows="2" placeholder="Можно пропустить">${esc(d.thoughts)}</textarea></label>
        <label style="display:flex;flex-direction:column;gap:7px"><div style="font-size:15px;font-weight:600">Что могло бы сейчас поддержать вас?</div><textarea class="field" id="e-support" rows="2" placeholder="Можно пропустить">${esc(d.support)}</textarea></label>
      </div>
    </div>
    <div style="flex:none;padding:12px 20px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-primary" data-a="entry-save">Сохранить запись</button>
      <button class="btn btn-soft" data-a="entry-discuss">Обсудить с ИИ</button>
    </div>
  </div>`;
}
function pushViewEntry(i){
  const e=S.entries[i]; if(!e) return pushHistory();
  return `<div class="layer col" style="flex:1">
    ${backHeader('Запись', `<button class="iconbtn">${svg(IC.dots,{stroke:'#8A8A8E',sw:2,size:22})}</button>`)}
    <div class="scroll" style="padding:6px 20px;display:flex;flex-direction:column;gap:16px">
      <div class="card" style="padding:18px;display:flex;flex-direction:column;gap:14px">
        <div style="display:flex;align-items:center;gap:12px">
          ${moodShape(e.mood,{size:34,sw:1.7})}
          <div style="flex:1;display:flex;flex-direction:column;gap:2px"><div style="font-size:17px;font-weight:600">${cap(MOODS[e.mood][0])}</div><div class="sub" style="color:var(--ink3)">${esc(e.when)}${e.intensity?` · интенсивность ${e.intensity} из 10`:''}</div></div>
        </div>
        <div style="height:1px;background:var(--line2)"></div>
        ${e.text?field('Что произошло',e.text):''}
        ${e.thoughts?field('Мысли',e.thoughts):''}
        ${e.support?field('Что поддержало бы',e.support):''}
        ${e.tag?`<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="tag" style="padding:5px 11px;font-size:13px">${esc(e.tag)}</span></div>`:''}
      </div>
      <div style="background:var(--lav-t);border-radius:20px;padding:16px;font-size:15px;line-height:1.55;color:#5A5068">Похоже, эта ситуация вызвала у вас эмоции. Хотите вернуться к ней в разговоре?</div>
    </div>
    <div style="flex:none;padding:12px 20px calc(30px + var(--sab));display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-primary" data-a="discuss-entry" data-i="${i}">Обсудить с Леей</button>
      <button class="btn btn-soft" data-a="pop">Редактировать</button>
    </div>
  </div>`;
}
function field(label,val){ return `<div style="display:flex;flex-direction:column;gap:5px"><div class="eyebrow">${label}</div><div style="font-size:16px;line-height:1.55">${esc(val)}</div></div>`; }

/* --------- settings: reminders(18), privacy(19), data(20), safety, about ---------- */
function pushReminders(){
  const rows=[
    ['Напоминание отметить настроение','Мягкое, один раз в день'],
    ['Итоги дня','Короткая вечерняя рефлексия'],
    ['Предложения практик','Когда вы отмечаете напряжение'],
  ];
  const freqs=['Раз в день','2 раза','Не надо'];
  return `<div class="layer col" style="flex:1">
    ${backHeader('Напоминания')}
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px">
      <div class="grouped">${rows.map((r,i)=>`<div class="row" style="min-height:60px;padding:12px 16px"><div style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:16px">${r[0]}</span><span class="tiny">${r[1]}</span></div>${toggle(S.toggles[i],'tgl',i)}</div>`).join('')}</div>
      <div style="display:flex;flex-direction:column;gap:8px"><div class="eyebrow" style="padding:0 4px">Частота</div>
        <div style="display:flex;gap:8px">${freqs.map((f,i)=>`<button class="pill ${i===S.freq?'pill-on':'pill-off'}" data-a="freq" data-i="${i}" style="flex:1;justify-content:center;min-height:44px;font-size:15px;font-weight:600">${f}</button>`).join('')}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px${S.freq===2?';opacity:.4;pointer-events:none':''}"><div class="eyebrow" style="padding:0 4px">Время</div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${[8,9,12,18,20,21,22].map(hh=>`<button class="pill ${hh===(S.remHour||21)?'pill-on':'pill-off'}" data-a="rem-hour" data-h="${hh}" style="justify-content:center;min-height:44px;font-size:15px;font-weight:600;flex:1">${String(hh).padStart(2,'0')}:00</button>`).join('')}</div>
      </div>
      <div style="background:var(--beige);border-radius:18px;padding:14px 16px" class="sub">Напоминания приходят мягко и без давления. Пропущенный день ничего не значит.</div>
    </div>
    <div style="flex:none;padding:12px 20px calc(30px + var(--sab))"><button class="btn btn-primary" data-a="save-reminders">Сохранить</button></div>
  </div>`;
}
function toggle(on, act, i){ return `<button data-a="${act}" data-i="${i??''}" style="width:50px;height:30px;border-radius:15px;background:${on?'var(--blue)':'rgba(58,58,60,.16)'};padding:3px;display:flex;justify-content:${on?'flex-end':'flex-start'};flex:none;transition:background .2s"><div style="width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18)"></div></button>`; }
function pushPrivacy(){
  const rows=[
    ['Отметки настроения','Чтобы показывать наблюдения за неделю'],
    ['Записи дневника','Чтобы вы могли к ним вернуться'],
    ['История разговоров','Чтобы Лея помнила контекст. Можно отключить'],
    ['Настройки и цели','Чтобы тон общения оставался тем же'],
  ];
  return `<div class="layer col" style="flex:1">
    ${backHeader('Приватность')}
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px">
      <div style="background:var(--blue-t);border-radius:20px;padding:16px;display:flex;gap:12px;align-items:flex-start">${svg('M5 10.5h14v9.5H5zM8.5 10.5V8a3.5 3.5 0 017 0v2.5',{stroke:'#4A6675',size:22})}<div style="font-size:15px;line-height:1.5;color:#3D5867">Записи и переписка хранятся, чтобы вы могли к ним вернуться и видеть наблюдения. Их можно удалить в любой момент.</div></div>
      <div style="display:flex;flex-direction:column;gap:8px"><div class="eyebrow" style="padding:0 4px">Что сохраняется</div>
        <div class="grouped">${rows.map(r=>`<div class="row" style="flex-direction:column;align-items:flex-start;gap:3px;padding:14px 16px"><div style="font-size:16px">${r[0]}</div><div class="sub" style="color:var(--ink3);font-size:14px">${r[1]}</div></div>`).join('')}</div>
      </div>
      <div class="card" style="padding:14px 16px;display:flex;align-items:center;gap:12px">
        <div style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:16px">Не сохранять историю</span><span class="tiny">Разговоры будут стираться после закрытия</span></div>
        ${toggle(S.historyOff,'history-off')}
      </div>
      <div class="grouped">
        <button class="row" data-a="safety" style="text-align:left;width:100%;font-size:16px">Правила безопасного использования</button>
        <button class="row" data-a="privacy-policy" style="text-align:left;width:100%;font-size:16px">Политика конфиденциальности</button>
        <button class="row" data-a="terms" style="text-align:left;width:100%;font-size:16px">Условия использования</button>
        <button class="row" data-a="data" style="text-align:left;width:100%;font-size:16px">Управление данными${svg(IC.chevR,{stroke:'#C4C2BD',sw:2,size:16})}</button>
      </div>
    </div>
  </div>`;
}
function pushData(){
  const counts=[[S.entries.length,pluralRu(S.entries.length,'запись','записи','записей')],[(S.dialogs||0),pluralRu(S.dialogs||0,'диалог','диалога','диалогов')],[((S.moodLog||[]).length),pluralRu((S.moodLog||[]).length,'отметка','отметки','отметок')]];
  return `<div class="layer col" style="flex:1">
    ${backHeader('Мои данные')}
    <div class="scroll" style="padding:6px 20px 8px;display:flex;flex-direction:column;gap:14px">
      <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
        <div style="font-size:16px;font-weight:600">Сейчас хранится</div>
        <div style="display:flex;gap:10px">${counts.map(c=>`<div style="flex:1;background:var(--beige2);border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:2px"><span style="font-size:20px;font-weight:600">${c[0]}</span><span class="tiny" style="color:var(--ink3)">${c[1]}</span></div>`).join('')}</div>
      </div>
      <div class="grouped">
        <button class="row" data-a="export" style="font-size:16px;width:100%;text-align:left"><span style="flex:1">Экспортировать записи</span>${isPlus()?`<span class="sub" style="color:var(--ink3)">CSV</span>`:`<span class="lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A7440" stroke-width="1.8" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="9.5" rx="3"></rect><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"></path></svg>Plus</span>`}</button>
        <button class="row" style="font-size:16px;width:100%;text-align:left">Удалить отдельный диалог</button>
        <button class="row" data-a="ask-delete" style="font-size:16px;width:100%;text-align:left">Удалить все записи дневника</button>
      </div>
      <div style="background:var(--beige);border-radius:18px;padding:14px 16px" class="sub">Удаление необратимо. Мы сначала спросим подтверждение.</div>
      <button class="btn" data-a="ask-delete" style="background:#fff;border:1.5px solid var(--danger3);color:var(--danger2);font-size:16px">Удалить аккаунт и все данные</button>
    </div>
  </div>`;
}
function pushSafety(){
  return `<div class="layer col" style="flex:1">
    ${backHeader('Безопасное использование')}
    <div class="scroll" style="padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px">
      <div style="background:var(--lav-t);border-radius:20px;padding:16px;font-size:15px;line-height:1.55;color:#5A5068">Within и Лея — это пространство для поддержки и самоанализа. Лея — ИИ-собеседник: она не является врачом или психологом и не ставит диагнозов.</div>
      ${['Сервис не заменяет профессиональную помощь. При тяжёлом состоянии обратитесь к специалисту.','Если вы чувствуете угрозу жизни — своей или чужой — свяжитесь с экстренной службой.','Всё, что вы пишете, остаётся у вас. Вы в любой момент можете удалить данные.']
        .map(t=>`<div class="card" style="padding:15px 16px;font-size:15px;line-height:1.55">${t}</div>`).join('')}
      <button class="btn" data-a="crisis" style="background:#fff;border:1.5px solid var(--danger3);color:var(--danger2);font-size:16px">Мне нужна срочная помощь</button>
    </div>
  </div>`;
}
function legalDoc(title, updated, note, sections){
  return `<div class="layer col" style="flex:1">
    ${backHeader(title)}
    <div class="scroll" style="padding:6px 20px 24px;display:flex;flex-direction:column;gap:16px">
      <div class="tiny" style="color:var(--ink4)">Обновлено: ${updated}</div>
      ${note?`<div class="tiny" style="background:var(--beige);border-radius:16px;padding:12px 14px;line-height:1.5">${note}</div>`:''}
      ${sections.map(s=>`<div style="display:flex;flex-direction:column;gap:6px"><div class="eyebrow">${s[0]}</div><div style="font-size:15px;line-height:1.6">${s[1]}</div></div>`).join('')}
      <div class="tiny" style="line-height:1.5;color:var(--ink4)">Within by Kapin Group. Это пространство поддержки, а не медицинская помощь.</div>
    </div>
  </div>`;
}
function pushPrivacyPolicy(){
  return legalDoc('Политика конфиденциальности','август 2026',
  'Черновик-шаблон. Перед публичным запуском согласуйте с юристом и подставьте реквизиты оператора и контакты.', [
    ['Кто обрабатывает данные','Приложение Within (by Kapin Group). Оператор данных: [укажите юридическое лицо и контакт]. Вопросы о данных — в разделе «Написать в поддержку».'],
    ['Что хранится на вашем устройстве','Отметки настроения, записи дневника, настройки и история разговоров хранятся локально в Telegram (localStorage) на вашем устройстве и не передаются нам, кроме случая ниже.'],
    ['Что хранится на сервере','Ваш Telegram ID, статус и срок подписки, настройки напоминаний и часовой пояс, идентификаторы платежей Telegram, служебные счётчики. Тексты дневника на сервере не хранятся.'],
    ['Обработка сообщений ИИ','Сообщения, которые вы пишете Лее, отправляются провайдеру ИИ (xAI, модель Grok) для формирования ответа. На нашем сервере переписка не сохраняется. Не делитесь с Леей данными, которые не хотите передавать.'],
    ['Оплаты','Подписка оформляется через Telegram Stars. Платёжные реквизиты обрабатывает Telegram — мы их не видим и не храним, только идентификатор платежа для выдачи доступа и возвратов.'],
    ['Зачем это нужно','Предоставление сервиса и подписки, отправка напоминаний, защита от злоупотреблений и контроль расходов, поддержка пользователей.'],
    ['Кому передаём','xAI (обработка сообщений ИИ моделью Grok) и Telegram (доставка и платежи). Мы не продаём ваши данные и не используем их для рекламы.'],
    ['Хранение и удаление','Данные на устройстве вы удаляете сами: «Профиль → Приватность → Мои данные → Удалить все данные». Удаление серверных данных — по запросу в поддержку.'],
    ['Дети','Сервис не предназначен для лиц младше 16 лет. Несовершеннолетним — только с согласия родителей или законных представителей.'],
    ['Изменения','Мы можем обновлять политику. Существенные изменения покажем в приложении.'],
  ]);
}
function pushTerms(){
  return legalDoc('Условия использования','август 2026',
  'Черновик-шаблон. Перед публичным запуском согласуйте с юристом и подставьте реквизиты и контакты.', [
    ['Что такое Within','Сервис эмоциональной поддержки и самонаблюдения с ИИ-собеседником по имени Лея. Это не медицинская и не психологическая помощь: Лея не врач и не психолог, не ставит диагнозов и не назначает лечение.'],
    ['Если вам угрожает опасность','При мыслях о причинении вреда себе или другим немедленно обратитесь за помощью: экстренные службы 112 и контакты на экране «Срочная помощь». Приложение не может вызвать помощь за вас.'],
    ['Возраст','Использование — с 16 лет; несовершеннолетним — с согласия родителей.'],
    ['Подписка Within Plus','Открывает безлимитные разговоры, голос, все практики, тренды и экспорт. Тариф «Месяц» — подписка Telegram Stars с автопродлением раз в 30 дней; отменить можно в любой момент, доступ сохраняется до конца оплаченного срока. «Неделя» и «Год» — разовые покупки без автопродления.'],
    ['Оплаты и возвраты','Оплата проходит через Telegram Stars по правилам Telegram. Возврат — по запросу в поддержку и в соответствии с правилами Telegram Stars.'],
    ['Допустимое использование','Не используйте сервис во вред себе или другим и не пытайтесь обходить лимиты, оплату или технические ограничения.'],
    ['Ответственность','Сервис предоставляется «как есть». Ответы ИИ могут содержать ошибки и не являются профессиональной рекомендацией — окончательные решения принимаете вы.'],
    ['Изменения','Мы можем обновлять условия; актуальная версия — в приложении.'],
  ]);
}
function pushAbout(){
  const demos=[['Нет подключения','offline'],['Пустой дневник / ошибка','empty'],['Критическая ситуация','crisis'],['Подтверждение удаления','ask-delete'],[isPlus()?'Сбросить Within Plus (демо)':'Открыть Within Plus','plus-reset']];
  return `<div class="layer col" style="flex:1">
    ${backHeader('О приложении')}
    <div class="scroll" style="padding:6px 20px 20px;display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0">
        ${avatar(88)}
        <div style="text-align:center;display:flex;flex-direction:column;gap:6px"><div class="h2">Within</div><div class="sub" style="color:var(--ink3)">Личный ИИ-собеседник · by Kapin Group</div><div class="tiny">версия 1.0</div></div>
      </div>
      <div style="background:var(--beige);border-radius:20px;padding:16px" class="sub" style="color:var(--ink2);line-height:1.55">Within помогает разобраться в мыслях и эмоциях без критики и осуждения. Это не медицинский сервис.</div>
      <div style="display:flex;flex-direction:column;gap:8px"><div class="eyebrow" style="padding:0 4px">Демо · особые состояния</div>
        <div class="grouped">${demos.map(d=>`<button class="row" data-a="demo" data-d="${d[1]}" style="text-align:left;width:100%;font-size:16px"><span style="flex:1">${d[0]}</span>${svg(IC.chevR,{stroke:'#C4C2BD',sw:2,size:16})}</button>`).join('')}</div>
      </div>
      <button class="btn btn-soft" data-a="reset-onboarding">Пройти онбординг заново</button>
    </div>
  </div>`;
}

/* --------- paywall: Within Plus ---------- */
function pushPaywall(sc){
  if(!V.plan) V.plan='plan_month';
  if((sc&&sc.reason==='manage') || isPlus()) return paywallManage();
  const copy = PAYWALL_COPY[(sc&&sc.reason)||''] || PAYWALL_COPY[''];
  const plan = planById(V.plan);
  return `<div class="layer col" style="flex:1">
    <div class="topbar"><button class="iconbtn" data-a="pop">${svg('M18 6L6 18M6 6l12 12',{stroke:'#8A8A8E',sw:1.8,size:22})}</button><div class="ttl"></div><div style="width:34px"></div></div>
    <div class="scroll" style="padding:0 20px 8px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:2px 6px 0">
        <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#EFE9F4,#EAF0F3);display:flex;align-items:center;justify-content:center">${avatar(72)}</div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#8E7FA8">Within Plus</div>
          <div class="big" style="font-size:26px">${copy[0]}</div>
          <div class="sub" style="color:var(--ink2);font-size:16px">${copy[1]}</div>
        </div>
      </div>
      <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
        ${PLUS_FEATURES.map(f=>`<div style="display:flex;align-items:center;gap:12px"><div style="width:26px;height:26px;border-radius:50%;background:var(--green-t);display:flex;align-items:center;justify-content:center;flex:none">${svg(f[1],{stroke:'#5E7D5C',sw:1.8,size:16})}</div><span style="font-size:15px">${f[0]}</span></div>`).join('')}
      </div>
      <div style="display:flex;flex-direction:column;gap:11px;margin-top:2px">
        ${PLANS.map(p=>{ const on=p.id===V.plan; return `<button class="plan ${on?'on':''}" data-a="plan" data-p="${p.id}">
          ${p.badge?`<span class="badge ${p.id==='plan_year'?'save':''}">${p.badge}</span>`:''}
          <div class="radio">${on?'<div></div>':''}</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:2px"><div style="font-size:16px;font-weight:600">${p.label}</div><div class="tiny" style="color:var(--ink3)">${p.per}</div></div>
          <div style="font-size:18px;font-weight:700;white-space:nowrap">${p.stars} ⭐</div>
        </button>`;}).join('')}
      </div>
    </div>
    <div style="flex:none;padding:12px 20px calc(30px + var(--sab));display:flex;flex-direction:column;gap:8px">
      <button class="btn btn-primary" data-a="buy-plus">${plan.sub?`Подписаться · ${plan.stars} ⭐/мес`:`Оформить за ${plan.stars} ⭐`}</button>
      <button class="btn-link" data-a="restore-plus" style="color:var(--ink3)">Восстановить покупку</button>
      <div class="tiny" style="text-align:center;line-height:1.5">${plan.sub?'Автопродление раз в 30 дней, отмена в любой момент.':'Разовая покупка — автоматически не продлевается.'} Оплата через Telegram Stars. Within — сервис поддержки, не медицинская помощь.</div>
    </div>
  </div>`;
}
function paywallManage(){
  return `<div class="layer col" style="flex:1">
    ${backHeader('Within Plus')}
    <div class="scroll" style="padding:6px 20px 20px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:10px 6px 0">
        <div style="width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,#EFE9F4,#EAF0F3);display:flex;align-items:center;justify-content:center">${avatar(72)}</div>
        <div style="display:flex;flex-direction:column;gap:6px"><div class="h1">Within Plus активен</div><div class="sub" style="color:var(--ink2);font-size:16px">Спасибо, что вы с нами.${S.sub?(plusUntilLabel()?' Продлевается автоматически, следующее списание — '+esc(plusUntilLabel())+'.':' Продлевается автоматически.'):(plusUntilLabel()?' Доступ открыт до '+esc(plusUntilLabel())+'.':'')}</div></div>
      </div>
      <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
        ${PLUS_FEATURES.map(f=>`<div style="display:flex;align-items:center;gap:12px">${svg('M4 12l5 5L20 6',{stroke:'#5E7D5C',sw:2,size:18})}<span style="font-size:15px">${f[0]}</span></div>`).join('')}
      </div>
      ${S.sub?`<button class="btn-link" data-a="cancel-sub" style="color:var(--danger2)">Отменить автопродление</button>`:''}
      <button class="btn btn-soft" data-a="pop">Готово</button>
    </div>
  </div>`;
}

/* --------- crisis(23), offline(21) demo ---------- */
function pushCrisis(){
  return `<div class="layer col" style="flex:1;background:#F7F4F1">
    <div style="flex:none;padding:calc(var(--sat) + 24px) 22px 0;display:flex;flex-direction:column;gap:20px">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="27" fill="#EFE7E4"></circle><path d="M28 16v14M28 36v.3" stroke="#8C6058" stroke-width="2.6" stroke-linecap="round"></path></svg>
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="h1" style="font-size:24px">То, о чём вы написали, звучит очень серьёзно</div>
        <div class="sub" style="color:#5E5A57;font-size:16px">Сейчас важно, чтобы рядом был человек, который может помочь. Я останусь на связи, но я не могу вызвать помощь за вас.</div>
      </div>
    </div>
    <div class="scroll" style="padding:22px;display:flex;flex-direction:column;gap:12px">
      <a href="tel:112" class="btn btn-danger" style="text-decoration:none">${svg(IC.phone,{stroke:'#fff',sw:1.9,size:20})}Позвонить 112</a>
      <div class="grouped">
        ${CRISIS_CONTACTS.map(c=>`<a href="tel:${c[3]}" class="row" style="min-height:60px;padding:12px 16px;text-decoration:none;color:var(--ink)"><div style="flex:1;display:flex;flex-direction:column;gap:2px"><span style="font-size:16px">${c[0]}</span><span class="tiny">${c[1]}</span></div><span style="font-size:15px;font-weight:600;color:var(--blue);white-space:nowrap">${c[2]}</span></a>`).join('')}
      </div>
      <div class="tiny" style="line-height:1.5;padding:0 4px">Если вы не в России — позвоните в местную экстренную службу или на кризисную линию вашей страны. Найти линию: <a href="https://findahelpline.com" style="color:var(--blue)">findahelpline.com</a>.</div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:12px">
        <div class="sub" style="color:var(--ink3)">Если вам сейчас нужно просто говорить — я рядом. Но я не заменяю живого человека и не могу вызвать помощь за вас.</div>
        <button class="btn btn-soft2" data-a="pop">Остаться в приложении</button>
      </div>
    </div>
  </div>`;
}
function pushOfflineDemo(){
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;display:flex;align-items:center;gap:12px;padding:calc(var(--sat) + 14px) 18px 12px;border-bottom:1px solid var(--line2)"><button class="iconbtn" data-a="pop">${svg(IC.back,{stroke:'#8A8A8E',sw:1.8,size:20})}</button><div style="flex:1;font-size:16px;font-weight:600">Лея</div><div class="tiny">нет связи</div></div>
    <div style="flex:1;padding:16px;display:flex;flex-direction:column;gap:12px">
      <div style="align-self:flex-end;max-width:80%;background:var(--blue-t2);border-radius:20px 20px 6px 20px;padding:12px 15px;font-size:16px;line-height:1.5;opacity:.55">Не могу перестать думать о завтрашней встрече</div>
      <div style="align-self:flex-end;display:flex;align-items:center;gap:6px" class="tiny">${svg('M12 8v4l3 2M12 3a9 9 0 100 18 9 9 0 000-18z',{stroke:'#A2A29F',sw:2,size:14})}не отправлено</div>
      <div style="margin-top:auto;background:var(--beige);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px;align-items:flex-start">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" stroke="#8A8A8E" stroke-width="1.7" stroke-linecap="round"><path d="M8 18c8-7 20-7 28 0M13 25c5-4 13-4 18 0M19 32c2-1.5 4-1.5 6 0"></path><path d="M34 10L10 34" stroke="#A9645A"></path></svg>
        <div style="font-size:17px;font-weight:600">Не удалось подключиться</div>
        <div class="sub" style="color:var(--ink2);font-size:15px">Проверьте интернет и попробуйте ещё раз. Ваше сообщение сохранено.</div>
        <button class="pill pill-on" data-a="pop" style="min-height:44px;padding:0 20px;font-weight:600">Повторить</button>
      </div>
    </div>
    <div style="flex:none;display:flex;align-items:flex-end;gap:9px;padding:12px 14px calc(24px + var(--sab))">
      <div class="field" style="flex:1;min-height:48px;display:flex;align-items:center;border-radius:22px;color:var(--ink)">Не могу перестать думать о завтр…</div>
      <div class="send" style="background:#C9D4DA">${svg(IC.send,{stroke:'#fff',sw:2,size:21})}</div>
    </div>
  </div>`;
}

/* --------- delete sheet (24) ---------- */
let deleteChecked=false;
function modalDelete(){
  return `<div class="scrim" data-a="modal-close"></div>
  <div class="sheet">
    <div class="grip"></div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="h2" style="font-size:22px">Удалить все данные?</div>
      <div class="sub" style="color:var(--ink2);font-size:16px">Будут удалены ${S.entries.length} ${pluralRu(S.entries.length,'запись','записи','записей')} дневника, ${S.dialogs||0} ${pluralRu(S.dialogs||0,'диалог','диалога','диалогов')} и все отметки настроения. Восстановить их будет нельзя.</div>
    </div>
    <button data-a="del-check" style="background:#fff;border-radius:18px;border:1px solid var(--line);padding:14px 16px;display:flex;gap:12px;align-items:center;text-align:left;width:100%">
      <div style="width:22px;height:22px;border-radius:7px;border:1.5px solid ${deleteChecked?'#C08A80':'rgba(58,58,60,.25)'};background:${deleteChecked?'#C08A80':'transparent'};display:flex;align-items:center;justify-content:center;flex:none">${deleteChecked?svg('M2.5 6.4L4.8 8.6L9.5 3.6',{stroke:'#fff',sw:2,size:12,vb:'0 0 12 12'}):''}</div>
      <div style="font-size:15px;line-height:1.45">Я понимаю, что это действие необратимо</div>
    </button>
    <div style="display:flex;flex-direction:column;gap:10px">
      <button class="btn ${deleteChecked?'btn-danger2':''}" data-a="confirm-delete" style="${deleteChecked?'':'background:#EFDDD9;color:#C09A93'}">Удалить всё</button>
      <button class="btn btn-soft2" data-a="modal-close">Оставить как есть</button>
    </div>
  </div>`;
}

/* ============================ ONBOARDING ============================ */
function screenOnboarding(){
  const s=V.obSlide;
  if(s===0) return obWelcome();
  if(s===1) return obSlide();
  if(s===2) return obGoals();
  return obStyle();
}
function obWelcome(){
  return `<div class="layer col" style="flex:1">
    <div class="scroll" style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 30px;gap:30px;text-align:center">
      <svg width="132" height="132" viewBox="0 0 132 132"><circle cx="66" cy="66" r="64" fill="#F1ECF4"></circle><circle cx="66" cy="66" r="45" fill="#E8E1EE"></circle><path d="M28 78c14 0 19-22 38-22s24 22 38 22" fill="none" stroke="#8E7FA8" stroke-width="3" stroke-linecap="round"></path><path d="M28 92c14 0 19-15 38-15s24 15 38 15" fill="none" stroke="#8E7FA8" stroke-width="2" stroke-linecap="round" opacity=".45"></path></svg>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div style="font-size:14px;letter-spacing:.28em;text-transform:uppercase;color:#8E7FA8">Within</div>
        <div class="big">Пространство, где можно быть собой</div>
        <div class="sub" style="color:var(--ink2);font-size:16px">Расскажите, что вас беспокоит. ИИ-собеседник поможет разобраться в мыслях и эмоциях без критики и осуждения.</div>
      </div>
    </div>
    <div style="flex:none;padding:0 22px calc(30px + var(--sab));display:flex;flex-direction:column;gap:14px">
      <div style="background:var(--beige);border-radius:16px;padding:14px 16px" class="sub">Сервис предназначен для эмоциональной поддержки и самоанализа. Он не заменяет профессиональную медицинскую или психологическую помощь.</div>
      <button class="btn btn-primary" data-a="ob-next">Начать</button>
      <button class="btn-link" data-a="ob-how">Как это работает</button>
      <div style="text-align:center;font-size:13px;letter-spacing:.06em;color:#A2A29F">by Kapin Group</div>
    </div>
  </div>`;
}
const INTRO = [
  [`<svg width="150" height="120" viewBox="0 0 150 120"><rect x="6" y="18" width="94" height="52" rx="20" fill="#E4EAEE"></rect><rect x="52" y="58" width="92" height="46" rx="18" fill="#E6EDE3"></rect><path d="M22 36h58M22 50h40" stroke="#9FB6C4" stroke-width="3" stroke-linecap="round"></path><path d="M68 76h58M68 88h34" stroke="#A6BFA4" stroke-width="3" stroke-linecap="round"></path></svg>`,
   'Расскажите, что происходит',
   'Пишите свободно, коротко или подробно. Лея выслушает без осуждения — здесь нет правильных и неправильных ответов.'],
  [`<svg width="160" height="118" viewBox="0 0 160 118"><path d="M12 84 L48 58 L84 70 L120 34 L148 48" fill="none" stroke="#9FB6C4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="84" r="5" fill="#9FB6C4"></circle><circle cx="48" cy="58" r="5" fill="#9FB6C4"></circle><circle cx="84" cy="70" r="5" fill="#9FB6C4"></circle><circle cx="120" cy="34" r="6.5" fill="#5F7D8F"></circle><circle cx="148" cy="48" r="5" fill="#9FB6C4"></circle></svg>`,
   'Отмечайте настроение',
   'Пара касаний в день — и вы увидите, как меняется ваше состояние за неделю. Дневник и наблюдения остаются только у вас.'],
  [`<svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="60" fill="#DCE8DA"></circle><circle cx="65" cy="65" r="40" fill="none" stroke="#A6BFA4" stroke-width="2"></circle><circle cx="65" cy="65" r="20" fill="#A6BFA4" opacity=".5"></circle></svg>`,
   'Практики под рукой',
   'Дыхание, заземление и короткие техники — на случай, когда нужно быстро прийти в себя.'],
];
function obSlide(){
  const n=V.intro||0; const it=INTRO[n]; const last=n===INTRO.length-1;
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;display:flex;justify-content:space-between;align-items:center;padding:calc(var(--sat) + 18px) 22px 0">
      <div style="display:flex;gap:6px">${INTRO.map((_,i)=>`<div style="width:22px;height:4px;border-radius:2px;background:${i===n?'#5F7D8F':'rgba(58,58,60,.14)'};transition:background .2s"></div>`).join('')}</div>
      <button class="sub" data-a="ob-skip" style="color:var(--ink3);font-size:15px">Пропустить</button>
    </div>
    <div class="scroll" style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:0 30px;gap:28px;text-align:center">
      ${it[0]}
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="h1" style="font-size:26px">${it[1]}</div>
        <div class="sub" style="color:var(--ink2);font-size:16px">${it[2]}</div>
      </div>
    </div>
    <div style="flex:none;padding:0 22px calc(30px + var(--sab))"><button class="btn btn-primary" data-a="ob-next">${last?'Продолжить':'Далее'}</button></div>
  </div>`;
}
function obGoals(){
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;padding:calc(var(--sat) + 22px) 22px 14px;display:flex;flex-direction:column;gap:8px">
      <div class="h1">Что сейчас важнее?</div>
      <div class="sub" style="color:var(--ink3)">Можно выбрать несколько. Это можно изменить в любой момент.</div>
    </div>
    <div class="scroll" style="padding:0 22px;display:flex;flex-direction:column;gap:10px">
      ${GOALS.map((g,i)=>{ const on=V.obGoals.includes(i); return `<button class="row" data-a="ob-goal" data-i="${i}" style="min-height:56px;display:flex;align-items:center;gap:12px;padding:0 16px;border-radius:18px;background:#fff;border:1.5px solid ${on?'var(--blue)':'var(--line)'};font-size:16px;text-align:left;width:100%">
        <div style="width:22px;height:22px;border-radius:7px;border:1.5px solid ${on?'var(--blue)':'rgba(58,58,60,.22)'};background:${on?'var(--blue)':'transparent'};display:flex;align-items:center;justify-content:center;flex:none">${on?svg('M2.5 6.4L4.8 8.6L9.5 3.6',{stroke:'#fff',sw:2,size:12,vb:'0 0 12 12'}):''}</div>
        <span>${g}</span>
      </button>`; }).join('')}
    </div>
    <div style="flex:none;padding:16px 22px calc(30px + var(--sab))"><button class="btn btn-primary" data-a="ob-next">Далее</button></div>
  </div>`;
}
function obStyle(){
  return `<div class="layer col" style="flex:1">
    <div style="flex:none;padding:calc(var(--sat) + 22px) 22px 14px;display:flex;flex-direction:column;gap:8px">
      <div class="h1">Как вам комфортнее общаться?</div>
      <div class="sub" style="color:var(--ink3)">Лея будет придерживаться этого тона.</div>
    </div>
    <div class="scroll" style="padding:0 22px;display:flex;flex-direction:column;gap:12px">
      ${STYLES.map((s,i)=>{ const on=i===V.obStyle; return `<button data-a="ob-style" data-i="${i}" style="padding:16px;border-radius:20px;background:#fff;border:1.5px solid ${on?'var(--blue)':'var(--line)'};display:flex;gap:12px;align-items:flex-start;text-align:left;width:100%">
        <div style="width:20px;height:20px;border-radius:50%;border:1.5px solid ${on?'var(--blue)':'rgba(58,58,60,.22)'};display:flex;align-items:center;justify-content:center;flex:none;margin-top:2px"><div style="width:10px;height:10px;border-radius:50%;background:var(--blue);opacity:${on?1:0}"></div></div>
        <div style="display:flex;flex-direction:column;gap:5px"><div style="font-size:16px;font-weight:600">${s[0]}</div><div class="sub" style="color:var(--ink3);font-size:14px">${s[1]}</div></div>
      </button>`; }).join('')}
      <div style="margin-top:8px;padding:14px 16px;border-radius:18px;background:var(--lav-t)" class="sub" style="color:var(--ink2)">Лея — ИИ-собеседник, а не врач и не психолог. Она помогает вам смотреть на свои мысли со стороны.</div>
    </div>
    <div style="flex:none;padding:16px 22px calc(30px + var(--sab))"><button class="btn btn-primary" data-a="ob-finish">Перейти к диалогу</button></div>
  </div>`;
}

/* ============================ RENDER ============================ */
function currentTabScreen(){
  switch(V.tab){ case 1: return pushChat(); case 2: return screenDiary(); case 3: return screenProfile(); default: return screenHome(); }
}
function render(){
  let html='';
  if(!S.onboarded){ html=screenOnboarding(); app.innerHTML=html; syncTG(); return; }
  // base
  if(V.tab===1){ html=''; } else { html=`<div class="col" style="flex:1;min-height:0">${V.tab===2?screenDiary():V.tab===3?screenProfile():screenHome()}</div>`; }
  // Actually build base as full screen
  let base;
  if(V.tab===1){ base=pushChat(); } else { base = `<div class="layer" style="position:relative;z-index:1">${V.tab===2?screenDiary():V.tab===3?screenProfile():screenHome()}</div>`; }
  let layers='';
  V.stack.forEach((sc,idx)=>{ layers+=`<div class="stacklayer" data-idx="${idx}">${renderStack(sc)}</div>`; });
  let modal = V.modal? modalDelete() : '';
  app.innerHTML = base + layers + modal;
  // mark top layer for enter anim handled via renderStack wrappers already include .layer
  syncTG();
  if(V.tab===1 && V.stack.length===0){ renderChat(); focusChatMaybe(); }
  // if top of stack is chat variant handled in renderStack
  const top=V.stack[V.stack.length-1];
  if(top && top.id==='chat'){ renderChat(); }
}
function renderStack(sc){
  switch(sc.id){
    case 'chat': return pushChat();
    case 'dialogEntry': return pushDialogEntry();
    case 'history': return pushHistory();
    case 'precall': return pushPrecall();
    case 'incall': return pushIncall();
    case 'postcall': return pushPostcall();
    case 'practices': return pushPractices();
    case 'practice': return pushPractice();
    case 'newEntry': return pushNewEntry();
    case 'viewEntry': return pushViewEntry(sc.i);
    case 'reminders': return pushReminders();
    case 'privacy': return pushPrivacy();
    case 'data': return pushData();
    case 'safety': return pushSafety();
    case 'privacy-policy': return pushPrivacyPolicy();
    case 'terms': return pushTerms();
    case 'about': return pushAbout();
    case 'crisis': return pushCrisis();
    case 'offline': return pushOfflineDemo();
    case 'paywall': return pushPaywall(sc);
    default: return '<div class="layer"></div>';
  }
}

/* ============================ navigation ============================ */
function push(id, params){ V.stack.push(Object.assign({id},params||{})); render(); afterEnter(); haptic('light'); }
V.stack_push = push;
function pop(){ if(V.modal){ V.modal=null; render(); return; }
  const top=V.stack[V.stack.length-1];
  if(top&&top.id==='chat'&&V.chat){ clearInterval(V.chat.iTimer); clearTimeout(V.chat.tTimer); }
  if(top&&(top.id==='incall'||top.id==='precall'||top.id==='postcall')) stopCallTimer();
  V.stack.pop(); render(); }
function go(tab){ if(tab===V.tab && V.stack.length===0){ return; } V.tab=tab; V.stack=[]; V.modal=null; if(tab===1 && !V.chat) V.chat=freshChat(); render(); }
function afterEnter(){ const layers=app.querySelectorAll('.stacklayer .layer'); const last=layers[layers.length-1]; if(last && !rm()) last.classList.add('anim'); }

/* ============================ call timer ============================ */
function startCallTimer(){ stopCallTimer(); if(!V.call)V.call={sec:0}; V.call.t=setInterval(()=>{ V.call.sec++; const el=$('#callTimer'); if(el)el.textContent=fmtTimer(V.call.sec); },1000); }
function stopCallTimer(){ if(V.call&&V.call.t){ clearInterval(V.call.t); V.call.t=null; } }

/* ============================ Telegram ============================ */
function syncTG(){
  if(!tg) return;
  const showBack = !S.onboarded ? V.obSlide>0 : (V.stack.length>0 || V.modal);
  try{
    if(tg.BackButton){ if(showBack) tg.BackButton.show(); else tg.BackButton.hide(); }
  }catch(e){}
}

/* ============================ event handling ============================ */
app.addEventListener('click', e=>{
  const t=e.target.closest('[data-a]'); if(!t) return;
  const a=t.dataset.a; const i=t.dataset.i!=null?+t.dataset.i:null;
  handle(a, t, i, e);
});
function readEntryDraft(){
  if(!V.entryDraft) return; const w=$('#e-what'),th=$('#e-thoughts'),su=$('#e-support');
  if(w)V.entryDraft.what=w.value; if(th)V.entryDraft.thoughts=th.value; if(su)V.entryDraft.support=su.value;
}
function handle(a,t,i,e){
  switch(a){
    /* onboarding */
    case 'ob-next':
      if(V.obSlide===0){ V.obSlide=1; V.intro=0; }
      else if(V.obSlide===1){ if((V.intro||0)<INTRO.length-1) V.intro=(V.intro||0)+1; else V.obSlide=2; }
      else if(V.obSlide===2){ V.obSlide=3; }
      render(); afterEnter(); haptic('light'); break;
    case 'ob-skip': V.obSlide=2; render(); afterEnter(); break;      // пропустить интро → к целям
    case 'ob-how': V.obSlide=1; V.intro=0; render(); afterEnter(); break;
    case 'ob-goal': { const idx=V.obGoals.indexOf(i); if(idx>=0)V.obGoals.splice(idx,1); else V.obGoals.push(i); render(); haptic('sel'); } break;
    case 'ob-style': V.obStyle=i; render(); haptic('sel'); break;
    case 'ob-finish': { S.onboarded=true; S.goals=V.obGoals.slice(); S.style=V.obStyle; save();
      V.chat=freshChat();
      const greet='Здравствуйте'+(USERNAME?', '+USERNAME:'')+'. Я Лея. Рада, что вы здесь. Тут можно говорить свободно, в своём темпе — с чего хотите начать?';
      V.chat.msgs=[{who:'day',text:'Сегодня'},{who:'ai',text:greet}];
      S.dialogs=(S.dialogs||0)+1; save();
      V.stack=[]; V.tab=1; render(); renderChat(); notif('success'); break; }

    /* tabs / nav */
    case 'tab': haptic('sel'); go(i); break;
    case 'pop': pop(); break;
    case 'noop': break;

    /* mood */
    case 'mood': S.mood=i; if(V.entryDraft)V.entryDraft.mood=i; save(); haptic('sel');
      // re-render current view
      render(); break;
    case 'mood-home': S.mood=i; logMood(i); save(); haptic('sel'); render(); toast('Настроение отмечено'); break;
    case 'mark-mood': go(2); V.diaryView='entries'; push('newEntry'); break;

    /* home → dialog */
    case 'dialog-from': case 'dialog-seed': {
      go(1); if(!V.chat)V.chat=freshChat();
      const seed=t.dataset.t; if(seed){ setTimeout(()=>{ chatSend(seed); },60); }
      break; }

    /* chat */
    case 'send': { const inp=$('#chatInput'); const v=inp?inp.value:''; if(inp){inp.value='';inp.style.height='48px';} chatSend(v); break; }
    case 'retry-send': toast('Соединение восстановлено'); V.netOffline=false; break;
    case 'fb': { haptic('light'); const ft=t.dataset.t;
      if(ft==='Объяснить проще') chatSend('Можешь объяснить это проще?');
      else if(ft==='Не совсем') chatSend('Мне это не совсем откликается — можешь посмотреть с другой стороны?');
      else if(ft==='Сохранить') saveThought('ai');
      else toast('Рада, что помогло');
      break; }
    case 'q-mood': push('newEntry'); break;
    case 'q-save': saveThought('me'); break;
    case 'q-ex': { if(!V.chat)V.chat=freshChat(); V.chat.msgs.push({who:'exercise'}); renderChat(); break; }
    case 'ex-later': toast('Хорошо, вернёмся к этому позже'); break;
    case 'open-chat': { const fmt=+t.dataset.fmt; V.chat=freshChat(); V.chat.fmt=fmt; S.dialogs=(S.dialogs||0)+1; save(); V.stack=[]; V.tab=1; render(); renderChat(); break; }
    case 'history': push('history'); break;
    case 'dialog-new': push('dialogEntry'); break;

    /* subscription */
    case 'paywall': openPaywall(t.dataset.r||''); break;
    case 'plan': V.plan=t.dataset.p; render(); haptic('sel'); break;
    case 'buy-plus': buyPlus(); break;
    case 'cancel-sub': cancelSub(); break;
    case 'restore-plus': fetchEntitlement().then(()=>{ if(isPlus()){ V.stack=[]; render(); toast('Подписка восстановлена'); } else toast('Активная подписка не найдена'); }); break;
    case 'export': if(!isPlus()){ openPaywall('export'); } else exportDiary(); break;

    /* voice call */
    case 'start-call': if(!isPlus()){ openPaywall('voice'); break; } push('precall'); break;
    case 'call-go': V.call={sec:0}; V.stack[V.stack.length-1]={id:'incall'}; render(); afterEnter(); startCallTimer(); notif('success'); break;
    case 'call-end': stopCallTimer(); V.stack[V.stack.length-1]={id:'postcall'}; render(); afterEnter(); break;
    case 'call-tochat': stopCallTimer(); pop(); break;
    case 'call-done-chat': pop(); break;
    case 'postcall-save': { addEntry({mood:S.mood, when:'сегодня · после звонка', short:'сегодня', text:'Разговор с руководителем: задел тон, а не содержание. Решил вернуться через день.', tag:'работа', intensity:6, thoughts:'', support:''}); logMood(S.mood); stopCallTimer(); V.stack=[]; V.tab=2; V.diaryView='entries'; render(); toast('Сохранено в дневник'); notif('success'); break; }

    /* practices */
    case 'practices': push('practices'); break;
    case 'breathe': V.pracId=0; V.pracStep=0; V.pracNotes={}; push('practice'); break;
    case 'practice-start': if(i>0 && !isPlus()){ openPaywall('practices'); break; } V.pracId=i; V.pracStep=0; V.pracNotes={}; push('practice'); break;
    case 'practice-next': { const g=practiceSteps(V.pracId||0); const n=g.steps.length; if(g.type==='reflect'){ const inp=$('#pracInput'); if(inp) V.pracNotes[V.pracStep]=inp.value; } if((V.pracStep||0)<n-1){ V.pracStep=(V.pracStep||0)+1; render(); afterEnter(); haptic('light'); } else { V.pracStep=n; S.practicesDone=(S.practicesDone||0)+1; save(); render(); notif('success'); } break; }
    case 'practice-back': { const g=practiceSteps(V.pracId||0); if(g.type==='reflect'){ const inp=$('#pracInput'); if(inp) V.pracNotes[V.pracStep]=inp.value; } if((V.pracStep||0)>0){ V.pracStep--; render(); haptic('light'); } break; }
    case 'practice-save': { const p=PRACTICES[V.pracId||0]; const notes=Object.keys(V.pracNotes).sort((a,b)=>a-b).map(k=>V.pracNotes[k]).filter(x=>x&&x.trim()); const pm=(typeof S.mood==='number'?S.mood:3); addEntry({mood:pm, when:'сегодня · практика', short:'сегодня', text:'Практика «'+(p?p[0]:'')+'»'+(notes.length?': '+notes.join(' · '):' завершена'), tag:'практика', intensity:0, thoughts:'', support:''}); logMood(pm); V.stack=[]; V.tab=2; V.diaryView='entries'; render(); toast('Сохранено в дневник'); notif('success'); break; }

    /* diary */
    case 'diary-view': V.diaryView=t.dataset.v; render(); haptic('sel'); break;
    case 'new-entry': V.entryDraft=null; push('newEntry'); break;
    case 'view-entry': push('viewEntry',{i}); break;
    case 'chart-point': V.point=i; render(); haptic('sel'); break;
    case 'intensity': readEntryDraft(); V.entryDraft.intensity=i+1; render(); haptic('sel'); break;
    case 'entry-save': { readEntryDraft(); const d=V.entryDraft; addEntry({mood:d.mood, when:'сегодня', short:'сейчас', text:d.what||'Запись без описания', tag:'', intensity:d.intensity, thoughts:d.thoughts, support:d.support}); logMood(d.mood); V.entryDraft=null; pop(); V.diaryView='entries'; render(); toast('Запись сохранена'); notif('success'); break; }
    case 'entry-discuss': { readEntryDraft(); const d=V.entryDraft; V.entryDraft=null; V.stack=[]; V.tab=1; V.chat=freshChat(); S.dialogs=(S.dialogs||0)+1; save(); render(); renderChat();
      const seed = d ? ('Хочу обсудить: '+(MOODS[d.mood]?('чувствую «'+MOODS[d.mood][0]+'». '):'')+(d.what||'')) : 'Хочу обсудить свою запись из дневника';
      setTimeout(()=>chatSend(seed.trim()||'Хочу обсудить свою запись из дневника'),80); break; }
    case 'discuss-entry': { const e=S.entries[i]; if(!e) break; V.stack=[]; V.tab=1; V.chat=freshChat(); S.dialogs=(S.dialogs||0)+1; save(); render(); renderChat();
      const seed = 'Хочу обсудить запись из дневника — «'+(MOODS[e.mood]?MOODS[e.mood][0]:'')+'»: '+(e.text||'').replace(/[.\s]+$/,'')+(e.thoughts?('. Мысли: '+e.thoughts):'');
      setTimeout(()=>chatSend(seed),80); break; }

    /* profile */
    case 'edit-name': toast('Имя можно изменить в Telegram-профиле'); break;
    case 'edit-style': push('reminders'); V.stack.pop(); openStylePicker(); break;
    case 'edit-goals': openGoalsPicker(); break;
    case 'reminders': push('reminders'); break;
    case 'rm-toggle': S.rm=!S.rm; save(); document.body.classList.toggle('rm',S.rm); render(); toast(S.rm?'Анимации выключены':'Анимации включены'); break;
    case 'privacy': push('privacy'); break;
    case 'data': push('data'); break;
    case 'safety': push('safety'); break;
    case 'privacy-policy': push('privacy-policy'); break;
    case 'terms': push('terms'); break;
    case 'support': { const url='https://t.me/KapinGroup'; if(tg&&tg.openTelegramLink){ tg.openTelegramLink(url); } else toast('Поддержка: @KapinGroup'); break; }
    case 'about': push('about'); break;
    case 'reset-onboarding': S.onboarded=false; V.obSlide=0; V.intro=0; V.obGoals=S.goals.slice(); V.obStyle=S.style; V.stack=[]; V.tab=0; render(); break;

    /* reminders */
    case 'tgl': S.toggles[i]=!S.toggles[i]; save(); render(); haptic('sel'); break;
    case 'freq': S.freq=i; save(); render(); haptic('sel'); break;
    case 'rem-hour': S.remHour=+t.dataset.h; save(); render(); haptic('sel'); break;
    case 'save-reminders': saveReminders(); break;
    case 'history-off': S.historyOff=!S.historyOff; save(); render(); haptic('sel'); break;

    /* data / delete */
    case 'ask-delete': deleteChecked=false; V.modal='delete'; render(); break;
    case 'del-check': deleteChecked=!deleteChecked; render(); haptic('sel'); break;
    case 'modal-close': V.modal=null; render(); break;
    case 'confirm-delete': if(!deleteChecked){ toast('Отметьте подтверждение выше'); haptic('rigid'); break; }
      S.entries=[]; S.moodLog=[]; S.practicesDone=0; S.dialogs=0; save(); V.modal=null; V.stack=[]; V.tab=2; V.diaryView='entries'; render(); toast('Все данные удалены'); notif('warning'); break;

    /* crisis */
    case 'crisis': push('crisis'); break;
    case 'crisis-help': toast('Открываю список контактов помощи…'); break;

    /* demo */
    case 'demo': { const d=t.dataset.d; if(d==='offline') push('offline'); else if(d==='empty'){ /* show empty diary */ const bak=S.entries; S.entries=[]; V.stack=[]; V.tab=2; V.diaryView='entries'; render(); S._emptyBak=bak; toast('Демо: пустой дневник (данные не удалены)'); }
      else if(d==='crisis') push('crisis'); else if(d==='ask-delete'){ deleteChecked=false; V.modal='delete'; render(); }
      else if(d==='plus-reset'){ if(isPlus()){ S.plus=false; S.plusUntil=0; save(); render(); toast('Within Plus сброшен (демо)'); } else openPaywall(''); } break; }
  }
}
function addEntry(obj){ S.entries.unshift(obj); if(S._emptyBak){ /* restore hidden */ } save(); }

function openGoalsPicker(){ /* simple inline: reuse onboarding goals as sheet-ish */ toast('Цели: '+S.goals.length+' выбрано — измените в онбординге'); }
function openStylePicker(){ toast('Стиль: '+STYLES[S.style][0]); render(); }

/* chat input autosize + enter */
app.addEventListener('input', e=>{ if(e.target.id==='chatInput'){ e.target.style.whiteSpace=e.target.value?'pre-wrap':'nowrap'; e.target.style.height='48px'; e.target.style.height=Math.min(120,e.target.scrollHeight)+'px'; } });
app.addEventListener('keydown', e=>{ if(e.target.id==='chatInput' && e.key==='Enter' && !e.shiftKey){ e.preventDefault(); const v=e.target.value; e.target.value=''; e.target.style.height='48px'; chatSend(v); } });
function focusChatMaybe(){}

/* ============================ boot ============================ */
if(tg){
  try{ tg.ready(); tg.expand(); tg.setHeaderColor&&tg.setHeaderColor('#FAF9F5'); tg.setBackgroundColor&&tg.setBackgroundColor('#FAF9F5'); tg.disableVerticalSwipes&&tg.disableVerticalSwipes(); }catch(e){}
  try{ tg.BackButton&&tg.BackButton.onClick(()=>{ if(!S.onboarded){ if(V.obSlide===1&&(V.intro||0)>0){V.intro--;render();} else if(V.obSlide>0){V.obSlide--;render();} return; } pop(); }); }catch(e){}
}
window.addEventListener('offline', ()=>{ V.netOffline=true; toast('Нет соединения'); });
window.addEventListener('online', ()=>{ V.netOffline=false; });
if(S.rm) document.body.classList.add('rm');
touchMsgDay();
render();
if(CONFIG.API_URL) fetchEntitlement().then(()=>render());
</script>
</body>
</html>
