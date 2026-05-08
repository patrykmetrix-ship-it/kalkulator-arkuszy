# Kalkulator arkuszy blach PWA

Mobilna aplikacja PWA do przeliczania wagi blach na liczbę arkuszy oraz liczby arkuszy na wagę.

## Wzor

```text
waga arkusza = grubość_mm x szerokość_m x długość_m x współczynnik_materiału
```

Przyklad ze zdjecia:

```text
2 x 1,25 x 2,5 x 8 = 50 kg
```

## Materialy

- Blacha czarna: `8`
- Nierdzewka: `8`
- Ocynk / alucynk: `8`
- Miedź: `9`
- Aluminium: `2.7`

## Uruchomienie lokalne

```powershell
python -m http.server 4173
```

Potem otwórz:

```text
http://localhost:4173/
```

Service worker i tryb offline działają przez `localhost` po pierwszym załadowaniu strony.

## Dostęp z telefonu w tej samej sieci

Uruchom:

```powershell
python -m http.server 4173 --bind 0.0.0.0
```

Potem na telefonie otwórz adres komputera, np.:

```text
http://10.10.5.108:4173/
```

Możesz też użyć pliku `Start_Kalkulator_Publiczny.bat`, który pokazuje właściwy adres po uruchomieniu.

## Publikacja na GitHub Pages

1. Utwórz publiczne repozytorium `kalkulator-arkuszy` na GitHubie.
2. Wgraj do głównego katalogu repozytorium pliki aplikacji:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `manifest.webmanifest`
   - `service-worker.js`
   - `icon.svg`
   - `icon-192.png`
   - `icon-512.png`
   - `.nojekyll`
   - `README.md`
3. Nie wgrywaj `Start_Kalkulator_Publiczny.bat`, bo służy tylko do lokalnego uruchamiania na komputerze.
4. Wejdź w `Settings -> Pages`, wybierz `Deploy from a branch`, branch `main`, folder `/root`.
5. Po kilku minutach strona będzie dostępna pod adresem podobnym do:

```text
https://twoj-login.github.io/kalkulator-arkuszy/
```
