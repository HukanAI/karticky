# Kartičky ♥

Erotická karetní hra pro páry (18+). Pět úrovní od škádlení po hardcore, přes 5 000 úkolů pro něj i pro ni.
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
prázdný: `"text||poloha"`). Siluety poloh jsou v `poses.js`, jejich náhled otevřete
v `tools/poses-preview.html`. Kontrola dat:

```bash
node tools/check-cards.mjs
```

Po změně souborů zvyšte `VERSION` v `sw.js`, aby se aplikace v telefonech aktualizovala.
