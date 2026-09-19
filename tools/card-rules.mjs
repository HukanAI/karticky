// Sdílená pravidla kvality karet – používá checker i pomocné skripty.

// „Co se dělá“ – kořeny sloves činnosti. Musí být aspoň jeden.
export const ACTION = new RegExp([
  // ústa, rty, jazyk
  'líb','polib','pus[au]\\b','lízej','lízat','lízá','olízn','olizuj','saj\\b','sát\\b','nasáv','cucej',
  'kous','ochutn','kouři','kouřit','koušl','foukej','foukni','dýchej','dých',
  // ruce, doteky
  'hlaď','hlad\\b','hlazen','masíruj','masáž','namasíruj','tři\\b','třeš','rozetři','přejeď','přejížděj',
  'opisuj','obcházej','kresli','nakresli','piš\\b','napiš','krouži','kroužkuj','kroužen','zakruť',
  'drážd','škádl','šimrej','prstěj','prstěn','honi','honě','hoň','kmitej','klouzej','otírej','jeď','jezdi',
  'dotýkej','dotkni','dotknout','sáhni','sahej','chyť','sevři','stisk','tiskni','přitisk','přitáhni','objímej','obejmi',
  'dej\\b','dávej','dáš\\b','podlož','přilož','přikládej','přiklop','pokládej','polož','nabídni','vem\\b','vezmi','ber\\b','bereš','použij','použijte',
  // sex, pohyb
  'miluj','milovat','vnikni','vnikej','vnikneš','přiráž','přirážej','přirážet','zasouvej','zasuň','vsuň',
  'pohybuj','hýbej','hýbat','houpej','jezd','sedej','nasedej','obkroč','propleť','přehni','otoč','přetoč',
  'tempo','rytm','střídej','střídejte','zrychl','zpomal','opakuj','opakován','zůstaň','zůstaňte','vydrž','vydržet',
  'zastav','zastavit','začni','začněte','pokračuj','nepřestávej','přestat','přestaň','skonči','skončit','nepřestat',
  // řeč, vedení, pravidla
  'šeptej','pošeptej','šeptem','řekni','říkej','mluv','popiš','popisuj','vyprávěj','vyjmenuj','přiznej','povíd','pověz','pomoz','vyzývej',
  'ptej','zeptej','zeptat','vyptávej','poruč','přikaž','rozkaž','vyzvi','zakaž','dovol','popros','pros\\b',
  'počítej','počítání','odpočít','hádej','uhodn','ohodnoť','známkuj','veď','naváděj','naveď','řídit','řiď',
  'dívej','dívat','dívejte','sleduj','pozoruj','ukaž','předveď','vyfoť','pošli','pusť','hraj','zahraj','zahrajte',
  'tancuj','tanči','tancujte','zkus','zkuste','vyber','vyberte','vymysli','najdi','najděte','najít','projdi','projít',
  'domluvte','vystřídejte','zahrň','dohodn',
  // svlékání, pomůcky, příprava
  'svlék','svlékej','sundej','sundá','rozepn','rozepínej','vyhrň','stáhni','vytáhni','odhrň','obleč','zuj',
  'svaž','sváž','spouta','spoutej','přivaž','zavaž','nasaď','zapni','namaž','naolejuj','namoč','napusť',
  'nalij','kápni','omyj','připrav','přines','hoď','nastav','přivoň','pročes','přetáhni','vyjeď','zajeď','sjeď','odnes','přiveď',
  // hrubší akce
  'tlač','přitlač','táhni','tahej','plác','plácej','plácni','šlehni','šleh','zvedni','zvedej','drž','držíš','držet',
  'stimuluj','vibr','orgasm','vyvrchol','uděl','dojde','dojít','dojet','dostaň','dostat','doveď','dovést',
  'přiveď','edg','odpír','odepři','nech\\b','nechej','nechat','nepustit','věnuj','splnit','splň','dokázat','zvládnout',
  'trefit','dorozumět','překvapit','naučit','nevynechat','udržet','dodržet','stihnout','dotáhnout',
  'děl','říká','řík','říd','počít','opakov','dívá','zůstáv','měn','buď','dáv','plň','plnit',
  'líž','liž','kouř','kuř','stříd','kles','dokáž','zná','pomáh','zakry','urč','vid','prac','slib',
  'řek','přesta','počk','projeď','přehoď','ohmat','rozhod','prohod','porouč','vyměň','zaváh',
  'příraz','pohyb','temp','sedá','nasedá','vlň','jezd','skloň','zaklán','vystrč','vnik',
].join('|'), 'i');

// „Kdy to končí“ – měřitelný konec úkolu.
export const END = new RegExp([
  '\\b\\d+\\s*(?:×|x\\b|krát|minut|vteři|sekun|kol\\b|kola|tah|polib|úder|ran|nádech|pohyb|příraz|s\\b)',
  '\\b(?:jednou|dvakrát|třikrát|čtyřikrát|pětkrát|šestkrát|sedmkrát|osmkrát|devětkrát|desetkrát|dvacetkrát)\\b',
  '\\b(?:dva|dvě|tři|čtyři|pět|šest|sedm|osm|devět|deset|patnáct|dvacet|třicet|sto)\\b',
  'dokud','než\\s+(?:se|ho|ji|tě|si|to|ti|mu)','až\\s+(?:se|ho|ji|tě|si|to|ti|mu|budeš|bude)',
  'Cíl:','pokaždé','kdykoli','každ(?:ý|á|é|ou|ých|ém|ého)','celou dobu','do konce','na konci','nakonec','po poslední',
].join('|'), 'i');

// Postojová slovesa – samy o sobě úkol netvoří.
export const POSTURE = /lehni|lež\b|lehněte|klekni|klek\b|klečí|klečíš|sedni|seďte|sedněte|sedíš|sedíte|posaď|postav|stoupni|opři|opřete|předkloň|ohni|nakloň|přiklekni/i;

// Formát cílové karty – musí sedět s regexem v app.js.
export const GOAL_RE = /^([^:.!?]{2,40}): (.+?) Cíl: (.+)$/;

export const MIN_LEN = 45;
export const MAX_LEN = 200;
export const MIN_GOAL_SHARE = 0.6;

// ---------------------------------------------------------------------------
// Pojmenovaný akt: z karty musí být jasné, co se s tělem druhého děje.
// Poloha, tempo ani pravidlo to nenahradí.

// Ruce a pomůcky na konkrétním místě (kategorie 2).
const RUKY = [
  'hlaď','hlad','pohlaď','masíruj','namasíruj','rozmasíruj','masáž','dráždi','drážděn','škádl',
  'prsti','prstí','prstem','prsty','prstů','honi','hoň','honě','vyhoň','masturb','ruční',
  'třeš','tři\\b','rozetři','mnuj','ťukej','krouž','kroužk','kroužen','sevři','stiskni','stisk','svírej',
  'klouzej','otírej','přejeď','přejížděj','projeď','obkresl','kresli','šimrej','tahej','táhni',
  'vibrátor','vibrac','vibruj','kroužk[eu]m','pírk','štětc','štětec','žínk','ledem','kostk','olej','naolejuj','namaž','lubrik',
  'klitoris','bradavk','penis','varlat','žalud','uzdičk','stydk','klín','hráz','prostat','kunda','kundičk','péro','koule',
  'polib','líb','kous','saj\\b','olizuj','olízn','lízej','jazyk','ústy','foukej','foukni',
  'vsuň','vsouvej','zasuň','zasouvej','vytahuj','vytáhni','mezi nohy','mezi nohama','mezi nohy',
  'svlék','svlékni','stáhni','stahuj','sundej','rozepn','vyhrň','přitiskni','tiskni','přitlač','vlň','vlni',
  'prohlíž','prohlédni','dívej','dívá','popisuj','popiš','sleduj','pozoruj','erek','tah\\b','tahů','tahy','kořen','špičk',
  'dotýkej','dotýká','dotkni','dotek','doteky','doteků','doteku','dotknout','sáhni','sahej','chyť',
  'obejm','prozkoum','věnuj','věnuješ','pohybuj','hýbej','pohyb',
  'hněť','hnět','obejmi','objímej','objet','kruh','dlaň','dlaně','dlaněmi','dlaní','ohmat','zápěst','do kalhot','do kalhotek','do trenýrek',
  'orgasm','vyvrchol','udělá se','udělal','udělala','dojde','dojít','dojdeš','hran[uěy]','edg','odpír',
];

// Orální akt (kategorie 3).
const ORAL = [
  'lízej','lízá','lízat','lížeš','ližte','lízán','olizuj','olízn','olizován',
  'kouři','kouříš','kouřit','kouřen','kuř','kouř','do pusy','v puse','pusou','pusu','pusa','rty','rtů','rtem','ret','sevři rty','ústy','úst[ay]','jazyk','jazýčk',
  'saj\\b','sát\\b','saješ','nasáv','cucej','bzuč','69','devětašedesát','anilingus','polib','líb',
];

// Průnik (kategorie 4).
const PRUNIK = [
  'miluj','milov','vnikni','vnikej','vnikne','vniknout','vniká','vnikáš','vnikl','vnikla',
  'přiráž','přirážej','přirážet','příraz','přírazů','přírazy','zasouvej','zasuň','zaveď','zavede','zavedeš','zaveze',
  'jezdi','jezdí','jezdíš','jízd','jezdkyn','nasedej','nasedá','sedej si na n','posaď se na n',
  'je v tobě','jsi v ní','v ní jsi','v tobě je','zůstaň v ní','zůstaň v něm','v ní zůsta','vyklouz','bez vytažení',
  'anál','análn','análu','análem','do zadečku','do zadku','kolík','dvojit[ýáé] průnik','průnik',
  'sex\\b','sexu\\b','sexem\\b','při sexu','vezmi si ji','vezmi si ho','vezme t','ať tě vezme','mrdej','mrdá','šukej','šuká','ojeď','ojede',
];

// Plácání, bičík, svazování se stimulací (jen kategorie 5).
const HARDCORE = ['plác','plácni','plácej','šlehni','bičík','ránu','rány','ran\\b','úder','výprask'];

const re = list => new RegExp(list.join('|'), 'i');

// Co musí pojmenovat karta v které kategorii. Kategorie 1 (škádlení) nic navíc –
// líbání, mluvení a dráždění přes oblečení jsou samy o sobě akt.
export const ACT_BY_CAT = {
  2: re([...RUKY, ...ORAL]),
  3: re(ORAL),
  4: re(PRUNIK),
  5: re([...PRUNIK, ...ORAL, ...RUKY, ...HARDCORE]),
};

// Anální průnik – ne kousnutí do zadečku ani masáž hráze.
export const ANAL = /anál|análn|análu|análem|kolík|(?:vsuň|vsouvej|vnikni|vnikej|zaveď|zavede|zasuň|strč|nech .{0,20}vniknout)[^.!?]{0,40}do zade[čc]k|masíruj[^.!?]{0,30}prostat|prostat[^.!?]{0,20}(?:prstem|prst)/i;
// Kdo řídí tempo a hloubku – u análu vždycky přijímající.
export const ANAL_TEMPO = /(?:tempo|hloubk|rychlost)[^.!?]{0,40}(?:řídí|určuje|určuješ|řídíš|vybír|volí)|(?:řídí|určuje|určuješ|řídíš)[^.!?]{0,30}(?:tempo|hloubk|ona\b|on\b|sama|sám)|až na (?:její|jeho|tvoje|tvé) slovo|dokud (?:si )?ne(?:řekne|požád|dovolí)|ona (?:tě )?navádí|on (?:tě )?navádí|nech ji, ať si|nech ho, ať si|podle (?:ní|něj)|sama (?:si )?(?:řídí|určuje|zavede|nasedá)|sám (?:si )?(?:řídí|určuje|zavede|nasedá)/i;

// Tvary, které do textů nepatří.
export const BANNED = [{ re: /prstěj/i, use: 'prsti' }];
