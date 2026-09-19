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
  'dej\\b','dávej','dáš\\b','podlož','přilož','přikládej','přiklop','pokládej','polož','nabídni','vem\\b','vezmi','použij','použijte',
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
