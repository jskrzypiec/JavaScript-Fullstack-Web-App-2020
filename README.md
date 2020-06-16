# JavaScript Fullstack Web App - 2020
Serwis Aukcyjny - fullstackowa aplikacja webowa poświęcona tematyce aukcji. Głównym celem aplikacji było 
umożliwienie wystawienia, kupienia, licytowania aukcji oraz umożliwienie komunikacji między użytkownikami poprzez chat.

## Autor
- Jakub Skrzypiec (@jakub.skrzypiec - jakub.skrzypiec1@gmail.com)

## Build With:  
- ECMAScript 6
- Express.js/Node.js (https, axios, bcrypt, mongoose, passport, passport.socketio, socket.io)
- Vue.js
- MongoDB

## Getting Started
Na początku pobieramy zależności node.js komendą (w katalogu głównym, gdzie znajduje się plik package.json)  
`npm install`  

Następnie 'buildujemy' aplikację klienta (Vue.js) komendą  
`npm run build`  

Następnie uruchamiamy aplikację serwera, po czym zostawiamy ją uruchomioną w tle  
`nodemon ./serwer/index.js` lub `node ./serwer/index.js`  
![image:runServerImg](gifs/1-nodemon.png)

Aplikacja jest gotowa do użycia i dostępna pod adresem 'https://localhost:3000'

## About application
Po przejściu do adresu 'https://localhost:3000' zostanie wyświetlona strona startowa aplikacji.  

![image:homepageImg](gifs/2-start.png)   

Jako niezalogowany użytkownik mamy jedynie wgląd do dostępnych aukcji - nie możemy ich kupować, licytować ani też dodać swoich aukcji.   
![gif](gifs/gif-aukcje_gość.gif)  
Akcje mogą mieć 2 możliwe typy:  
- kup teraz
- licytacja  

Oba typy aukcji są ograniczone czasowo. Licytacja kończy się w momencie upłynięcia czasu licytacji - licytacje wygrywa najwyższa oferta. 
Aukcja typu kup teraz jest automatycznie kończona po tym, gdy ktoś kupi wystawiony na niej przedmiot.  

Niezalogowany użytkownik może założyć nowe konto.  
Udana rejestracja:  
![gif](gifs/gif-rejestracja1_udana.gif)  
Niepowodzenie, gdy hasło jest niepoprawne  
![gif](gifs/gif-rejestracja2_blad-haslo.gif)  
Niepowodzenie, gdy nazwa użytkownika jest już zajęta:  
![gif](gifs/gif-rejestracja3_blad-zajetyLogin.gif)  

Niezalogowany użytkownik może się zalogować  
Udane logowanie:  
![gif](gifs/gif-logowanie1_udane.gif)  
Niepowodzenie, gdy wprowadzone dane będą niepoprawne - błędne hasło lub nazwa użytkownika, który nie istnieje:   
![gif](gifs/gif-logowanie2_blad.gif)  

Po zalogowaniu użytkownik ma pełen dostęp do komponentu aukcji. W zakładce aukcje może wyświetlić  
- wszystkie aukcje
- moje kupione (kupione przedmioty oraz wygrane licytacje)
- moje licytowanie (licytacje, w których braliśmy udział)
- moje wystawione (przedmioty, które my wystawiliśmy na sprzedaż)

![gif](gifs/gif-aukcje.gif)  

W zakładce 'wszystkie' dostępne są wszystkie aukcje. Stronicowanie aukcji umożliwia wybranie ilości aukcji na stronę.  
![gif](gifs/gif-aukcje_stronicowanie.gif)  
W zakładce 'wszystkie' możemy wyszukiwać aukcje na podstawie nazwy przedmiotu lub użytkownika, który wystawia przedmiot.   
![gif](gifs/gif-aukcje_wyszukiwanie.gif)  

Gdy weźmiemy udział w jakiejś licytacji - aukcja zostanie dodana do zakładki 'moje licytowane'. 
Gdy ktoś przebije naszą ofertę licytacji, zostaniemy o tym powiadomieni, a sama aukcja, którą przegrywamy, zostanie wyróżniona na liście 'moje licytowane'.  
![gif](gifs/gif-powiad_licytacja.gif)  

Użytownik z poziomu komponentu 'aukcje' może dodać nową aukcję.  
Dodanie aukcji 'kup teraz':  
![gif](gifs/gif-dodawanie_kupTeraz.gif)  
Dodanie aukcji typu 'licytacja':  
![gif](gifs/gif-dodawanie_licytacja.gif)  

Gdy chcemy dodać aukcję, zostanie nam wyświetlony widok podsumowania ze szczegółami aukcji. Wtedy możemy zatwierdzić dane i dodać aukcję lub wrócić do edycji szczegółów aukcji w celu zmiany danych. Przykład:  
![gif](gifs/gif-dodawanie_zmiana.gif)  

Użytkownik ma również dostęp do chatu. W tym komponencie może wymieniać się wiadomościami z innymi użytkownikami. 
![gif](gifs/gif-chat.gif)  

Jeżeli jesteśmy zalogowani w trakcie otrzymania nowej wiadomości - zostaniemy o tym powiadomieni.  
![gif](gifs/gif-chat_powiad.gif)  

Użytkownik może się wylogować.  
![gif](gifs/gif-wylogowanie.gif)  

