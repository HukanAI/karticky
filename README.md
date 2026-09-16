# Kartičky ♥

Erotická karetní hra pro páry (18+). Pět úrovní od škádlení po hardcore, přes 1 100 úkolů pro něj i pro ni.

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
- Pomůcky: pírko, pouta, bičík, dva vibrátory (hodí se i šátek, olej a lubrikant).
- Před hrou si domluvte **stop slovo**.

## Instalace do telefonu

- **Android (Chrome):** otevřete odkaz → menu ⋮ → **Instalovat aplikaci** / **Přidat na plochu**.
- **iPhone (Safari):** otevřete odkaz → tlačítko Sdílet → **Přidat na plochu**.

Po instalaci funguje i offline.

## Vývoj

Čisté HTML/CSS/JS bez build kroku. Karty jsou v `cards/cat1.js` … `cards/cat5.js`
(formát `"text"` nebo `"text|sekundy"` pro časovač). Kontrola dat:

```bash
node tools/check-cards.mjs
```

Po změně souborů zvyšte `VERSION` v `sw.js`, aby se aplikace v telefonech aktualizovala.
