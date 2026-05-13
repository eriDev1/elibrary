 

University for Business and Technology 

MSc – Computer Science and Engineering 

2024/2025 

Stilet e Arkitekturës dhe Mostrat e dizajnit 

-Sistem për menaxhimin e një librarie- 
Studenti: Erind Avdiu                                         Profesori: Ramadan Dervishi 


Shkurt, 2026. 

​​Përmbajtja 

1. Përshkrimi i projektit dhe objektivat  
2. Kërkesat kryesore (funksionale, teknike, dizajn, endpoint-e API)  
3. Diagrami i rasteve të përdorimit  
4. Diagrami i klasave  
5. Diagramet e sekuencës  
6. Diagrami i aktivitetit  
7. Arkitektura dhe parimet e dizajnit — Konkluzioni  

​  

 1. Përshkrimi i projektit dhe objektivat 

 1.1 Përshkrimi i Projektit 

Sistemi i Menaxhimit të Bibliotekës është një zgjidhje e plotë web: një API REST me **Fastify** dhe **TypeScript** në backend, një klient me **React** (Vite, TanStack Router, TanStack Query, Tailwind CSS) në frontend, dhe **Supabase** për autentikim dhe për ruajtjen e të dhënave në **PostgreSQL**. Qëllimi është të demonstrohet në mënyrë praktike strukturimi me OOP dhe SOLID, me ndarje të qartë të përgjegjësive dhe kontrata përmes interface-ve.

Përmes TypeScript-it, sistemi përfiton nga tipizimi statik dhe nga kontratat midis shtresave. Në backend përdoren pattern-et **Repository** (qasje në të dhëna), **Strategy** (rregulla huazimi sipas tipit të anëtarit) dhe **Dependency Injection** përmes konstruktorëve në `app.ts`. Autentikimi dhe autorizimi (role `staff` / `member`) lidhen me Supabase; biznesi i huazimit mbetet në use case-et dhe nuk duhet të kopjohet në klient. 

1.2 Objektivat dhe qëllimi i projektit 

Qëllimi kryesor i projektit është të demonstrojë në mënyrë të plotë dhe të argumentuar zbatimin praktik të parimeve të OOP dhe SOLID në një aplikacion **full-stack** (API + klient web) me të dhëna të përhershme në Supabase, duke treguar se si konceptet teorike si abstraksioni, trashëgimia, polimorfizmi dhe përdorimi i interface-ve shndërrohen në zgjidhje konkrete për një sistem funksional me rregulla të qarta biznesi. 

Projekti synon gjithashtu: 

të krijojë një arkitekturë të ndarë në shtresa (controllers, use cases, domain, repositories, services për strategji, infrastructure për Supabase) për ndarje të qartë të përgjegjësive 

të demonstrojë përdorimin e polimorfizmit përmes strategjive të ndryshme të huazimit të librave 

të përdorë interface dhe klasa abstrakte për të krijuar kontrata të qëndrueshme midis komponentëve 

të mundësojë zgjerim të lehtë të sistemit me tipe të reja anëtarësh ose rregulla të reja huazimi 

të dokumentojë strukturën përmes diagrameve UML për klasat dhe marrëdhëniet midis tyre 

2. Kërkesat kryesore 

 

2.1. Kërkesat funksionale 

Sistemi ofron funksionalitete përmes API-së së backend-it dhe ndërfaqes së frontend-it. Çdo veprim i mbrojtur kërkon token nga Supabase; rolet përcaktojnë çfarë lejohet.

**Librat** — Stafi: krijim, përditësim, fshirje. Të gjithë përdoruesit e autentikuar: listim me faqezim dhe kërkim (`search`). Çdo libër ka status disponueshmërie (p.sh. i disponueshëm / i huazuar) të derivuar nga huazimet aktive.

**Anëtarët** — Stafi: krijim, listim me faqezim dhe kërkim, përditësim, fshirje. Lloji i anëtarit (`standard`, `student`, `premium`) përcakton strategjinë e huazimit. Regjistrimi publik (`/auth/signup`) krijon llogari anëtari në Supabase dhe rresht përkatës në bazë.

**Huazimi dhe kthimi** — Anëtari dërgon `bookId`; identiteti i anëtarit vjen nga token-i (jo nga trupi i kërkesës), që të parandalohet huazimi në emër të dikujt tjetër. Para huazimit kontrollohen disponueshmëria e librit dhe kufijtë sipas strategjisë. Kthimi përditëson rekordin e huazimit dhe disponueshmërinë e librit.

**Raportet dhe historia** — Stafi: listë e huazimeve me detaje (libër + anëtar), historia e huazimeve të një anëtari të caktuar. Anëtari: huazimet aktive me faqezim, **historia ime** e të gjitha huazimeve (`/borrow/history`), periudha e sugjeruar e huazimit sipas tipit të anëtarit.

**Frontend** — Faqe për librat, anëtarët (staf), raportin e huazimeve (staf), huazimin dhe kthimin (anëtar), dhe historinë time (anëtar); forma me validim, modale për edit, dialog konfirmimi për fshirje, tabela me faqezim server-side ku është e nevojshme. 

 

2.2. Kërkesat teknike 

Këto kërkesa përcaktojnë mjedisin dhe mënyrën e implementimit teknik të sistemit. 

**Backend:** TypeScript (projekti përdor versionin e deklaruar në `package.json`, p.sh. 5.4.x), Fastify 5.7.x, `@supabase/supabase-js` për klientin drejt Supabase.

**Frontend:** React 19, Vite 8, TypeScript 6.x, TanStack Router / TanStack Start, TanStack Query, React Table, React Hook Form, Tailwind CSS 4, Supabase JS për sesion në shfletues.

**Runtime:** Node.js për API-në.

**Arkitektura:** Qasje e ngjashme me Clean Architecture — controllers të hollë, use cases për një veprim aplikacioni, entitete domeni, interface repository-sh, implementime në `infrastructure/repositories` (BookRepository, MemberRepository, BorrowRepository) që përdorin Supabase/PostgREST. Strategjitë e huazimit janë në `services/`; nuk ka shtresë të veçantë “BookService” që zëvendëson repository-n.

**Ruajtja e të dhënave:** PostgreSQL përmes Supabase (skema SQL në repozitor, migrime ku aplikohen). Repository-t përmbajnë SQL/query përmes klientit Supabase, jo struktura në memorie.

**Autentikimi:** Supabase Auth; middleware i Fastify-it verifikon token-in dhe ngarkon `user` me `id` dhe `role` për autorizim.

**Validimi:** Validim i të dhënave hyrëse në controller dhe/ose në use case para shkrimit në bazë.

**Strukturë modulare:** Organizim sipas domenit: books, members, borrows (rekordet e huazimit), plus `auth` dhe `middleware`.

 

2.3. Kërkesat e dizajnit 

Kërkesat e dizajnit fokusohen në cilësinë arkitekturore dhe mënyrën e strukturimit të kodit. 

Zbatimi i parimeve OOP — Entitetet **Book**, **Member** dhe **BorrowRecord** janë klasa domeni me atribute dhe metoda si `toJSON()` për përgjigje API me fusha në `snake_case`.

Abstraksion — Kontratat kryesore janë **interface**-et (`IBookRepository`, `IMemberRepository`, `IBorrowRepository`, `IBorrowingStrategy`, `IUseCase`). Nuk përdoret një hierarki trashëgimi `MemberBase` në kodin aktual; ndarja e sjelljes bëhet me **MemberType** dhe strategji.

Polimorfizëm — `StandardBorrowingStrategy`, `StudentBorrowingStrategy`, `PremiumBorrowingStrategy` implementojnë të njëjtin kontrakt strategjie; `MemberTypeBorrowingStrategyResolver` zgjedh strategjinë sipas `memberType`.

Interface — Use case-et varen nga interface-et e repository-ve dhe nga resolver-i i strategjisë, jo nga implementimet konkrete Supabase.

SOLID — SRP në controller dhe use case; OCP për strategji të reja huazimi; LSP për strategjitë; ISP përmes interface-ve të ngushta repository; DIP kur use case-et pranojnë abstraksione në konstruktor.

Dependency Injection — Në `app.ts` instancat krijohen një herë dhe injektohen në controller-e.

Dizajn i zgjerueshëm — Shtimi i një strategjie të re huazimi ose i një metode të re në interface-in e repository-t, me implementim në `BorrowRepository` / `BookRepository`, pa prishur shtresën e use case-it nëse kontrata mbetet e njëjtë.

2.4. Përmbledhje e endpoint-eve të API-së (backend)

| Metoda | Rruga | Roli | Shënim |
|--------|--------|------|--------|
| POST | `/auth/signup` | Regjistrim | Publik |
| GET | `/health` | Status | Publik |
| GET | `/books` | Lista / kërkim / faqezim | Të autentikuarit |
| POST, PUT, DELETE | `/books`, `/books/:id` | CRUD libra | Staf |
| GET, POST, PUT, DELETE | `/members`, `/members/:id` | CRUD anëtarë | Staf |
| GET | `/members/:id/borrows` | Historia e anëtarit | Staf |
| POST | `/borrow` | Huazo | Anëtar; `memberId` nga token |
| POST | `/return` | Kthe | Anëtar |
| GET | `/borrow/my` | Huazimet aktive të mia | Anëtar |
| GET | `/borrow/history` | Historia ime | Anëtar |
| GET | `/borrow/period` | Periudha sipas tipit | Anëtar |
| GET | `/borrows` | Raporti i përgjithshëm | Staf |

Parametrat e faqezimit të përbashkët: `page`, `page_size` ku përputhet me implementimin.

 

3. Diagrami i rasteve të përdorimit (use case diagram) 

 

 
Diagram 1. Diagrami i rasteve të përdorimit (Use Case) — sistemi i menaxhimit të bibliotekës

Ky version përshkruan si duhet vizatuar diagrami në veglë UML (p.sh. draw.io, StarUML, PlantUML), jo si gjenerator automatik. Qëllimi është konsistencë: një rast përdorimi = një ovale, një lidhje = një asociacion aktor–rast, pa lidhje të kota midis dy rasteve vetëm sepse “janë në të njëjtin proces”.

Shënim nga vlerësimi: **Huazo libër** dhe **Ktheje libër** nuk lidhen drejtpërdrejt me njëra-tjetrën. Ato janë dy raste të pavarura; secila lidhet vetëm me aktorin që e nis veprimin (anëtari). Në jetën reale anëtari mund të kthejë një libër pa e lidhur atë me një huazim të ri në të njëjtin moment diagrami.

---

### Aktorët (jashtë kufirit të sistemit)

| Aktor | Roli |
|--------|------|
| Stafi i bibliotekës | Menaxhon librat dhe anëtarët, sheh raportin e huazimeve |
| Anëtari i bibliotekës | Shikon katalogun, huazon, kthen, sheh historinë e vet |

---

### Rastet e përdorimit (brenda kufirit të sistemit)

Çdo rresht është një ovale i vetëm në diagram; emrat mbeten në shqip si në kërkesat funksionale.

**Stafi — asociacion vetëm me këto raste**

- Krijo libër (dhe përditësim / fshirje libri nëse diagrami përfshin variantin e zgjeruar të sistemit aktual)
- Listo librat (për nevojat administrative / katalog)
- Krijo anëtar (dhe përditësim / fshirje anëtari sipas implementimit)
- Listo anëtarët
- Shiko raportin e huazimeve (të gjitha huazimet; për stafin)
- Shiko historinë e huazimeve të një anëtari të caktuar (kur stafi zgjedh një anëtar)

**Anëtari — asociacion vetëm me këto raste**

- Listo librat (shfletim katalogu)
- Huazo libër
- Ktheje libër
- Shiko historinë time të huazimeve (vetëm të dhënat e përdoruesit të autentikuar)

**Raste që përfshihen nga të dy aktorët**

- Vetëm **Listo librat**: nga stafi (menaxhim) dhe nga anëtari (katalog); në UML mbetet **një** ovale “Listo librat” me dy vija asociacioni, jo dy ovale me të njëjtin emër.

---

### Çfarë nuk vizatohet (për të shmangur gabimet e zakonshme)

- Asnjë vijë midis **Huazo libër** dhe **Ktheje libër**.
- Asnjë vijë që nga **Huazo libër** shkon te **Krijo anëtar**; krijimi i anëtarit është veprim stafi, jo degë e huazimit.
- Asnjë vijë nga **Listo anëtarët** te **Ktheje libër**; kthimi është veprim anëtari, jo i listës së anëtarëve.

Lloji i lidhjeve: asociacion i thjeshtë aktor–rast përdorimi (vijë e plotë). Për këtë diagram nuk kërkohen <<include>> / <<extend>>, përveç nëse më vonë shtohen në mënyrë të argumentuar (p.sh. validim i ISBN si rast i brendshëm).

---

### Skicë tekstuale e vendosjes (për ta nxjerrë pastaj në UML)

Kjo është vetëm orientim hapësinor; në dorëzimin final diagrami bëhet me forma UML.

```
         STAFI                              [ SISTEMI ]                         ANËTARI
           |                                      |                                 |
           +--- Krijo / përditëso libër           |                                 +--- Listo librat
           +--- Listo librat                      |                                 +--- Huazo libër
           +--- Krijo / përditëso anëtar          |                                 +--- Ktheje libër
           +--- Listo anëtarët                    |                                 +--- Historia ime
           +--- Raport huazimesh                 |                                 |
           +--- Historia e anëtarit (nga ID)     |                                 |
```

Në vizatim profesional, ovalet e rasteve vendosen brenda drejtkëndëshit të sistemit; aktorët janë majtas dhe djathtas. Vijat kalojnë nga stick figure te ovalet, jo nga ovale te ovale.




 

Diagrami i rasteve të përdorimit paraqet ndërveprimin mes aktorëve dhe sistemit brenda një kufiri të qartë. Identifikohen dy aktorë: Stafi i Bibliotekës dhe Anëtari i Bibliotekës. Lidhjet janë vetëm asociacione aktor–rast përdorimi; **huazimi** dhe **kthimi** nuk lidhen me njëri-tjetrin si raste të veçanta, sepse përfaqësojnë dy transaksione të pavarura që anëtari i nis veç e veç.

Stafi menaxhon librat dhe anëtarët (krijim, listim, përditësim dhe fshirje sipas implementimit aktual të API-së) dhe ka pamje mbi të gjitha huazimet si raport, si dhe mbi historinë e huazimeve të një anëtari të caktuar kur duhet kontroll administrativ.

Anëtari përdor katalogun, huazon, kthen dhe sheh **historinë e vet** të huazimeve; nuk ka rast përdorimi për të lexuar historinë e anëtarëve të tjerë.

Rastet shtesë (raporti i përgjithshëm i huazimeve, historia individuale e anëtarit, historia “e imja”) pasqyrojnë zgjerimet e fundit të sistemit në frontend dhe backend, duke ruajtur ndarjen e roleve. Diagrami mbetet bazë për modelimin e klasave dhe të shtresave të arkitekturës. 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

 

4. Diagrami i klasave (class diagram) 

 

 

Diagram 2. Diagrami i klasave (UML) — përputhje me implementimin aktual

Ky seksion përshkruan si duhet vizatuar diagrami i klasave në veglë UML, në përputhje të plotë me strukturën e projektit Fastify + TypeScript + Supabase. Teksti është në gjuhën shqipe; emrat e klasave dhe interfejsave në ovalet e diagramit mbeten të njëjtë me emrat në kod (TypeScript), sepse diagrami dokumenton implementimin real, jo një version të përkthyer të rremë.

Shënim metodologjik: në versione të vjetra të dokumentacionit përmendej BaseLibraryService dhe BookService — ato nuk ekzistojnë në kod. Qasja në bazë bëhet përmes klasave të depozitës (repository) që implementojnë interfejsat e domenit; logjika e huazimit sipas tipit të anëtarit bëhet me strategji dhe me një klasë që zgjedh strategjinë e duhur.

Shtresa e kontrolluesve HTTP (hyrja e aplikacionit)

Kontrolluesit janë klasa të holla: lexojnë kërkesën HTTP, thërrasin një rast përdorimi (use case), vendosin kodin e përgjigjes dhe trupin JSON. Nuk përmbajnë logjikë biznesi të gjatë.

Kontrolluesi i autentikimit (AuthController): regjistrim anëtari (signup); varët nga shërbimi i autentikimit përmes interfejsit IAuthService (implementim: SupabaseAuthService).

Kontrolluesi i librave (BookController): krijim libri, listë me faqe dhe kërkim dhe filtrim sipas disponueshmërisë, përditësim, fshirje; varët nga CreateBookUseCase, GetAllBooksUseCase, UpdateBookUseCase, DeleteBookUseCase.

Kontrolluesi i anëtarëve (MemberController): krijim, listë me faqe dhe kërkim, përditësim, fshirje anëtari, plus historia e huazimeve të një anëtari sipas identifikuesit në URL; varët nga CreateMemberUseCase, GetAllMembersUseCase, UpdateMemberUseCase, DeleteMemberUseCase, GetMemberBorrowHistoryUseCase.

Kontrolluesi i huazimeve (BorrowController): huazim libri, kthim libri, raporti i përgjithshëm i huazimeve për stafin, huazimet aktive të anëtarit të hyrë, historia e huazimeve të anëtarit të hyrë, periudha e sugjeruar e huazimit; varët nga BorrowBookUseCase, ReturnBookUseCase, GetAllBorrowsUseCase, GetMyActiveBorrowsUseCase, GetMyBorrowHistoryUseCase, GetMemberLoanPeriodUseCase.

Shtresa e rasteve të përdorimit (biznesi i aplikacionit)

Çdo klasë rasti përdorimi implementon interfejsin IUseCase (metoda execute). Rastet për libra: CreateBookUseCase, GetAllBooksUseCase, UpdateBookUseCase, DeleteBookUseCase. Rastet për anëtarë: CreateMemberUseCase, GetAllMembersUseCase, UpdateMemberUseCase, DeleteMemberUseCase, GetMemberBorrowHistoryUseCase. Rastet për huazim dhe raporte: BorrowBookUseCase, ReturnBookUseCase, GetAllBorrowsUseCase, GetMyActiveBorrowsUseCase, GetMyBorrowHistoryUseCase, GetMemberLoanPeriodUseCase.

Rastet e përdorimit varen nga interfejsat e depozitës së të dhënave (IBookRepository, IMemberRepository, IBorrowRepository) dhe, ku duhet, nga zgjidhësi i strategjisë së huazimit (MemberTypeBorrowingStrategyResolver) që implementon IBorrowingStrategyResolver.

Shtresa e shërbimeve të domenit (strategjitë e huazimit)

Tre klasa strategjie: StandardBorrowingStrategy, StudentBorrowingStrategy, PremiumBorrowingStrategy — të gjitha implementojnë interfejsin IBorrowingStrategy (p.sh. a lejohet huazimi, sa ditë zgjat huazimi).

Klasa MemberTypeBorrowingStrategyResolver zgjedh strategjinë e duhur sipas tipit të anëtarit (standard, student, premium). Këto klasa nuk lexojnë direkt nga baza; ato japin rregulla sipas tipit të anëtarit dhe librit.

Shtresa e infrastrukturës (implementimi dhe baza)

Depozita e librave (BookRepository), depozita e anëtarëve (MemberRepository), depozita e huazimeve (BorrowRepository) — paraqiten si implementime të interfejsave IBookRepository, IMemberRepository, IBorrowRepository dhe përdorin klientin Supabase për pyetje SQL. BookRepository dhe MemberRepository trashëgojnë nga klasa abstrakte BaseRepository (ndihmë e përbashkët për klientin Supabase dhe emrin e tabelës; përmban metodë abstrakte validate).

Shërbimi SupabaseAuthService implementon IAuthService dhe lidh regjistrimin me Supabase Auth dhe me depozitën e anëtarëve ku nevojitet.

Shtresa e domenit (entitetet dhe kontratat)

Entitetet kryesore: Book (identifikues, titull, autor, ISBN, në dispozicion, data krijimi/përditësimi; metoda toJSON për përgjigje API), Member (identifikues, emër, email, tip anëtari, data krijimi/përditësimi; toJSON), BorrowRecord (identifikues, libër, anëtar, data huazimi, afati, data kthimit opsionale; toJSON).

Interfejsat e kontratës në dosjen domain/interfaces: IBookRepository, IMemberRepository, IBorrowRepository, IBorrowingStrategy, IBorrowingStrategyResolver, IAuthService, IUseCase, plus tipet për listë të faqezuar dhe filtra sipas nevojës.

Llojet e marrëdhënieve në diagram (UML)

Varësi (shigetë me vija të ndërprera nga kontrolluesi te rasti i përdorimit, ose nga rasti te interfejsi): kontrolluesi përdor rastin; rasti përdor interfejsin e depozitës ose zgjidhësin e strategjisë.

Implementim (vijë me trekëndësh bosh): BookRepository implementon IBookRepository; njëjtë për anëtarë dhe huazime; strategjitë implementojnë IBorrowingStrategy; MemberTypeBorrowingStrategyResolver implementon IBorrowingStrategyResolver; SupabaseAuthService implementon IAuthService.

Trashëgimia (vijë me trekëndësh të mbushur): BookRepository dhe MemberRepository trashëgojnë nga BaseRepository.

Mos vizatoni lidhje trashëgimi direkte nga entiteti Book te BookRepository; lidhja kalon përmes rasteve të përdorimit.

Skicë e varësive (orientim vertikal për UML)

Nga lart poshtë: skeda hyrëse e aplikacionit (app.ts) krijon objektet dhe i lidh me konstruktorë.

Kontrolluesit HTTP → rastet e përdorimit → interfejsat e depozitës dhe zgjidhësi i strategjisë.

Implementimet e depozitës (BookRepository, MemberRepository, BorrowRepository) figurojnë si implementime të interfejsave përkatëse dhe lidhen me klientin Supabase.

BorrowBookUseCase lidhet me zgjidhësin e strategjisë dhe me tre interfejsat e depozitës (libër, anëtar, huazim) sipas nevojës për një transaksion huazimi.

Përmbledhje

Diagrami i klasave pasqyron ndarjen: kontrollues të hollë HTTP, raste përdorimi që orkestrojnë, interfejsa domeni për kontrata, implementime në infrastrukturë që flasin me PostgreSQL përmes Supabase, strategji të izoluara për rregulla huazimi, dhe entitete që përfaqësojnë modelin e qëndrueshëm. Kjo përputhet me parimin e inversionit të varësive: rastet varen nga interfejsat, jo nga detajet e bazës.

Përshkrim i përgjithshëm (për tekstin e temës, në vend të versionit të vjetër me BookService dhe BaseLibraryService)

Diagrami i klasave të sistemit të menaxhimit të bibliotekës përfaqëson strukturën e plotë të aplikacionit duke ndarë qartë komponentët sipas shtresave: së pari shtresa e kontrolluesve HTTP, pastaj shtresa e rasteve të përdorimit, më tej shtresa e strategjive të domenit për rregullat e huazimit, shtresa e infrastrukturës me depozitat që shkruajnë dhe lexojnë nga baza përmes Supabase-it, dhe së fundi shtresa e domenit me entitetet dhe interfejsat e kontratës. Diagrami tregon marrëdhëniet midis klasave dhe interfejsave, si dhe lidhjet e trashëgimisë (BookRepository dhe MemberRepository nga BaseRepository) dhe të varësisë (kontrolluesi përdor rastin e përdorimit; rasti përdor interfejsin e depozitës ose zgjidhësin e strategjisë).

Në shtresën e domenit ndodhen entitetet kryesore Book, Member dhe BorrowRecord, që përfaqësojnë modelin e të dhënave në kujtesën e objektit përpara se të përputhen me rreshtat e bazës. Secili entitet ka atribute dhe konstruktorë sipas nevojës; përgjigjet drejt klientit përdorin metodën toJSON me emra fushash të përshtatshëm për API. Në të njëjtën shtresë figurojnë interfejsat e kontratës: IBookRepository, IMemberRepository, IBorrowRepository, IBorrowingStrategy, IBorrowingStrategyResolver, IAuthService dhe IUseCase, të cilët përçojnë kërkesat e rasteve të përdorimit pa lidhur drejtpërdrejt me Supabase.

Nuk ka më “shërbime” BookService dhe MemberService që trashëgojnë nga BaseLibraryService; ajo ishte përshkrim i pasaktë. Në vend të tyre, qasja në të dhëna bëhet përmes klasave BookRepository, MemberRepository dhe BorrowRepository, të cilat implementojnë interfejsat përkatëse të domenit. Strategjitë StandardBorrowingStrategy, StudentBorrowingStrategy dhe PremiumBorrowingStrategy implementojnë IBorrowingStrategy dhe përcaktojnë rregulla të ndryshme huazimi; MemberTypeBorrowingStrategyResolver zgjedh strategjinë sipas tipit të anëtarit. Për autentikim, SupabaseAuthService implementon IAuthService dhe lidhet me kontrolluesin e autentikimit.

Shtresa e rasteve të përdorimit përmban klasat që orkestrojnë veprimet: për librat katër raste, për anëtarët pesë (përfshi historinë e huazimeve të anëtarit), për huazimet dhe raportet gjashtë raste të lidhura me BorrowController. Këto klasa implementojnë IUseCase dhe përdorin interfejsat e depozitës dhe strategjinë. Regjistrimi i anëtarit nëpërmjet AuthController bëhet me SupabaseAuthService sipas IAuthService (në kod nuk ka klasë të veçantë UseCase për signup, por roli është i ngjashëm me orkestrimin e veçantë).

Shtresa e kontrolluesve përfaqëson hyrjen HTTP: AuthController, BookController, MemberController dhe BorrowController thërrasin rastet e përdorimit për veprimet që kërkojnë stafi ose anëtari sipas rrugës dhe rolit.

Marrëdhëniet kryesore janë: varësia midis kontrolluesve dhe rasteve të përdorimit; varësia midis rasteve dhe interfejsave të depozitës ose zgjidhësit të strategjisë; implementimi i interfejsave nga depozitat dhe nga strategjitë; trashëgimia e dy depozitave nga BaseRepository. Diagrami mbetet një pasqyrë e qartë e arkitekturës, duke lidhur të dhënat, logjikën e aplikacionit dhe hyrjen HTTP në një model të qëndrueshëm dhe të zgjerueshëm.

 5. Diagramet e Sekuencës (sequence diagrams) 

Diagramat e sekuencës ilustrojnë rrjedhën e mesazheve midis objekteve gjatë dy veprimeve kryesore: **krijimi i librit** (roli staf) dhe **huazimi i librit** (roli anëtar). Pjesëmarrësit janë klienti (shfletues ose mjet REST), framework-u Fastify, kontrolluesi, rasti i përdorimit, depozita që ekzekuton SQL përmes Supabase, dhe përgjigja HTTP. Në diagram përdoren lifelines me kuti aktivizimi që tregojnë kur secili objekt ekzekuton kod.

5.1 Krijimi i librit (diagrami i sekuencës)

1. Klienti dërgon kërkesë **HTTP POST** në rrugën `/books` me trup JSON (titull, autor, ISBN) dhe me header **Authorization** me token të përdoruesit me rol **staf** (kërkesa kalon nga middleware i autentikimit dhe i autorizimit para kontrolluesit).

2. **Fastify** e kalon kërkesën te metoda përkatëse e **BookController** (krijim libri).

3. **BookController** lexon të dhënat nga trupi i kërkesës dhe thërret **CreateBookUseCase.execute(input)** me fushat e pranuara.

4. **CreateBookUseCase** ndërton një instancë të ri të entitetit **Book** (identifikues i ri, fushat nga hyrja, në fillim i disponueshëm) dhe thërret **IBookRepository.create(book)**; në kod implementimi është **BookRepository**, i cili kryen **insert** në Supabase për tabelën e librave.

5. Në **sukses**, depozita kthen entitetin **Book**; kontrolluesi përgjigjet me kod **201** dhe trup JSON nga **book.toJSON()**. Në **dështim** (p.sh. gabim nga baza ose rregull biznesi), përgjigjja është **400** (ose **404** ku aplikohet) me mesazh përshkrues.

5.2 Huazimi i librit (diagrami i sekuencës)

1. Klienti dërgon **HTTP POST** në `/borrow` me trup **vetëm** `{ bookId }` dhe me token përdoruesi me rol **anëtar**. Identiteti i anëtarit (**memberId**) **nuk** lexohet nga trupi i kërkesës; vendoset nga middleware-i i autentikimit si **request.user.id** pas verifikimit të JWT.

2. **Fastify** e kalon kërkesën te **BorrowController** (metoda e huazimit).

3. **BorrowController** thërret **BorrowBookUseCase.execute** me `bookId` nga trupi dhe `memberId` nga përdoruesi i autentikuar.

4. **BorrowBookUseCase** lexon librin dhe anëtarin përmes **IBookRepository.findById** dhe **IMemberRepository.findById**. Nëse mungon libri ose anëtari, përfundon me **null** dhe kontrolluesi kthen **400**.

5. Use case-i merr strategjinë përmes **MemberTypeBorrowingStrategyResolver.resolve(member)** (implementim i **IBorrowingStrategyResolver**), pastaj thërret **canBorrow(member, book)** në strategjinë e zgjedhur. Nëse nuk lejohet huazimi, përfundon me **null** dhe përgjigjja është **400**.

6. Në degën e **suksesit**: llogaritet **dueDate** nga **getBorrowDuration()** i strategjisë; përditësohet libri si i pa disponueshëm përmes **IBookRepository.update**; krijohet rekord **BorrowRecord** dhe ruhet përmes **IBorrowRepository.create**; kontrolluesi kthen **201** me **record.toJSON()**.

7. Mesazhet kthehen nga depozita te rasti i përdorimit, nga rasti te kontrolluesi, dhe nga kontrolluesi te klienti; në diagram fragmenti **alt** mund të ndajë degët e suksesit dhe të dështimit sipas hapit 4–5 dhe 6.

 

Diagram 3. Diagramet e sekuencës për krijimin e librit dhe huazimin e librit.

# Përmbledhje diagramesh sekuence (anglisht)

## 1. Create Book Sequence Diagram

### Participants (left → right)
Client, Fastify, `BookController`, `CreateBookUseCase`, `BookRepository` (lifeline: implementim i `IBookRepository`), përgjigje HTTP.

### Flow
1. Client: `POST /books` me header Authorization (staf).
2. Fastify → `bookController.create(request, reply)`.
3. `BookController` lexon trupin, thërret `createBookUseCase.execute(input)`.
4. `CreateBookUseCase` validon / ndërton entitetin `Book`, thërret `bookRepository.create(...)` (ose ekuivalenti në kod).
5. `BookRepository` ekzekuton insert në Supabase; kthen entitetin ose hedh gabim.
6. Controller: `201` me JSON nga `book.toJSON()` ose `400` me mesazh.

### Vizatim
Lifelines me aktivizim mbi controller, use case dhe repository; kthimet shfaqen drejt klientit.

---

## 2. Borrow Book Sequence Diagram

### Participants (left → right)
Client, Fastify, `BorrowController`, `BorrowBookUseCase`, `BookRepository`, `MemberRepository`, `MemberTypeBorrowingStrategyResolver`, `IBorrowingStrategy` (strategjia e zgjedhur), `BorrowRepository`.

### Flow
1. Client: `POST /borrow` me `{ bookId }` dhe token anëtari.
2. Middleware (para controller-it) verifikon JWT dhe vendos `request.user.id` si identitet anëtari.
3. `BorrowController.borrow` → `borrowBookUseCase.execute({ bookId, memberId: request.user.id })`.
4. `BorrowBookUseCase`: `findById` libër; `findById` anëtar; `strategyResolver.resolve(member)`; `strategy.canBorrow(member, book)`; nëse OK, `getBorrowDuration()`, përditësim libri, `borrowRepository.create` me `dueDate`.
5. Në degën **sukses**: shkruaj rekord huazimi (`BorrowRepository`), përditëso libër të pa disponueshëm nëse kërkohet nga rregullat; kthe `201` me rekord.
6. Në degën **dështim** (libri i zënë, limit strategjie, etj.): kthe `400` pa krijuar rekord të ri.

### Fragment `alt`
- **[success]**: mesazhe te repository për insert huazimi + përditësim libri; përgjigje `201`.
- **[failure]**: dalje herët; përgjigje `400`.

---

## Modeli i shtresave (përputhje me kodin)

```text
Controller → UseCase → (Repository interfaces + Strategy resolver) → Supabase / PostgreSQL
```

Use case-i përmban orkestrimin; repository-t mbajnë SQL/query; strategjitë mbajnë rregulla huazimi pa ditur për Supabase.

---

## 6. Diagrami i Aktivitetit (activity diagram)




 

Diagrami i aktivitetit për procesin e huazimit të librit përfaqëson rrjedhën hap pas hapi nga kërkesa e një anëtari deri tek regjistrimi i suksesit ose dështimit të huazimit. Ai përdor nyja fillestare dhe përfundimtare, aktivitete të shprehura në forma të rrumbullakëta (rounded rectangles), pika vendimi (diamonds) për kontrollin e kushteve, dhe flukse me etiketa “Po”/“Jo”. Opsionalisht mund të përdoren swimlanes për të ndarë përgjegjësitë midis aktorëve dhe sistemit. 

Procesi fillon me kërkesën për huazim (me token të vlefshëm anëtari) dhe përfshin: verifikimin e identitetit, kërkimin e librit, kontrollin e disponueshmërisë, kërkimin e anëtarit dhe verifikimin e të drejtave të huazimit sipas strategjisë së përcaktuar. Në rast se ndonjë kusht nuk plotësohet (libri nuk ekziston, anëtari nuk ekziston, ose strategjia e huazimit e ndalon), procesi përfundon me gabim. Në rast të suksesit, sistemi llogarit kohëzgjatjen e huazimit, përditëson statusin e librit në “i huazuar”, krijon rekord të ri BorrowRecord dhe kthen këtë rekord si rezultat të suksesshëm. 

Ky diagram siguron një vizualizim të qartë të rrjedhës logjike dhe vendimeve kritike gjatë huazimit, duke ndihmuar zhvilluesit dhe përdoruesit teknikë të kuptojnë logjikën e sistemit dhe të ndjekin çdo hap të procesit. 

 

Diagram 5. Diagrami i aktivitetit të sistemit. 

 

 

7. Arkitektura dhe parimet e dizajnit 

Sistemi i Menaxhimit të Bibliotekës është zhvilluar mbi një arkitekturë të pastër me shtresa të ndara në backend, me një klient React që konsumon API-në dhe Supabase për sesion në shfletues, me qëllim ndarje të qartë përgjegësish, varësi të dobëta, testim më të lehtë dhe zgjerim të kontrolluar. 

7.1. Shtresat kryesore të arkitekturës 

**Application entry point (`app.ts`)** — Krijohen instancat e repository-ve Supabase, strategjive, resolver-it, use case-ve, controller-ve dhe `SupabaseAuthService`; të gjitha lidhen me konstruktorë (dependency injection).

**Controller layer** — `AuthController`, `BookController`, `MemberController`, `BorrowController`: lexojnë kërkesën, thërrasin një use case, vendosin kodin HTTP dhe trupin JSON. Autorizimi bëhet me middleware (`authMiddleware`, `requireRole('staff' | 'member')`).

**Use case layer** — Një klasë për një veprim aplikacioni (`CreateBookUseCase`, `GetAllBooksUseCase`, `UpdateBookUseCase`, `DeleteBookUseCase`, `CreateMemberUseCase`, `GetAllMembersUseCase`, `UpdateMemberUseCase`, `DeleteMemberUseCase`, `GetMemberBorrowHistoryUseCase`, `BorrowBookUseCase`, `ReturnBookUseCase`, `GetAllBorrowsUseCase`, `GetMyActiveBorrowsUseCase`, `GetMyBorrowHistoryUseCase`, `GetMemberLoanPeriodUseCase`). Secila implementon `IUseCase` dhe merr në konstruktor vetëm interface-e repository-je ose resolver strategjie, jo klient Supabase drejtpërdrejt.

**Infrastructure layer** — `BookRepository`, `MemberRepository`, `BorrowRepository` implementojnë kontratat e domenit dhe përdorin `@supabase/supabase-js`. `SupabaseAuthService` lidh token-in me anëtarin në bazë.

**Services (strategji)** — `StandardBorrowingStrategy`, `StudentBorrowingStrategy`, `PremiumBorrowingStrategy` dhe `MemberTypeBorrowingStrategyResolver`: polimorfizëm për rregulla huazimi; nuk zëvendësojnë repository-t.

**Domain layer** — Entitetet `Book`, `Member`, `BorrowRecord` dhe interface-et në `domain/interfaces/` (përfshi `IBorrowRepository` për huazime, raport dhe histori të faqezuar).
 

 

 

 

 

 

7.2 Parimet e programimit të orientuar në objekt (OOP) 

**Abstraksion** — Interface-et e repository-ve dhe `IBorrowingStrategy` fshehin implementimin Supabase / SQL.

**Trashëgimia** — Strategjitë e ndryshme të huazimit ndajnë sjellje të përbashkëta përmes kontratës së njëjtë; nuk përdoret `BaseLibraryService` në kodin aktual.

**Polimorfizëm** — `MemberTypeBorrowingStrategyResolver` kthen strategji sipas `MemberType`; `BorrowBookUseCase` punon me `IBorrowingStrategy` pa ditur klasën konkrete.

**Encapsulation** — Entitetet mbajnë fushat dhe metoda si `toJSON()` për dalje të kontrolluar API.

**Interface-t** — `IUseCase`, repository interface-et dhe strategjia lidhin komponentët me kontrata të qarta për testim dhe zgjerim. 

 

 

 

 

 

Diagrami 6. Dizajni i Arkitekturës me shtresa të sistemit. 


# Përshkrim i Diagramit 6 — shtresa (për veglë UML)

Diagrami horizontal me katër bllokë kryesorë: **Application (`app.ts`)**, **Controllers dhe middleware autentikimi**, **Use cases dhe strategji huazimi**, **Repositories Supabase dhe entitete domeni**.

Zinxhiri i varësisë për vizatim:

```text
app.ts
  → Controllers (AuthController, BookController, MemberController, BorrowController)
      → Use cases (lista në seksionin 7.1)
          → IBookRepository / IMemberRepository / IBorrowRepository
                (BookRepository, MemberRepository, BorrowRepository)
          → MemberTypeBorrowingStrategyResolver → IBorrowingStrategy
```

**SRP** — Controllers pa logjikë biznesi; një use case për një veprim aplikacioni; repository për qasje në të dhëna; strategji vetëm për rregulla huazimi.

**DIP** — Use case-et varen nga interface-et; klasat konkrete të repository-ve krijohen në `app.ts`.

**OCP** — Strategji të reja huazimi regjistrohen në resolver pa ndryshuar kodin ekzistues të use case-it të huazimit, për sa kohë kontrata `IBorrowingStrategy` mbahet.

Shënim: përshkrimi i mëparshëm me BookService, lidhje të gabuara controller–use case dhe emra strategjish të pavërtetë nuk duhet kopjuar në diagram; u zëvendësua me këtë përmbledhje që përputhet me repozitorin.

---

Implementimi dhe përdorimi 

Sistemi është dizajnuar sipas parimeve të Clean Architecture dhe Dependency Inversion: controller-et janë të hollë, use case-et orkestrojnë, repository-t izolojnë Supabase/PostgreSQL, strategjitë izolojnë rregullat e huazimit. Ruajtja është **reale** në Supabase; nuk përdoren koleksione në memorie.

**Strategjia e huazimit** (`StandardBorrowingStrategy`, `StudentBorrowingStrategy`, `PremiumBorrowingStrategy`) zgjidhet nga `MemberTypeBorrowingStrategyResolver` sipas `memberType`. **BorrowBookUseCase** kombinon repository-t dhe strategjinë pa ekspozuar SQL te controller-i.

**Përfitimet kryesore:** modularitet (shtresa të ndara), testueshmëri më e lehtë (mock i interface-ve), ndryshime të fokusuara (p.sh. rregullat e huazimit vetëm në strategji), dhe zgjerim i ardhshëm përmes repository-ve ose migrimeve SQL pa prishur use case-et.

Zgjerueshmëria nuk kërkon “kalim nga memorie në PostgreSQL” — sistemi është tashmë në PostgreSQL; ndryshime të mundshme në të ardhmen (p.sh. lexim nga read replica) mbeten të kufizuara në shtresën e repository-ve. 

 

 

 

 

 

Konkluzioni 

Sistemi i menaxhimit të bibliotekës përfaqëson një zbatim të qartë të parimeve të Clean Architecture, SOLID dhe Dependency Inversion mbi një stack modern: **API Fastify + TypeScript**, **klient React**, **Supabase (Auth + PostgreSQL)**. Qasja në të dhëna kalon përmes repository-ve; rregullat e huazimit përmes strategjive dhe resolver-it; përgjigjet API përdorin entitete me `toJSON()` për fusha të qëndrueshme.

Use case-et si `BorrowBookUseCase` dhe `GetMyBorrowHistoryUseCase` mbajnë orkestrimin pa u përzier me detajet e Supabase-it në controller. Frontend-i përdor TanStack Query për cache dhe mbrojtje rrugësh me `beforeLoad` sipas rolit.

Ky model e bën sistemin të qëndrueshëm për përdorim real dhe të gatshëm për zgjerime (p.sh. njoftime afati, eksport raportesh) kryesisht përmes shtresës së repository-ve dhe use case-ve të reja, pa prishur kontratat ekzistuese të API-së. 

 
 

 

 

 