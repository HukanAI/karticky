# Kartičky ♥

Erotická karetní hra pro páry (18+). Pět úrovní od škádlení po hardcore, 5 076 úkolů pro něj i pro ni.
U poloh je na kartě silueta obou postav, aby bylo hned jasné, kdo je kde.

**Hrát:** https://hukanai.github.io/karticky/

## Jak se hraje

- Zadejte jména a kdo začíná. Střídáte se: muž plní úkoly pro potěšení ženy, žena pro potěšení muže.
- Klepnutím kartu otočíte. Po splnění dejte **Splněno**, nechcete-li úkol plnit, dejte **Vyměnit**.
- Po 6 splněných kartách (3 + 3) postupujete do další úrovně:
  1. Škádlení a předehra
  2. Smyslné doteky
  3. Orální hrátky
  4. Sex a polohy
  5. Hardcore
- Žádná karta se v jedné hře neopakuje. Úkoly s časem mají časovač.
- Kategorii můžete kdykoli přeskočit (i se vrátit) šipkami nad kartou.
- Většina karet nepotřebuje nic. Jinak: pírko, pouta, bičík, dva vibrátory, šátek, olej a lubrikant.
- Občas se hodí kostky ledu, erekční kroužek, kravata, štětec, žínka, sluchátka nebo telefon.
- Před hrou si domluvte **stop slovo**.

## Instalace do telefonu

- **Android (Chrome):** otevřete odkaz → menu ⋮ → **Instalovat aplikaci** / **Přidat na plochu**.
- **iPhone (Safari):** otevřete odkaz → tlačítko Sdílet → **Přidat na plochu**.

Po instalaci funguje i offline.

## Vývoj

Čisté HTML/CSS/JS bez build kroku. Karty jsou v `cards/cat1.js` … `cards/cat5e.js` –
každá kategorie má víc souborů se stejným `id`, které se při startu sloučí.
Formát karty: `"text"`, `"text|sekundy"` nebo `"text|sekundy|poloha"` (časovač smí být
prázdný: `"text||poloha"`). Vykřičník za id polohy (`zezadu!`) prohodí role obou
postav na obrázku – hodí se u karet, kde je v pasivní roli on. Siluety poloh jsou v `poses.js`, jejich náhled otevřete
v `tools/poses-preview.html`.

### Standard karty

Každá karta musí odpovědět na čtyři otázky: **co se dělá** (konkrétní sloveso, ne jen
postoj), **o jaký akt jde**, **jak** (poloha, tempo, pravidlo) a **kdy to končí** (časovač, počet, nebo
podmínka „dokud…“). Karta, která jen popisuje polohu, je chyba.

Akt musí být pojmenovaný podle kategorie: kategorie 2 ruku nebo pomůcku na konkrétním
místě, kategorie 3 orální akt, kategorie 4 průnik (`vnikni do ní`, `přirážej`,
`jezdi na něm`, `anál`) a kategorie 5 kteroukoli z nich, případně plácání nebo bičík.
Kategorie 1 nic navíc nepotřebuje – líbání a škádlení přes oblečení jsou samy o sobě akt.
Karta „obtoč mu nohu kolem boku“ bez toho, co se pak děje, kontrolu neprojde.

Každá karta s **análním průnikem** musí obsahovat slovo `lubrikant` a větu o tom,
**kdo řídí tempo a hloubku** – vždycky přijímající. Slovo `anál` zároveň zapíná
pruh se stop slovem (`SAFE_RE` v `app.js`).

**Anál má jediný směr: dělá ho muž ženě.** Karta pro ženskou roli ji nesmí posílat
do jeho zadku ani na prostatu – hlídá to `ANAL_NA_MUZI`. Kousnutí do půlky, hlazení
zad a zadku ani masáž hráze zvenku sem nepatří, ty zůstávají.

Většina karet (v každé kategorii aspoň 60 %) má tvar **`Název: zadání. Cíl: …`**, který
aplikace vykreslí s nadpisem a zvýrazněným cílem. Název smí mít nejvýš 40 znaků a nesmí
obsahovat `:` `.` `!` `?`, jinak se cíl nevykreslí. Text karty má 45–200 znaků, aby se
vešel na displej telefonu.

Pravidla jsou strojově vynucená – seznam sloves a měřítek je v `tools/card-rules.mjs`,
kontrola dat se pouští takhle:

```bash
node tools/check-cards.mjs   # data karet
node tools/check-fit.mjs     # zobrazení na malých displejích (vyžaduje Playwright)
```

`check-fit.mjs` proměří všech 5 076 karet v opravdové `.card-front` přes headless
Chromium na osmi velikostech displeje a hlídá, že se neposouvá karta ani stránka.
Vyplňuje přitom i **štítky pomůcek a bezpečnostní pruh** – bez nich vychází karta
nižší, než ve skutečnosti je, a kontrola pak hlásí nulu i tam, kde se posouvá.

Po změně souborů zvyšte `VERSION` v `sw.js`, aby se aplikace v telefonech aktualizovala.
