import React, { useState, useEffect, useCallback } from "react";
// Importa il database configurato da Firebase
import { db } from './firebaseConfig';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

function SecurityQuiz() {
  const [stage, setStage] = useState("loading"); // Impostato su loading iniziale
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [adminMode, setAdminMode] = useState(false);
  const [userHistory, setUserHistory] = useState([]); 
  const [allUsers, setAllUsers] = useState([]); // Nuovo stato per gli utenti da Firebase

  // --- Costanti e Dati Iniziali ---

  const CATEGORIES = [
    "Esercitazione Teoria Generale",
    "Esercitazione Categoria A1",
    "Esercitazione Categoria A2",
    "Esercitazione Categoria A3",
    "Esercitazione Categoria A4",
    "Esercitazione Categoria A5",
    "Esercitazione Lingua Inglese",
  ];

  const INITIAL_QUESTIONS = [ // Rinominato ALL_QUESTIONS in INITIAL_QUESTIONS
 {
      id: 3,
      category: "Esercitazione Categoria A1",
      text: "Le Guardie Particolari Giurate impiegate presso i varchi di accesso all'area sterile:",
      options: ["Devono prestare servizio con armi", "Devono prestare servizio senza armi", "Possono prestare servizio con armi"],
      answer: 1,
      image: "",
    },
    {
      id: 4,
      category: "Esercitazione Categoria A1",
      text: "I liquidi durante la preparazione ai controlli con apparecchiatura RX:",
      options: ["Basta verificarli anche successivamente al passaggio ai varchi security", "Possono rimanere all’interno del bagaglio", "Vanno sempre preventivamente separati dal bagaglio"],
      answer: 2,
      image: "",
    },
    {
      id: 5,
      category: "Esercitazione Categoria A1",
      text: "Le postazioni di controllo per i passeggeri e i loro bagagli a mano devono essere posizionate:",
      options: ["All'ingresso del Terminal", "All'ingresso di un'area sterile", "All'ingresso del gate"],
      answer: 1,
      image: "",
    },
    {
      id: 6,
      category: "Esercitazione Categoria A1",
      text: "I 'Paesi Terzi' che applicano norme di sicurezza riconosciute equivalenti alle norme fondamentali comuni, per quanto riguarda i passeggeri e il bagaglio a mano, sono elencati nell'appendice?",
      options: ["4-B", "2-A", "3-C"],
      answer: 0,
      image: "",
    },
    {
      id: 7,
      category: "Esercitazione Categoria A1",
      text: "Cosa deve assicurare il Gestore aeroportuale per quanto attiene la postazione di controllo dei bagagli da stiva?",
      options: ["Sia adeguatamente separata dalla zona di trattamento dei bagagli da stiva", "Sia adeguatamente separata dalla zona di trattamento dei bagagli da stiva, insonorizzata e climatizzata, dimensionata in relazione alle tipologie di apparecchiature utilizzate e al numero degli addetti in servizio", "Sia adeguatamente dimensionata in relazione alle tipologie di apparecchiature utilizzate e al numero degli addetti in servizio"],
      answer: 1,
      image: "",
    },
    {
      id: 8,
      category: "Esercitazione Categoria A1",
      text: "Sono previsti controlli di sicurezza specifici per le calzature indossate dai passeggeri in partenza su voli con destinazione classificata sensibile di LIVELLO 3 (Alto)?",
      options: ["Tutte le calzature dei passeggeri in partenza su voli con destinazione classificata sensibile di LIVELLO 3 (Alto) sono sottoposte a controllo radiogeno", "No", "Si, almeno il 20% delle calzature deve essere controllato anche tramite E.T.D."],
      answer: 2,
      image: "",
    },
    {
      id: 9,
      category: "Esercitazione Categoria A1",
      text: "Gli oggetti trasportati dalle persone diverse dai passeggeri, sono:",
      options: ["Beni destinati all'uso personale", "Beni destinati all'uso continuato", "Beni destinati ai fini del servizio"],
      answer: 0,
      image: "",
    },
    {
      id: 10,
      category: "Esercitazione Categoria A1",
      text: "Per 'Delivery At Aircraft' di intende:",
      options: ["Il materiale del Duty Free messo in vendita a bordo", "Il materiale di cabina utilizzato dall'equipaggio durante il volo", "Il bagaglio a mano che viene ritirato sottobordo per essere stivato"],
      answer: 2,
      image: "",
    },
    {
      id: 11,
      category: "Esercitazione Categoria A1",
      text: "Dove sono elencati i 'Paesi Terzi' che applicano norme di sicurezza riconosciute equivalenti alle norme fondamentali comuni per quanto riguarda il bagaglio da stiva?",
      options: ["Nell'Appendice 4-C", "Nell'Appendice 5-A", "Nell'Appendice 4-A"],
      answer: 1,
      image: "",
    },
    {
      id: 12,
      category: "Esercitazione Categoria A1",
      text: "Qualora un passeggero presenti al punto di controllo liquidi in contenitori superiori a 100ml costituiti da medicinali l'addetto sicurezza:",
      options: ["Procederà a controllo con apparati LEDS", "Non procederà ad alcun controllo in quanto i medicinali ne sono esenti", "Richiederà al passeggero la prescrizione medica e procederà a controllo con apparati LEDS"],
      answer: 0,
      image: "",
    },
{
      id: 13,
      category: "Esercitazione Categoria A1",
      text: "Di chi è la responsabilità di garantire l'attuazione delle misure speciali di controllo per il personale diplomatico?",
      options: ["La Polizia di Frontiera", "Entrambe le altre risposte sono corrette", "Il Gestore aeroportuale"],
      answer: 1,
      image: "",
    },
{
      id: 14,
      category: "Esercitazione Categoria A1",
      text: "Cosa s’intende per dispositivi assemblati?",
      options: ["Dei sistemi a circuito interno", "Dei telefoni cellulari", "L’insieme di componenti collegati tra loro idonei a provocare l’esplosione o l’incendio"],
      answer: 2,
      image: "",
    },
{
      id: 15,
      category: "Esercitazione Categoria A1",
      text: "Le postazioni di controllo devono essere collocate in modo che le persone ed i loro bagagli a mano, già controllati:",
      options: ["Non possano entrare in contatto con i passeggeri già controllati in partenza verso destinazioni dichiarate sensibili", "Non possano entrare in contatto con persone ed oggetti che non siano stati sottoposti ai controlli di sicurezza", "Siano nella disponibilità dei passeggeri che devono ancora ultimare i controlli di sicurezza"],
      answer: 1,
      image: "",
    },
{
      id: 16,
      category: "Esercitazione Categoria A1",
      text: "Che cosa si intende per S.T.E.B.?",
      options: ["Sacchetto richidibile utilizzabile per i liquidi per un certo lasso di tempo (security time-extended bag, STEB)", "Sacchetto in grado di evidenziare eventuali manomissioni (security tamper-evident bag, STEB)", "Sacchetto in grado di evidenziare il contenuto per gli oggetti vietati (security tools-evident bag, STEB)"],
      answer: 1,
      image: "",
    },
{
      id: 17,
      category: "Esercitazione Categoria A1",
      text: "Quali delle seguenti metodologie possono essere impiegate per lo screening dei passeggeri?",
      options: ["Ispezione manuale", "Portale magnetico (W.T.M.D.)", "Entrambe le altre risposte sono corrette, anche in combinazione tra loro se ritenuto opportuno"],
      answer: 2,
      image: "",
    },
{
      id: 18,
      category: "Esercitazione Categoria A1",
      text: "Durante il controllo del passeggero è necessario che vengano tolti cappotti e/o giacche?",
      options: ["No, è una misura applicabile solo allo staff", "Si", "Solo se sono voluminosi e potrebbero celare qualcosa"],
      answer: 1,
      image: "",
    },
{
      id: 19,
      category: "Esercitazione Categoria A1",
      text: "Cosa deve assicurare il Gestore aeroportuale per quanto riguarda la protezione del bagaglio da stiva?",
      options: ["Il Gestore aeroportuale non è il soggetto responsabile che deve assicurare la protezione del bagaglio da stiva", "La Polizia di Stato assicura la protezione del bagaglio da interferenze illecite dal punto in cui è stato accettato fino a quando non viene preso in consegna dal vettore/handler nell'area trattamento bagagli", "Sia protetto da interferenze illecite dal punto in cui è stato accettato fino a quando non viene preso in consegna dal vettore/handler nell'area trattamento bagagli"],
      answer: 2,
      image: "",
    },
{
      id: 20,
      category: "Esercitazione Categoria A1",
      text: "Cosa deve assicurare il vettore aereo per quanto riguarda la protezione del bagaglio da stiva?",
      options: ["Il vettore aereo non deve assicurare che il bagaglio da stiva sia protetto da interferenze illecite dal momento in cui lo prende in consegna dal Gestore aeroportuale, direttamente o tramite l'handler, fino al caricamento a bordo dell'aeromobile", "Il vettore aereo deve assicurare che il bagaglio da stiva sia protetto da interferenze illecite dal momento in cui lo prende in consegna dal Gestore aeroportuale, direttamente o tramite l'handler, fino al caricamento a bordo dell'aeromobile", "La Polizia di Stato deve assicurare che il bagaglio da stiva sia protetto da interferenze illecite dal momento in cui lo prende in consegna dal Gestore aeroportuale, direttamente o tramite l'handler, fino al caricamento a bordo dell'aeromobile"],
      answer: 1,
      image: "",
    },
{
      id: 21,
      category: "Esercitazione Categoria A1",
      text: "Si definisce personale diplomatico e consolare secondo quale Convenzione:",
      options: ["Montreal", "Varsavia", "Roma"],
      answer: 1,
      image: "",
    },
{
      id: 22,
      category: "Esercitazione Categoria A1",
      text: "Salvo diversa indicazione, chi è che provvede in base al P.N.S., all'attuazione delle misure illustrate nel Cap.5 - Bagaglio da stiva?",
      options: ["L'autorità e il soggetto responsabile", "L'autorità, l'operatore aeroportuale, il vettore aereo o il soggetto responsabile", "Solo l'autorità"],
      answer: 1,
      image: "",
    },
{
      id: 23,
      category: "Esercitazione Categoria A1",
      text: "Quali, tra i seguenti, è un titolo che NON autorizza l’accesso all’area lato volo dell’aeroporto?",
      options: ["Il tesserino di polizia", "Il TIA (Tesserino d’Ingresso in Aeroporto)", "La carta d’imbarco elettronica"],
      answer: 0,
      image: "",
    },
{
      id: 24,
      category: "Esercitazione Categoria A1",
      text: "La protezione del bagaglio da stiva:",
      options: ["Non è una misura obbligatoria", "Non richiede personale certificato quale addetto alla sicurezza", "E' una delle tre misure fondamentali per la sicurezza del bagaglio da stiva"],
      answer: 2,
      image: "",
    },
{
      id: 25,
      category: "Esercitazione Categoria A1",
      text: "Il Gestore aeroportuale deve dare corretta e costante informazione ai passeggeri ed al pubblico di:",
      options: ["Misure di sicurezza e divieto di lasciare il bagaglio incustodito", "Misure di sicurezza", "Informazioni commerciali"],
      answer: 0,
      image: "",
    },
{
      id: 26,
      category: "Esercitazione Categoria A1",
      text: "In quale documento sono contemplate le misure per i voli dichiarati 'Sensibili'?",
      options: ["Regolamento (UE) 1998 del 2015", "Decisione della Commissione 8005 del 2015", "Programma Nazionale per la Sicurezza dell'Aviazione Civile"],
      answer: 2,
      image: "",
    },
{
      id: 27,
      category: "Esercitazione Categoria A1",
      text: "Gli oggetti elettrici di grosse dimensioni che devono essere tolti dal bagaglio a mano ed essere sottoposti a screening separatamente, sono approssimativamente di misura:",
      options: ["A4 (21cm x 30cm) o maggiore", "A6 (11cm x 15cm) o maggiore", "A5 (21cm x 15cm) o maggiore"],
      answer: 2,
      image: "",
    },
{
      id: 28,
      category: "Esercitazione Categoria A1",
      text: "Quando è utilizzata un'apparecchiatura a raggi X per lo screening del bagaglio a mano, deve essere, inoltre, attuata almeno una delle seguenti misure:",
      options: ["Almeno il 10% del bagaglio a mano, selezionato su base casuale e continua, deve essere sottoposto a screening mediante dispositivi ETD", "Qualora un software TIP sia installato ed in uso, almeno il 5% del bagaglio a mano, selezionato su base casuale e continua, deve essere sottoposto a screening mediante dispositivi ETD", "Entrambe le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 29,
      category: "Esercitazione Categoria A1",
      text: "Le Guardie particolari Giurate impiegate presso le postazioni di controllo, devono prestare servizio:",
      options: ["Nessuna armata", "Almeno il Supervisore della postazione armato", "Almeno 1 armata"],
      answer: 0,
      image: "",
    },
{
      id: 30,
      category: "Esercitazione Categoria A1",
      text: "Una postazione di controllo che processasse meno di 500 pax al giorno può essere costituita da:",
      options: ["2 addetti di sicurezza", "4 addetti di sicurezza", "3 addetti di sicurezza"],
      answer: 2,
      image: "",
    },
{
      id: 31,
      category: "Esercitazione Categoria A1",
      text: "Se durante un controllo RX di un bagaglio a mano risultasse evidente la presenza di un I.E.D.:",
      options: ["Il bagaglio deve essere controllato con apparato EDS per confermare la presenza dell'IED", "Il bagaglio deve essere controllato con apparato ETD per confermare la presenza dell'IED", "Il bagaglio deve rimanere all'interno della macchina RX per evitare che il passeggero possa prenderlo"],
      answer: 2,
      image: "",
    },
{
      id: 32,
      category: "Esercitazione Categoria A1",
      text: "Chi assicura che le postazioni di controllo siano dotate di apparecchiature rispondenti ai requisiti previsti dal Regolamento (UE) 1998 del 2015?",
      options: ["Commissione Europea", "Gestore aeroportuale", "E.N.A.C."],
      answer: 1,
      image: "",
    },
{
      id: 33,
      category: "Esercitazione Categoria A1",
      text: "Chi è responsabile dell'attuazione di tutte le misure di sicurezza contenute nel Capitolo 1 del P.N.S.?",
      options: ["Il Gestore aeroportuale e/o ente preposto al controllo e/o vettore", "L'ente preposto al controllo e/o il vettore", "Il Gestore aeroportuale e/o il vettore"],
      answer: 0,
      image: "",
    },
{
      id: 34,
      category: "Esercitazione Categoria A1",
      text: "Il bagaglio a mano non ritirato dal passeggero dopo lo screening deve immediatamente essere identificato come tale dagli addetti al controllo ed essere:",
      options: ["Lasciato al suo posto in attesa del ritorno del passeggero che lo ha dimenticato", "Sottoposto a nuovo controllo radiogeno e consegnato al Supervisore", "Consegnato alla Polizia di Stato"],
      answer: 1,
      image: "",
    },
{
      id: 35,
      category: "Esercitazione Categoria A1",
      text: "Quali delle seguenti categorie di passeggeri sono dispensate dal controllo di sicurezza?",
      options: ["Presidenti, Capi di Stato, personale diplomatico", "Membri delle famiglie Reali, Capi Religiosi ufficiali", "Capi di Stato e Ministri con i loro familiari"],
      answer: 1,
      image: "",
    },
{
      id: 36,
      category: "Esercitazione Categoria A1",
      text: "Quando, il bagaglio da stiva non accompagnato, può essere trasportato a bordo di un aeromobile?",
      options: ["Quando la separazione del bagaglio dal passeggero si sia verificata per fattori indipendenti dalla volontà del passeggero e lo stesso bagaglio sia stato sottoposto ai controlli previsti", "Solo se autorizzato dal Comandante dell'aeromobile", "Mai"],
      answer: 0,
      image: "",
    },
{
      id: 37,
      category: "Esercitazione Categoria A1",
      text: "I titolari del tesserino multiservizi rilasciato dall’autorità nazionale competente con banda tricolore:",
      options: ["Sono esentati dallo screening sulla persona e NON degli oggetti trasportati, sul tesserino è apposta la dicitura ESENTE che legittima la suddetta esenzione", "Sono esentati dallo screening sulla persona e degli oggetti trasportati, sul tesserino è apposta la dicitura ESENTE che legittima la suddetta esenzione", "Sono esentatati dallo screening degli oggetti trasportati ma non sulla persona, sul tesserino è apposta la dicitura ESENTE che legittima la suddetta esenzione."],
      answer: 1,
      image: "",
    },
{
      id: 38,
      category: "Esercitazione Categoria A1",
      text: "Da quanti addetti deve essere composta una postazione di sicurezza dedicata ai passeggeri di Aviazione Generale?",
      options: ["2", "3", "4"],
      answer: 0,
      image: "",
    },
{
      id: 39,
      category: "Esercitazione Categoria A1",
      text: "Se un passeggero si presenta all'ingresso dell'area sterile con uno S.T.E.B. contenente una confezione di profumo superiore a 100ml, può introdurla?",
      options: ["Si, se lo S.T.E.B. riporta il logo dell'aeroporto dove è avvenuto l'acquisto ed è presente la ricevuta di acquisto", "Si, se all'interno dello S.T.E.B. vi è una prova soddisfacente che l'acquisto è avvenuto in area sterile o a bordo di un aeromobile", "Si, se lo S.T.E.B. riporta il logo dell'aeroporto dove è avvenuto l'acquisto"],
      answer: 1,
      image: "",
    },
{
      id: 40,
      category: "Esercitazione Categoria A1",
      text: "Quale disposizione è obbligatoria per il personale aeroportuale:",
      options: ["Presentarsi privi di oggetti metallici sulla persona", "Presentarsi con apparati elettrici/elettronici di grandi dimensioni separati dal bagaglio a mano", "Presentarsi con cappotti o giacche non indossati"],
      answer: 0,
      image: "",
    },
{
      id: 41,
      category: "Esercitazione Categoria A1",
      text: "La zona della cintura, nel controllo della persona:",
      options: ["Basta far togliere la cintura al passeggero e si può saltare", "E' una parte fondamentale da verificare nelle corrette modalità previste", "E' una parte da eseguire a campione"],
      answer: 1,
      image: "",
    },
{
      id: 42,
      category: "Esercitazione Categoria A1",
      text: "Nell’attentato terroristico progettato a Londra e scoperto preventivamente dalla Polizia i terroristi avrebbero voluto:",
      options: ["Far detonare esplosivi liquidi collocati all’interno di bottigliette di plastica all’interno dell’aeroporto di London Heathrow", "Far detonare esplosivi liquidi collocati all’interno di bottigliette di plastica su diverse linee aeree le cui rotte collegavano diverse città del Regno Unito", "Far detonare esplosivi liquidi collocati all’interno di bottigliette di plastica su diverse linee aeree le cui rotte collegavano, Regno Unito, Stati Uniti e Canada"],
      answer: 2,
      image: "",
    },
{
      id: 43,
      category: "Esercitazione Categoria A1",
      text: "Come deve procedere l’addetto alla sicurezza in caso di allarme LED dopo tutte le procedure di screening?",
      options: ["Utilizzando nuovamente l’apparecchiatura RX", "Con un controllo manuale del passeggero e bagaglio a mano nonché a contestuale intervista", "Con un controllo ETD"],
      answer: 1,
      image: "",
    },
{
      id: 44,
      category: "Esercitazione Categoria A1",
      text: "I passeggeri in transito indiretto devono essere sempre controllati?",
      options: ["Solo se entrano in contatto con altri passeggeri non sottoposti a controllo di altri voli", "Solo se provengono da un altro stato dell'Unione Europea", "Sempre"],
      answer: 0,
      image: "",
    },
{
      id: 45,
      category: "Esercitazione Categoria A1",
      text: "Il controllo di un aninamle vivo trasportato in cabina:",
      options: ["Il controllo deve essere effettuato solo manualmente", "In cabina non è previsto il trasporto di animali vivi", "Il controllo deve essere effettuato nel modo più completo in considerazione della tipologia dell'animale"],
      answer: 2,
      image: "",
    },
{
      id: 46,
      category: "Esercitazione Categoria A1",
      text: "I dispositivi S.M.D. ed i dispositivi S.E.D. possono essere utilizzati solo come modalità:",
      options: ["Supplementare di screening", "Ausiliaria di screening", "Complementare di screening"],
      answer: 0,
      image: "",
    },
{
      id: 47,
      category: "Esercitazione Categoria A1",
      text: "Nell'Appendice 1-A negli articoli proibiti, rientrano anche:",
      options: ["Altri articoli in grado di essere utilizzati per provocare ferite gravi", "Altri articoli in grado di essere utilizzati per provocare contusioni", "Altri articoli in grado di essere utilizzati per provocare ferite lievi"],
      answer: 0,
      image: "",
    },
{
      id: 48,
      category: "Esercitazione Categoria A1",
      text: "Tutti gli oggetti al seguito del personale esentato dai controlli di sicurezza:",
      options: ["Non sono esentati dal controllo di sicurezza", "Sono esentati dal controllo di sicurezza", "Sono esentati solamente gli oggetti personali utilizzati a scopo privato"],
      answer: 2,
      image: "",
    },
{
      id: 49,
      category: "Esercitazione Categoria A1",
      text: "Prima dello screening dei passeggeri i cappotti e le giacche ovvero i capispalla:",
      options: ["Devono essere tolti e sottoposti a screening come bagaglio a mano", "Non devono essere tolti e sottoposti a screening come bagaglio a mano", "Possono essere tolti e sottoposti a screening come bagaglio a mano"],
      answer: 0,
      image: "",
    },
{
      id: 50,
      category: "Esercitazione Categoria A1",
      text: "Sono dispensate dal controllo di sicurezza le seguenti categorie di passeggeri ed il loro baglio a mano:",
      options: ["Deputati", "Membri delle famiglie Reali", "Forze di Polizia fuori servizio"],
      answer: 1,
      image: "",
    },
{
      id: 51,
      category: "Esercitazione Categoria A1",
      text: "Con il TIA di colore giallo è consentito l’ingresso:",
      options: ["Aree non sterili", "Area sterile limitatamente alla parte interne", "Area sterile interna ed esterna"],
      answer: 0,
      image: "",
    },
{
      id: 52,
      category: "Esercitazione Categoria A1",
      text: "I dispositivi E.T.D. in combinazione ai dispositivi H.H.M.D., per le aree in cui l'ispezione manuale non sia possibile od opportuna, devono essere applicati:",
      options: ["Direttamente sull'area", "Sulle estremità/aperture delle ingessature", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 53,
      category: "Esercitazione Categoria A1",
      text: "La Guardia particolare Giurata che effettua l'attività di scorta e sorveglianza di un'arma spedita dal passeggero deve essere:",
      options: ["Il fatto di essere armata è a discrezione dell'impresa di sicurezza", "Non armata", "Armata"],
      answer: 1,
      image: "",
    },
{
      id: 54,
      category: "Esercitazione Categoria A1",
      text: "I passeggeri diplomatici devono essere controllati?",
      options: ["Si, ma con procedure speciali", "Solo se non hanno una lettera di accreditamento", "No, sono esenti"],
      answer: 0,
      image: "",
    },
{
      id: 55,
      category: "Esercitazione Categoria A1",
      text: "I controlli manuali sul passeggero e sulle persone diverse dai passeggeri:",
      options: ["Rappresentano una delle possibili modalità di controllo", "Possono effettuarsi solo con il consenso della persona", "Entrambe le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 56,
      category: "Esercitazione Categoria A1",
      text: "Chi emette le ordinanze in aeroporto?",
      options: ["DT", "CSA", "GESTORE AEROPORTUALE"],
      answer: 0,
      image: "",
    },
{
      id: 57,
      category: "Esercitazione Categoria A1",
      text: "Quale tra i seguenti enti è responsabile della classificazione dei voli sensibili?",
      options: ["ENAC", "Ministero dell’Interno", "Ministero dei Trasporti"],
      answer: 1,
      image: "",
    },
{
      id: 58,
      category: "Esercitazione Categoria A1",
      text: "Su quali voli si applicano le misure di sicurezza aggiuntive di cui all'Allegato 1 della Parte 'B' del Programma Nazionale per la Sicurezza dell'aviazione civile?",
      options: ["Sui voli in arrivo sul territorio nazionale dai paesi terzi", "Sui voli in partenza dagli scali aerei sul territorio nazionale", "Sui voli in arrivo ed in transito provenienti da paesi terzi sugli scali del territorio nazionale"],
      answer: 1,
      image: "",
    },
{
      id: 59,
      category: "Esercitazione Categoria A1",
      text: "Quali tra i seguenti LAGs devono essere sottoposti a controllo con apparati LEDs?",
      options: ["Tutti i LAGs di capacità superiore a 100 millilitri", "Tutti i LAGs in singoli contenitori di capacità non superiore a 100 millilitri o equivalente, inseriti in un sacchetto di plastica trasparente e richiudibile di capacità non superiore ad 1 litro", "Nessuna delle altre risposte è corretta"],
      answer: 2,
      image: "",
    },
{
      id: 60,
      category: "Esercitazione Categoria A1",
      text: "La postazione cosiddetta 'remota' deve essere dotata di:",
      options: ["Sedia, ripiano di appoggio, piccolo specchio", "Tavolo e specchio di dimensione tale da riflettere la figura a mezzobusto di una persona", "Tavolo e specchio di dimensione tale da riflettere la figura intera di una persona"],
      answer: 1,
      image: "",
    },
{
      id: 61,
      category: "Esercitazione Categoria A1",
      text: "Tra i seguenti passeggeri, chi è esentato dallo screening?",
      options: ["Direttore della Banca Centrale Europea", "Il Presidente della Società di Gestione Aeroportuale", "Il Presidente degli Stati Uniti in visita ufficiale"],
      answer: 2,
      image: "",
    },
{
      id: 62,
      category: "Esercitazione Categoria A1",
      text: "A chi è in possesso di un tesserino di accesso con scorta può essere consentito:",
      options: ["Massimo 3 accessi nell’arco di un mese", "Massimo 6 accessi nell’arco di 30 giorni", "Massimo 3 accessi nell’arco di 30 giorni"],
      answer: 2,
      image: "",
    },
{
      id: 63,
      category: "Esercitazione Categoria A1",
      text: "Per i voli cosiddetti 'sensibili' cosa si intende per reiterazione dei controlli",
      options: ["I controlli effettuati nelle postazioni finali", "I controlli effettuati nelle postazioni iniziali", "I controlli effettuati nelle postazioni centrali"],
      answer: 0,
      image: "",
    },
{
      id: 64,
      category: "Esercitazione Categoria A1",
      text: "Nel caso di utilizzo continuativo della postazione di controllo:",
      options: ["Ogni addetto non può essere impiegato al monitor per più di 20 minuti consecutivi, con un'alternanza di almeno 10 minuti", "Ogni addetto non può essere impiegato al monitor per più di 10 minuti consecutivi, con un'alternanza di almeno 20 minuti", "Ogni addetto non può essere impiegato al monitor per più di 30 minuti consecutivi, con un'alternanza di almeno 20 minuti"],
      answer: 0,
      image: "",
    },
{
      id: 65,
      category: "Esercitazione Categoria A1",
      text: "Nelle postazioni di controllo per operatori aeroportuali ed equipaggi deve essere garantita la presenza contemporanea di:",
      options: ["Almeno 3 unità", "Almeno 4 unità", "Almeno 2 unità"],
      answer: 2,
      image: "",
    },
{
      id: 66,
      category: "Esercitazione Categoria A1",
      text: "Le persone che devono far fronte ad una grave minaccia imprevista per la vita o proprietà:",
      options: ["Può essere esonerato dallo screening solo il personale delle ambulanze", "Possono essere esonerate dallo screening e dal controllo dell'accesso", "Non possono essere esonerate dallo screening"],
      answer: 1,
      image: "",
    },
{
      id: 67,
      category: "Esercitazione Categoria A1",
      text: "Lo screening delle persone diverse dai passeggeri effettuato con dispositivi ETD deve prevedere l’utilizzo di campioni prelevati dalle zone:",
      options: ["Palmo e dorso delle mani ed ultimo oggetto appena maneggiato", "Zona della cintura e punta delle scarpe", "Palmo e il dorso delle mani e zona della cintura"],
      answer: 2,
      image: "",
    },
{
      id: 68,
      category: "Esercitazione Categoria A1",
      text: "Secondo il Regolamento (UE) 1998 del 2015, in caso di controlli effettuati tramite il portale W.T.M.D. ed apparato RX, le postazioni di controllo possono essere configurate almeno secondo uno degli esempi riportati:",
      options: ["1 G.P.G.: postazione dotata di un portale W.T.M.D. + 1 apparato RX", "7 G.P.G.: postazione dotata di un portale W.T.M.D. + 2 apparati RX", "5 G.P.G.: postazione dotata di un portale W.T.M.D. + 2 apparati RX"],
      answer: 1,
      image: "",
    },
{
      id: 69,
      category: "Esercitazione Categoria A1",
      text: "Se viene rinvenuta, durante il controllo di sicurezza, una borraccia nel bagaglio a mano del passeggero, gli si può consentire di introdurla in area sterile?",
      options: ["Si, solo se è vuota", "No", "Si"],
      answer: 0,
      image: "",
    },
{
      id: 70,
      category: "Esercitazione Categoria A1",
      text: "Quale metodo per lo screening delle persone effettuato con dispositivi ETD non è corretto?",
      options: ["Palmo e dorso delle mani più chiusura delle scarpe indossate dalla persona", "Portafoglio più zona della cintura", "Palmo e dorso delle mani più girovita"],
      answer: 2,
      image: "",
    },
{
      id: 71,
      category: "Esercitazione Categoria A1",
      text: "Le persone diverse dai passeggeri:",
      options: ["Possono portare qualsiasi articolo ma devono dichiararlo", "Sono esenti dalle restrizioni sui liquidi previste per i passeggeri", "Non hanno nessuna esenzione e sono controllati come i passeggeri"],
      answer: 1,
      image: "",
    },
{
      id: 72,
      category: "Esercitazione Categoria A1",
      text: "Chi coordina negli aeroporti, in situazioni di normalità, l'applicazione delle misure del Programma Nazionale di Sicurezza?",
      options: ["La Direzione Centrale Coordinamento aeroporti dell’ENAC", "Ogni Direzione aeroportuale dell’ENAC", "Il Gestore aeroportuale"],
      answer: 1,
      image: "",
    },
{
      id: 73,
      category: "Esercitazione Categoria A1",
      text: "I cani anti esplosivo (E.D.D.), i dispositivi E.T.D., i dispositivi E.T.D. in combinazione con i dispositivi S.E.D., possono essere utilizzati:",
      options: ["Come modalità di screening delle persone diverse dai passeggeri", "Come modalità supplementare di screening dei passeggeri", "Solo come modalità supplementare di screening delle persone diverse dai passeggeri"],
      answer: 2,
      image: "",
    },
{
      id: 74,
      category: "Esercitazione Categoria A1",
      text: "A chi possono essere riferite le misure di sicurezza previste dall'Allegato 1 della Parte 'B' del Programma Nazionale per la Sicurezza dell'aviazione civile?",
      options: ["Ai passeggeri, ai propri bagagli a mano, bagagli da stiva", "Ai passeggeri, ai propri bagagli a mano, ai bagagli da stiva, alla merce ed alla posta", "i passeggeri, ai propri bagagli a mano, alla merce ed alla posta"],
      answer: 0,
      image: "",
    },
{
      id: 75,
      category: "Esercitazione Categoria A1",
      text: "Il tesserino d’ingresso in aeroporto per coloro che lavorano all’interno dei negozi dell’area imbarchi sarà:",
      options: ["Azzurro con il numero 2", "Verde con il numero 2", "Rosso con il numero 1"],
      answer: 0,
      image: "",
    },
{
      id: 76,
      category: "Esercitazione Categoria A1",
      text: "Il candidato «addetto alla sicurezza aeroportuale deve essere sottoposto al controllo dei precedenti personali:",
      options: ["Prima di iniziare il servizio effettivo", "Prima del colloquio selettivo", "Prima di iniziare il corso di formazione"],
      answer: 2,
      image: "",
    },
{
      id: 77,
      category: "Esercitazione Categoria A1",
      text: "Per lo screening delle persone diverse dai passeggeri, quando un W.T.M.D. emette un segnale di allarme è possibile:",
      options: ["Sottoporre le persone diverse dai passeggeri ad un controllo E.T.D.", "Sottoporre le persone diverse dai passeggeri ad un'ispezione manuale", "Sottoporre le persone diverse dai passeggeri a controllo E.T.D. con ausilio apparato H.H.M.D."],
      answer: 1,
      image: "",
    },
{
      id: 78,
      category: "Esercitazione Categoria A1",
      text: "Devono essere trascritti sul TIA le indicazioni degli articoli proibiti?",
      options: ["Si, per gli articoli dell'appendice 1-A che il titolare è autorizzato ad introdurre", "Si, per gli articoli dell'appendice 4-C di cui alle lettere c), d) ed e).", "No, sono sempre VIETATI"],
      answer: 0,
      image: "",
    },
{
      id: 79,
      category: "Esercitazione Categoria A1",
      text: "Chi svolge il controllo di sicurezza su un passeggero DEPO?",
      options: ["Personale della Guardia di Finanza", "Personale della Polizia di Frontiera", "Personale in possesso della qualifica di GPG"],
      answer: 1,
      image: "",
    },
{
      id: 80,
      category: "Esercitazione Categoria A1",
      text: "Cosa vuol dire l’acronimo LAG:",
      options: ["Liquidi Aerei da Gettare", "Liquidi a Getto", "Liquidi Aerosol e Gel"],
      answer: 2,
      image: "",
    },
{
      id: 81,
      category: "Esercitazione Categoria A1",
      text: "L'ispezione manuale degli equipaggi deve svolgersi in conformità:",
      options: ["All'appendice 4-A", "All'appendice 3-A", "All'appendice 1-A"],
      answer: 0,
      image: "",
    },
{
      id: 82,
      category: "Esercitazione Categoria A1",
      text: "Quale numero deve riportare il TIA che consente l’accesso all’area trattamento bagagli:",
      options: ["2", "4", "3"],
      answer: 2,
      image: "",
    },
{
      id: 83,
      category: "Esercitazione Categoria A1",
      text: "I materiali organici sono identificati dal colore:",
      options: ["Arancione", "Blu", "Verde"],
      answer: 0,
      image: "",
    },
{
      id: 84,
      category: "Esercitazione Categoria A1",
      text: "Quale tra i seguenti bagagli da stiva, di norma, non è obbligatorio sottoporre a controllo (screening)?",
      options: ["Nessuna delle altre risposte è corretta", " Bagagli in transito diretto", "Bagagli in transito indiretto"],
      answer: 1,
      image: "",
    },
{
      id: 85,
      category: "Esercitazione Categoria A1",
      text: "Chi determina il livello di rischio di un volo?",
      options: ["La società di gestione", "Il Dipartimento di Pubblica Sicurezza del Ministero dell’interno", "L’ENAC"],
      answer: 1,
      image: "",
    },
{
      id: 86,
      category: "Esercitazione Categoria A1",
      text: "In quale situazione durante il controllo manuale del bagaglio da stiva è necessaria la presenza della Polizia?",
      options: ["Nessuna delle altre risposte è corretta", "In situazione normale", "In situazione sospetta"],
      answer: 2,
      image: "",
    },
{
      id: 87,
      category: "Esercitazione Categoria A1",
      text: "Fatte salve le disposizioni della Convenzione di Vienna sulle relazioni diplomatiche del 18 Aprile 1961, i diplomatici ed il loro bagaglio a mano:",
      options: ["A discrezione della Guardia particolare Giurata", "Non sono esenti dai controlli di sicurezza", "Sono esenti dai controlli di sicurezza"],
      answer: 1,
      image: "",
    },
{
      id: 88,
      category: "Esercitazione Categoria A1",
      text: "Il controllo dei precedenti personali (background check) prevede di:",
      options: ["Entrambe le altre risposte sono corrette", "Accertare eventuali precedenti penali in tutti gli stati di residenza almeno durante gli ultimi 5 anni", "Stabilire l'identità della persona sulla base delle prove documentali e di verificare l'attività professionale, gli studi ed eventuali interruzioni almeno nell'ambito degli ultimi 5 anni"],
      answer: 0,
      image: "",
    },
{
      id: 89,
      category: "Esercitazione Categoria A1",
      text: "Il punto 4.1.1.1 (obbligo di togliere cappotti e giacche prima del controllo), di norma, non si applica:",
      options: ["Esclusivamente agli equipaggi", "Esclusivamente alle Forze di Polizia", "Agli operatori aeroportuali"],
      answer: 2,
      image: "",
    },
{
      id: 90,
      category: "Esercitazione Categoria A1",
      text: "Per l’attività di coordinamento sull’applicazione delle misure nei singoli aeroporti:",
      options: ["Il dirigente di Polizia prende accordi direttamente con la società di gestione", "Viene convocato un comitato di sicurezza aeroportuale", "Basta una telefonata alla centrale operativa della security"],
      answer: 1,
      image: "",
    },
{
      id: 91,
      category: "Esercitazione Categoria A1",
      text: "Chi effettua la valutazione valutazione del rischio in un aeroporto aperto al traffico commerciale:",
      options: ["Il Gestore Aeroportuale tenendo conto delle informazioni fornite dalla Polizia di Frontiera", "ENAC in qualità di Autorità unica di regolazione, sorveglianza e certificazione", "La Polizia di Frontiera, Enac e Gestore Aeroportuale"],
      answer: 0,
      image: "",
    },
{
      id: 92,
      category: "Esercitazione Categoria A1",
      text: "Gli operatori aeroportuali in servizio sono esonerati dalle limitazioni previste per i passeggeri in tema di introduzione di L.A.G. in area sterile.",
      options: ["Vero", "A campione", "Falso"],
      answer: 0,
      image: "",
    },
{
      id: 93,
      category: "Esercitazione Categoria A1",
      text: "Le persone diverse dai passeggeri non possono trasportare nelle aree sterili dell’aeroporti gli articoli indicati:",
      options: ["Nell’articolo 41 del TULPS (Testo Unico delle Leggi di Pubblica Sicurezza)", "Nell’Appendice 1-A del PNS (Programma Nazionale per la Sicurezza dell’aviazione civile), parte A", "Nell’Appendice 1-A del Regolamento (UE) 2015/1998"],
      answer: 1,
      image: "",
    },
{
      id: 94,
      category: "Esercitazione Categoria A1",
      text: "Quando le persone diverse dai passeggeri e gli oggetti da esse trasportate, devono essere sottoposti a screening a campione su base continua, la frequenza di tali controlli va stabilita dall'Autorità competente sulla base di:",
      options: ["Una percentuale del 30%", "Una percentuale del 20%", "Una percentuale del 10%"],
      answer: 2,
      image: "",
    },
{
      id: 95,
      category: "Esercitazione Categoria A1",
      text: "Le procedure di sicurezza speciali o deroghe per la protezione e la sicurezza delle aree lato volo sono stabilite:",
      options: ["Dalla Direzione aeroportuale competente", "Dal Ministero dell'Interno", "Dal Gestore aeroportuale"],
      answer: 0,
      image: "",
    },
{
      id: 96,
      category: "Esercitazione Categoria A1",
      text: "La classificazione dei voli sensibili, in relazione al livello e al tipo di sensibilità, nonché alla durata del rischio, è determinata dal:",
      options: ["Ministero della Difesa", "Ministero degli Esteri", "Ministero dell'Interno"],
      answer: 2,
      image: "",
    },
{
      id: 97,
      category: "Esercitazione Categoria A1",
      text: "Chi è il soggetto responsabile per l'attuazione delle misure descritte nel capitolo 4 del Programma Nazionale per la Sicurezza dell'Aviazione Civile?",
      options: ["Il Gestore aeroportuale", "E.N.A.C.", "Polizia di Stato"],
      answer: 0,
      image: "",
    },
{
      id: 98,
      category: "Esercitazione Categoria A1",
      text: "Quale tra queste modalità può essere usata solo come modalità supplementare di controllo degli oggetti trasportati dalle persone diverse dai passeggeri?",
      options: ["Apparecchiature a raggi X", "Cani anti esplosivo (E.D.D.)", "Sistemi di rilevamento di esplosivo (E.D.S.)"],
      answer: 1,
      image: "",
    },
{
      id: 99,
      category: "Esercitazione Categoria A1",
      text: "In caso di rinvenimento al varco di accesso di armi e munizioni nel bagaglio a mano, l‘addetto al controllo di sicurezza deve:",
      options: ["Respingerli e dare indicazioni al passeggero della possibilità, previo assenso del vettore, del loro trasporto all‘interno del proprio bagaglio da stiva", "Chiedere al passeggero di esibire le autorizzazioni al trasporto", "Avvisare immediatamente, in modo discreto, gli organi di Polizia per gli interventi di competenza"],
      answer: 2,
      image: "",
    },
{
      id: 100,
      category: "Esercitazione Categoria A1",
      text: "Qualora in un aeroporto vi sia coincidenza tra le aree sterili e le parti critiche delle aree sterili, le postazioni di controllo saranno collocate unicamente:",
      options: ["All‘ingresso dell’air side", "All’ingresso dell’aeroporto", "All’ingresso del land side"],
      answer: 0,
      image: "",
    },
{
      id: 101,
      category: "Esercitazione Categoria A1",
      text: "Com’è considerato l’Hand Search?",
      options: ["Una metodologia alternativa di verifica", "La principale metodologia di verifica", "La secondaria metodologia di verifica"],
      answer: 1,
      image: "",
    },
{
      id: 102,
      category: "Esercitazione Categoria A1",
      text: "Sono sottoposte a speciali procedure di controllo le seguenti categorie di passeggeri:",
      options: ["Presidenti e Capi di Stato", "Persone a mobilità ridotta (P.R.M.)", "Persone sottoposte ad un programma di protezione dallo Stato e relativa scorta, il cui accesso all'area sterile avviene tramite coordinamento con le Forze di Polizia che provvedono a darne comunicazione al vettore aereo"],
      answer: 1,
      image: "",
    },
{
      id: 103,
      category: "Esercitazione Categoria A1",
      text: "Ai sensi del PNS, cosa si intende con riferimento ai membri di equipaggio 'immediate vicinanze':",
      options: ["S’intende approssimativamente 3 metri dallo scortante", "S’intende approssimativamente 3 metri calcolati dal punto piu estremo dell'aeromobile", "S’intende approssimativamente 10 metri calcolati dal punto più estremo dell’aeromobile"],
      answer: 2,
      image: "",
    },
{
      id: 104,
      category: "Esercitazione Categoria A1",
      text: "Quale capitolo del Programma Nazionale di Sicurezza tratta della selezione e formazione?",
      options: ["11", "12", "1"],
      answer: 0,
      image: "",
    },
{
      id: 105,
      category: "Esercitazione Categoria A1",
      text: "Il controllo con dispositivo E.T.D. del 10% degli oggetti trasportati dalle persone diverse dai passeggeri viene effettuato utilizzando campioni prelevati da:",
      options: ["Interno ed esterno", "Interno", "Esterno"],
      answer: 0,
      image: "",
    },
{
      id: 106,
      category: "Esercitazione Categoria A1",
      text: "Quando viene effettuato lo screening del bagaglio a mano tramite dispositivi di rilevamento di tracce di esplosivi (E.T.D.), i campioni devono essere prelevati:",
      options: ["Dall'interno", "Dall'esterno", "Entrambe le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 107,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende per ispezione manuale del bagaglio a mano?",
      options: ["Un controllo con E.T.D. delle parti esterne ed interne del bagaglio allo scopo di accertare con ragionevole sicurezza che esso non contenga articoli proibiti", "Un controllo manuale del bagaglio, compreso il suo contenuto, allo scopo di accertare con ragionevole sicurezza che esso non contenga articoli proibiti", "Un controllo manuale delle parti esterne del bagaglio allo scopo di accertare con ragionevole sicurezza che esso non contenga articoli proibiti"],
      answer: 1,
      image: "",
    },
{
      id: 108,
      category: "Esercitazione Categoria A1",
      text: "A quale scopo tutti i bagagli da stiva devono essere sottoposti a controllo prima di essere caricati a bordo di un aeromobile?",
      options: ["Impedire l'introduzione di articoli proibiti nelle aree sterili ed a bordo dell'aeromobile", "Impedire l'introduzione di articoli proibiti solo nelle aree sterili", "Impedire l'introduzione di articoli proibiti solo a bordo dell'aeromobile"],
      answer: 0,
      image: "",
    },
{
      id: 109,
      category: "Esercitazione Categoria A1",
      text: "I liquidi per essere ammessi in cabina devono:",
      options: ["Essere acquistati in un’area sterile aeroportuale", "Tutte le risposte sono corrette", "Appartenere ad alcune categorie come i medicinali, le diete speciali e gli alimenti per neonati"],
      answer: 2,
      image: "",
    },
{
      id: 110,
      category: "Esercitazione Categoria A1",
      text: "Le Guardie particolari Giurate impiegate presso i varchi di accesso dell'area sterile:",
      options: ["Devono prestare servizio in divisa, non armati", "Devono prestare servizio in divisa", "Devono prestare servizio con armi"],
      answer: 0,
      image: "",
    },
{
      id: 111,
      category: "Esercitazione Categoria A1",
      text: "Nel caso in cui in aeroporto un passeggero venisse classificato come disruptive/unruly level 1",
      options: ["Verrà arrestato dalla Polizia di Frontiera", "Verrà posto in stand-by il suo bagaglio da stiva", "Verrà sottoposto ad alcoltest"],
      answer: 1,
      image: "",
    },
{
      id: 112,
      category: "Esercitazione Categoria A1",
      text: "Le percentuali richieste per l'attuazione di taluni controlli sui passeggeri:",
      options: ["Entrambe le altre risposte sono corrette", "Possono essere misurate per ogni gruppo di 100 passeggeri", "Possono essere misurate per ogni ora di attività"],
      answer: 0,
      image: "",
    },
{
      id: 113,
      category: "Esercitazione Categoria A1",
      text: "Quale tra queste modalità può essere usate solo come modalità supplementare di controllo delle persone diverse dei passeggeri?",
      options: ["Scanner di sicurezza", "Dispositivi E.T.D.", "Ispezione manuale"],
      answer: 1,
      image: "",
    },
{
      id: 114,
      category: "Esercitazione Categoria A1",
      text: "I Parlamentari dello Stato Italiano, sono soggetti a speciali procedure di controllo?",
      options: ["Si, effettuano i controlli di sicurezza con le stesse deroghe riservate allo staff", "Sono esentati dai controlli di sicurezza", "No, effettuano i previsti controlli di sicurezza come tutti i normali passeggeri"],
      answer: 2,
      image: "",
    },
{
      id: 115,
      category: "Esercitazione Categoria A1",
      text: "Cosa deve assicurare il Gestore aeroportuale per quanto attiene le operazioni di controllo dei bagagli da stiva?",
      options: ["Che i controlli siano effettuati solo utilizzando apparecchiature rispondenti ai requisiti previsti dal Cap.12 del Regolamento (UE) 1998 del 2015 e della Decisione (CE) 8005 del 2015", "Che i controlli siano effettuati da personale formato e certificato dall'E.N.A.C. ai sensi del Cap.11 del Regolamento (UE) 1998 del 2015 e del Manuale E.N.A.C. della Formazione per la Sicurezza (Categoria A1), utilizzando apparecchiature rispondenti ai requisiti previsti dal Cap.12 del Regolamento (UE) 1998 del 2015 e della Decisione (CE) 8005 del 2015", "Che i controlli siano effettuati da personale formato e certificato dall'E.N.A.C. ai sensi del Cap.11 del Regolamento (UE) 1998 del 2015 e del Manuale E.N.A.C. della Formazione per la Sicurezza (Categoria A1)"],
      answer: 1,
      image: "",
    },
{
      id: 116,
      category: "Esercitazione Categoria A1",
      text: "Ai passeggeri che rifiutano di sottoporsi ai controlli di sicurezza sulla persona e/o sul bagaglio a mano, secondo le procedure previste, non è consentito l'acceso alle aree sterili e l'imbarco. In tal caso, l'addetto al controllo ne impedirà l'accesso alle suddette aree, informandone tempestivamente:",
      options: ["a Polizia ed il Security Manager dell'aeroporto", "La Polizia", "La Polizia ed il Vettore aereo interessato"],
      answer: 2,
      image: "",
    },
{
      id: 117,
      category: "Esercitazione Categoria A1",
      text: "Chi è il soggetto preposto alla diramazione degli avvisi sonori riguardanti le informazioni circa il divieto di lasciare incustodito il proprio bagaglio?",
      options: ["Il Gestore Aeroportuale", "L'Autorità di Polizia", "L' E.N.A.C."],
      answer: 0,
      image: "",
    },
{
      id: 118,
      category: "Esercitazione Categoria A1",
      text: "Quale, tra le seguenti, NON è una nuova forma di minaccia terroristica?",
      options: ["Il drone", "Il cyber terrorism", "Il kamikaze"],
      answer: 2,
      image: "",
    },
{
      id: 119,
      category: "Esercitazione Categoria A1",
      text: "Il Direttore di Aeroporto e il personale ispettivo titolari di un TIA con fascia rossa sono:",
      options: ["Esentati dallo screening sulla persona ma non sugli oggetti trasportati. Su suddetto TIA NON è apposta la dicitura ESENTE che ne legittima la suddetta esenzione.", "Esentati dallo screening sulla persona ma NON sugli oggetti trasportati. Su suddetto TIA è apposta la dicitura ESENTE che ne legittima la suddetta esenzione.", "Esentati dallo screening sulla persona e sugli oggetti trasportati. Su suddetto TIA è apposta la dicitura ESENTE che ne legittima la suddetta esenzione."],
      answer: 1,
      image: "",
    },
{
      id: 120,
      category: "Esercitazione Categoria A1",
      text: "Quale è lo scopo del riconcilio bagagli?",
      options: ["Di evitare che vengano caricati a bordo dell'aeromobile bagagli da stiva che non viaggino con il relativo contrassegno esterno che permetta l'identificazione del proprietario", "Di evitare che vengano caricati a bordo dell'aeromobile bagagli da stiva che non viaggino con il relativo proprietario, al di fuori dei casi previsti", "Di evitare che vengano caricati a bordo dell'aeromobile bagagli da stiva che non viaggino con il relativo contrassegno esterno che permetta l'identificazione del proprietario e non viaggino con il relativo proprietario, al di fuori dei casi previsti"],
      answer: 2,
      image: "",
    },
{
      id: 121,
      category: "Esercitazione Categoria A1",
      text: "Dove sono posizionate le postazioni di controllo del bagaglio da stiva?",
      options: ["Devono essere posizionate all'interno della parte critica dell'area sterile", "Possono essere posizionate sia all'interno che all'esterno della parte critica dell'area sterile", "Devono essere posizionate solo all'esterno della parte critica dell'area sterile"],
      answer: 0,
      image: "",
    },
{
      id: 122,
      category: "Esercitazione Categoria A1",
      text: "Quale procedura di sicurezza effettua l’addetto ai controlli di sicurezza aeroportuale se rinviene esplosivi, armi, munizioni od articoli incendiari e similari all’interno di un bagaglio a mano?",
      options: ["Permette la fuori uscita del bagaglio a mano dall’apparecchiatura ed avvisa il personale della Polizia di Stato", "Procede ad uno screening con ETD", "Blocca il bagaglio a mano all’interno dell’apparecchiatura con l’immagine visualizzata sul monitor ed avvisa immediatamente, con discrezione, il Supervisore ed il personale di Polizia"],
      answer: 2,
      image: "",
    },
{
      id: 123,
      category: "Esercitazione Categoria A1",
      text: "Prima di procedere con il controllo manuale del bagaglio lo screener deve:",
      options: ["Chiamare il supervisore", "Richiedere preventivamente il consenso al passeggero", "Contattare la polizia"],
      answer: 1,
      image: "",
    },
{
      id: 124,
      category: "Esercitazione Categoria A1",
      text: "L’ispezione manuale nei confronti di una persona diversa dai passeggeri:",
      options: ["Le persone diverse dai passeggeri non subiscono ispezioni manuali", "Per questa categoria di persone non serve chiedere e ottenere il consenso", "Richiede preventivamente il consenso da ottenere dalla persona"],
      answer: 2,
      image: "",
    },
{
      id: 125,
      category: "Esercitazione Categoria A1",
      text: "Il personale del Dipartimento dei Vigili del Fuoco, è esentato dallo screening sulla persona:",
      options: ["Si", "Si, solo se è in servizio aeroportuale operativo", "No"],
      answer: 1,
      image: "",
    },
{
      id: 126,
      category: "Esercitazione Categoria A1",
      text: "Il TIP è:",
      options: ["Un software che proietta immagini virtuali di articoli proibiti su apparecchiature X-Ray", "E' il test da eseguire obbligatoriamente all’accensione della macchina x-Ray", "Un software in grado di segnalare all’ addetto al monitor la presenza di masse organiche"],
      answer: 0,
      image: "",
    },
{
      id: 127,
      category: "Esercitazione Categoria A1",
      text: "Le postazioni di controllo devono essere configurate in modo tale da:",
      options: ["Permettere il contatto tra persone ed oggetti già controllati con persone ed oggetti non controllati", "Impedire il contatto tra persone ed oggetti già controllati con persone ed oggetti controllati", "Impedire il contatto tra persone ed oggetti già controllati con persone ed oggetti non controllati"],
      answer: 2 ,
      image: "",
    },
{
      id: 128,
      category: "Esercitazione Categoria A1",
      text: "Ai passeggeri che rifiutano di sottoporsi ai controlli di sicurezza:",
      options: ["Non è consentito l'accesso alle aree sterili e l'imbarco. In tal caso, l’addetto al controllo ne impedirà l’accesso alle suddette aree, informandone, tempestivamente, il personale della Polizia di Frontiera ed il vettore aereo interessato.", "Non è consentito l'accesso alle aree sterili e l'imbarco. In tal caso, l’addetto al controllo ne impedirà l’accesso alle suddette aree, informandone, tempestivamente, il personale della Polizia di Frontiera.", "Non è consentito l'accesso alle aree sterili e l'imbarco."],
      answer: 0,
      image: "",
    },
{
      id: 129,
      category: "Esercitazione Categoria A1",
      text: "Come deve essere composta una postazione di controllo per i passeggeri ed il loro bagaglio a mano?",
      options: ["Deve essere composta da un portale W.T.M.D., un apparato RX e un apparato E.T.D.", "Deve essere presente un apparato W.T.M.D., un apparato RX, un apparato L.E.D. e un apparato E.T.D.", "Deve essere in funzione del numero dei passeggeri annui"],
      answer: 1,
      image: "",
    },
{
      id: 130,
      category: "Esercitazione Categoria A1",
      text: "L’Hand Search sulla persona, va eseguito:",
      options: ["A scivolamento e sistematicamente", "Con cortesia", "Tutte le risposte precedenti sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 131,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende per S.T.E.B.?",
      options: ["Sacchetto d plastica dove inserire liquidi al seguito del passeggero, le cui caratteristiche sono determinate dal Ministero dell'Interno con apposita Circolare", "Sacchetto in grado di evidenziare eventuali manomissioni conforme alle linee guida per i controlli di sicurezza raccomandate dall'Organizzazione Internazionale dell'Aviazione civile", "Sacchetto fornito dal Gestore aeroportuale che riporta il nome ed il logo dell'aeroporto"],
      answer: 1,
      image: "",
    },
{
      id: 132,
      category: "Esercitazione Categoria A1",
      text: "Quale è la definizione di 'Sorveglianza e Pattugliamento'?",
      options: ["Si intende impedire l’accesso di persone non autorizzate e l’introduzione di articoli proibiti in area sterile, e nelle ipotesi in cui tale accesso sia avvenuto, di catturare ed arrestare i trasgressori", "Si intende impedire l’accesso di persone non autorizzate e l’introduzione di articoli proibiti in area sterile, e nelle ipotesi in cui tale accesso sia avvenuto, di individuarli", "Si intende impedire l’accesso di persone non autorizzate e l’introduzione di articoli proibiti in area sterile"],
      answer: 1,
      image: "",
    },
{
      id: 133,
      category: "Esercitazione Categoria A1",
      text: "Quale è la modalità del controllo manuale del bagaglio da stiva in una 'situazione normale'?",
      options: ["L'apertura ed il controllo manuale dei bagagli da stiva deve essere effettuato dall'addetto al controllo di norma in presenza del passeggero, salvo i casi in cui risulti impossibile reperire lo stesso, intendendo il caso in cui il passeggero non risponda ad una o più chiamate tramite altoparlante. In caso di assenza del passeggero è necessaria la presenza del personale della Polizia di Stato", "L'apertura ed il controllo manuale dei bagagli da stiva deve essere effettuato dall'addetto al controllo senza la presenza del passeggero e senza la presenza del personale della Polizia di Stato", "L'apertura ed il controllo manuale dei bagagli da stiva deve essere effettuato dall'addetto al controllo solo alla presenza del personale della Polizia di Stato"],
      answer: 0,
      image: "",
    },
{
      id: 134,
      category: "Esercitazione Categoria A1",
      text: "Oltre al livello standard sui controlli di sicurezza, esistono:",
      options: ["livello 1 (basso), livello 2 (intermedio), livello 3 (elevato), livello 4 (rosso)", "livello 2 (intermedio), livello 3 (elevato), livello 4 (rosso)", "livello 2 (intermedio), livello 3 (elevato)"],
      answer: 2,
      image: "",
    },
{
      id: 135,
      category: "Esercitazione Categoria A1",
      text: "In quali casi il presidio della postazione di controllo delle persone diverse dai passeggeri può essere ridotto ad 1 unità?",
      options: ["Fasce orarie di minor transito", "Qualora i controlli di sicurezza siano effettuati attraverso l'utilizzo di una modalità scelta ed in alternanza imprevedibile tra portale W.T.M.D., dispositivi E.T.D., E.D.D. e Scanner di sicurezza", "Nessuna delle altre risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 136,
      category: "Esercitazione Categoria A1",
      text: "Il bagaglio da stiva in transito diretto è esentato dai controlli?",
      options: ["Si, se rimane a bordo dell'aeromobile e solo se è autorizzato dal Comandante dell'aeromobile", "No, anche se rimane a bordo dell'aeromobile", "Si, se rimane a bordo dell'aeromobile"],
      answer: 2,
      image: "",
    },
{
      id: 137,
      category: "Esercitazione Categoria A1",
      text: "Che cosa è il QUOT?",
      options: ["Un allarme provocato dal passeggero che ha dimenticato un oggetto metallico nelle tasche", "Una segnalazione del W.T.M.D. tra i passeggeri non generanti allarme da sottoporre ad ulteriori controlli", "Un allarme provocato dal passeggero in quanto indossa calzature con masse metalliche al loro interno"],
      answer: 1,
      image: "",
    },
{
      id: 138,
      category: "Esercitazione Categoria A1",
      text: "Come si può risolvere un allarme QUOT?",
      options: ["Eseguendo un accurato Hand Search sulla persona", "Utilizzando l'apparato E.T.D.", "E' possibile utilizzare entrambe le modalità"],
      answer: 2,
      image: "",
    },
{
      id: 139,
      category: "Esercitazione Categoria A1",
      text: "Il personale delle Agenzie delle Dogane, è esentato dai controlli:",
      options: ["Si, solo se svolge con continuità attività di contrasto al traffico di sostanze stupefacenti", "No", "Si"],
      answer: 0,
      image: "",
    },
{
      id: 140,
      category: "Esercitazione Categoria A1",
      text: "Nelle postazioni di controllo ove è installato il T.I.P., per i passeggeri in partenza su voli con destinazione classificata sensibile LIVELLO 2 (Intermedio), quale controllo di sicurezza è aumentato in percentuale?",
      options: ["Sono aumentate le percentuali di controllo con E.T.D. dei soli apparati elettrici/elettronici", "Sono aumentate le percentuali di controllo con E.T.D. dei bagagli a mano a seguito del passeggero", "Sono aumentate le percentuali di controllo con E.T.D. dei soli apparati elettrici/elettronici e dei bagagli a mano"],
      answer: 2,
      image: "",
    },
{
      id: 141,
      category: "Esercitazione Categoria A1",
      text: "Le calzature che hanno generato allarme:",
      options: ["Devono essere controllate con apparecchiature radiogene o EDS se disponibili", "Devono essere controllate sempre con apparato ETD", "Devono essere controllate sempre mediante esame visivo e fisico"],
      answer: 0,
      image: "",
    },
{
      id: 142,
      category: "Esercitazione Categoria A1",
      text: "Nei casi in cui il bagaglio a mano è stato selezionato per un'ispezione manuale, quale procedura deve porre in essere l'addetto alla sicurezza che effettua l'ispezione?",
      options: ["Deve sempre essere messo a conoscenza del sospetto ed essere guidato nell'ispezione dall'addetto al monitor. In tali casi, il proprietario del bagaglio deve essere sempre presente ma non deve interferire con l'ispezione stessa", "Deve sempre essere messo a conoscenza del sospetto ed essere guidato nell'ispezione dall'addetto al monitor, coordinandosi con lui ed eseguire l'ispezione unitamente al passeggero che deve essere sempre presente al momento dell'ispezione", "Deve sempre essere eseguita alla presenza del passeggero che può interagire ed ausiliare nella ricerca all'interno del bagaglio dell'oggetto che ha destato sospetto"],
      answer: 0,
      image: "",
    },
{
      id: 143,
      category: "Esercitazione Categoria A1",
      text: "Un'ispezione di sicurezza delle parti sterili, che potrebbero essere state contaminate deve essere realizzata immediatamente prima dell'istituzione di tale parte, in modo da poter garantire la sterilità con:",
      options: ["Sicura ragionevolezza", "Concreta certezza", "Ragionevole sicurezza"],
      answer: 2,
      image: "",
    },
{
      id: 144,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende per 'arma impropria':",
      options: ["Le armi non da sparo la cui destinazione naturale è l'offesa", "Uno strumento che se usato impropriamente, può essere atto ad offendere, ma la cui destinazione finale non è l’offesa", "Armi bianche"],
      answer: 1,
      image: "",
    },
{
      id: 145,
      category: "Esercitazione Categoria A1",
      text: "Nel caso di utilizzo continuativo della postazione di controllo RX, ogni addetto non può essere impiegato al monitor per più di 20 minuti consecutivi, con un'alternanza di almeno 10 minuti:",
      options: ["Solo per il controllo dei passeggeri", "Solo per il controllo delle persone diverse dai passeggeri", "Sia per il controllo dei passeggeri sia per il controllo delle persone diverse dai passeggeri"],
      answer: 2,
      image: "",
    },
{
      id: 146,
      category: "Esercitazione Categoria A1",
      text: "La Procedura 4-A allegata al Cap.4 del PNS tratta:",
      options: ["Ispezione Manuale", "Trasporto delle Armi", "Paesi terzi"],
      answer: 1,
      image: "",
    },
{
      id: 147,
      category: "Esercitazione Categoria A1",
      text: "Quale metodo per lo screening delle persone diverse dai passeggeri effettuato con dispositivi E.T.D., non è corretto:",
      options: ["Palmo e dorso delle mani più zona della cintura", "Palmo e dorso delle mani più punta delle scarpe", "Palmo e dorso delle mani più oggetto appena maneggiato"],
      answer: 2,
      image: "",
    },
{
      id: 148,
      category: "Esercitazione Categoria A1",
      text: "WTMD è un dispositivo che rileva:",
      options: ["Presenza di metalli indosso a chi lo attraversa", "Presenza di metalli e oggetti di analoga consistenza", "Sostanze stupefacenti indosso ad una persona"],
      answer: 0,
      image: "",
    },
{
      id: 149,
      category: "Esercitazione Categoria A1",
      text: "'Passeggeri e bagagli a mano' è il titolo di quale capitolo del Programma Nazionale per la Sicurezza dell'Aviazione Civile?",
      options: ["Capitolo 4", "Capitolo 3", "Capitolo 1"],
      answer: 0,
      image: "",
    },
{
      id: 150,
      category: "Esercitazione Categoria A1",
      text: "Le persone diverse dai passeggeri:",
      options: ["Possono evitare di togliere le scarpe durante i controlli", "Sono esentate solo dal controllo con ETD", "Possono evitare di togliere preventivamente le giacche durante i controlli"],
      answer: 2,
      image: "",
    },
{
      id: 151,
      category: "Esercitazione Categoria A1",
      text: "Quale è la percentuale di controllo delle persone diverse dai passeggeri che non fanno scattare l'allarme al W.T.M.D. secondo quanto prescritto dal P.N.S. - Parte B?",
      options: ["Almeno il 20%", "Almeno il 10%", "Almeno il 25%"],
      answer: 1,
      image: "",
    },
{
      id: 152,
      category: "Esercitazione Categoria A1",
      text: "Il bagaglio da stiva di un passeggero che ha effettuato accettazione per un determinato volo, può essere imbarcato senza la presenza a bordo del medesimo?",
      options: ["Il vettore aereo deve assicurare che il bagaglio sia scaricato e non trasportato con quel volo", "Il vettore aereo deve assicurare che il bagaglio sia sempre trasportato con quel volo", "Il vettore aereo deve assicurare che il bagaglio sia sempre trasportato con quel volo previo nulla osta del Comandante dell'aeromobile"],
      answer: 0,
      image: "",
    },
{
      id: 153,
      category: "Esercitazione Categoria A1",
      text: "Ai fini del Capitolo 1 del P.N.S., sono considerate parti di un aeroporto:",
      options: ["Bus, passerella telescopica, push-back", "Aeromobile, bus, banco check-in", "Aeromobile, bus, carrello dei bagagli, passerella telescopica"],
      answer: 2,
      image: "",
    },
{
      id: 154,
      category: "Esercitazione Categoria A1",
      text: "Cosa è necessario verificare all’ingresso delle postazioni centrali di controllo",
      options: ["La carta d’imbarco", "Sia 'a' che 'c'", "Il documento di identità"],
      answer: 0,
      image: "",
    },
{
      id: 155,
      category: "Esercitazione Categoria A1",
      text: "La validità massima di un Tia per chi lavora stabilmente in aeroporto è :",
      options: ["3 anni", "5 anni", "2 anni"],
      answer: 1,
      image: "",
    },
{
      id: 156,
      category: "Esercitazione Categoria A1",
      text: "L’ispezione Manuale:",
      options: ["Richiede preventivamente il consenso del passeggero", "Si conduce sistematicamente e a scivolamento", "Tutte le risposte precedenti sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 157,
      category: "Esercitazione Categoria A1",
      text: "Nei casi in cui il bagaglio a mano è stato selezionato per un'ispezione manuale, l'addetto alla sicurezza che effettua l'ispezione, deve:",
      options: ["Essere messo a conoscenza del sospetto ed essere guidato dall'addetto al monitor", "Effettuare l'ispezione manuale con l'ausilio del passeggero proprietario del bagaglio che deve sempre essere presente all'ispezione", "Essere sempre messo a conoscenza del sospetto ed essere guidato dal passeggero proprietario del bagaglio nella ricerca dell'oggetto che ha generato il sospetto"],
      answer: 0,
      image: "",
    },
{
      id: 158,
      category: "Esercitazione Categoria A1",
      text: "Quali, tra i seguenti articoli, è un’arma 'propria'?",
      options: ["Una penna con all’interno la lama", "Un tirapugni", "Sono tutte armi 'proprie'"],
      answer: 2,
      image: "",
    },
{
      id: 159,
      category: "Esercitazione Categoria A1",
      text: "Le norme fondamentali comuni per la sicurezza dell’aviazione civile sono contenute:",
      options: ["Nell’Allegato al Reg (CE) 300/2008", "Nell’Allegato al Reg (UE) 2015/1998", "Nell’allegato all’Annesso 17 della Convenzione di Chicago"],
      answer: 0,
      image: "",
    },
{
      id: 160,
      category: "Esercitazione Categoria A1",
      text: "Quale è la durata temporale massima nella quale l'Addetto alla sicurezza che effettua lo sceening, può essere impiegato nell'esame continuativo delle immagini proiettate dalla macchina RX?",
      options: ["40 minuti", "20 minuti", "30 minuti"],
      answer: 1,
      image: "",
    },
{
      id: 161,
      category: "Esercitazione Categoria A1",
      text: "Il personale addetto al controllo (screening) dei passeggeri, bagaglio a mano e persone diverse dai passeggeri:",
      options: ["Deve essere formato e certificato dall'ENAC ai sensi del Cap.11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della Formazione security (Categoria A2)", "Deve essere formato e certificato dall'ENAC ai sensi del Cap.11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della Formazione security (Categoria A1)", "Deve essere formato e certificato dall'ENAC ai sensi del Cap.11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della Formazione security (Categoria A1 ed A5)"],
      answer: 2,
      image: "",
    },
{
      id: 162,
      category: "Esercitazione Categoria A1",
      text: "Quale, tra le seguenti, NON è una normativa internazionale sull’Aviation Security?",
      options: ["L’Annesso 17 alla Convenzione di Chicago", "La Convenzione di Tokyo", "La Convenzione di Dublino"],
      answer: 2,
      image: "",
    },
{
      id: 163,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende con l’espressione 'durante il viaggio'",
      options: ["Andata e ritorno", "Andata, permanenza e ritorno", "Solo il volo di andata"],
      answer: 1,
      image: "",
    },
{
      id: 164,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende per sistema L.E.D.S.?",
      options: ["E' un dispositivo, certificato dalla Commissione Europea, in grado di rilevare esplosivi occultati all'interno del bagaglio a mano", "E' un dispositivo, certificato dalla Commissione Europea, in grado di rilevare esplosivi occultati nelle calzature", "E' il sistema per il rilevamento di esplosivi liquidi, quindi in grado di individuare materiali pericolosi, conforme alle disposizioni previste nella Decisione della Commissione 8005 del 2015"],
      answer: 2,
      image: "",
    },
{
      id: 165,
      category: "Esercitazione Categoria A1",
      text: "Il personale addetto al controllo (screening) del bagaglio da stiva:",
      options: ["Deve essere formato e certificato dall'ENAC ai sensi del Cap. 11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della formazione security (Categoria A1)", "Deve essere formato e certificato dall'ENAC ai sensi del Cap. 11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della formazione security (Categoria A2)", "Deve essere formato e certificato dall'ENAC ai sensi del Cap. 11 del Regolamento (UE) 1998/2015 e del Manuale ENAC della formazione security (Categoria A5)"],
      answer: 0,
      image: "",
    },
{
      id: 166,
      category: "Esercitazione Categoria A1",
      text: "Il controllo dei veicoli viene svolto prevedendo una metodologia che prevede:",
      options: ["Una metodologia che prevede la valutazione del soggetto che effettua i controlli", "Una metodologia che prescinda dalla discrezionalità del seggetto che effettua i controlli", "Una metodologia definita con la sua progressività dal PNS"],
      answer: 1,
      image: "",
    },
{
      id: 167,
      category: "Esercitazione Categoria A1",
      text: "Cos’è il S.E.D.?",
      options: ["Rilevatore esplosivo nelle scarpe", "Rilevatore esplosivo nei bagagli da stiva", "Rilevatore tracce esplosivo"],
      answer: 0,
      image: "",
    },
{
      id: 168,
      category: "Esercitazione Categoria A1",
      text: "Sono considerati destinati all'uso personale di colui che li trasporta:",
      options: ["Cibo, occhiali, libri", "Cibo e bevande per un ricevimento", "Dispositivi informatici utilizzati per l'ufficio"],
      answer: 0,
      image: "",
    },
{
      id: 169,
      category: "Esercitazione Categoria A1",
      text: "Nel controllo dei passeggeri a ridotta mobilità (P.R.M.), se utilizzata una carrozzina, questa deve essere controllata?",
      options: ["Solo se non è del Gestore aeroportuale", "No", "Sempre"],
      answer: 2,
      image: "",
    },
{
      id: 170,
      category: "Esercitazione Categoria A1",
      text: "Se l’operatore non è in grado di stabilire se il passeggero trasporti o meno degli articoli proibiti, come deve procedere?",
      options: ["Allerta, senza esitare, la polizia", "Avvisa immediatamente la compagnia aerea", "Deve negare l’accesso alle aree sterili al passeggero o sottoporlo a nuovo controllo fino a quando non si riterrà convinto"],
      answer: 2,
      image: "",
    },
{
      id: 171,
      category: "Esercitazione Categoria A1",
      text: "Con quale metodo deve essere attuato il controllo (screening) delle persone diverse dai passeggeri e degli oggetti da esse trasportati per l'accesso alle aree sterili?",
      options: ["Controllo di sicurezza (screening) al 100%", "Controllo di sicurezza (screening) a campione continuo", "Nessuna delle altre risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 172,
      category: "Esercitazione Categoria A1",
      text: "Il bagaglio da stiva può essere:",
      options: ["Non accompagnato", "In transito", "Tutte le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 173,
      category: "Esercitazione Categoria A1",
      text: "Cosa si intende per L.A.G.?",
      options: ["Liquidi e aerosol", "Liquidi, aerosol e gels", "Liquidi"],
      answer: 1,
      image: "",
    },
{
      id: 174,
      category: "Esercitazione Categoria A1",
      text: "Di quali metodologie ci si avvale per lo screening del bagaglio da stiva?",
      options: ["Ispezione manuale, apparecchiature RX, sistemi di rilevamento di esplosivi (sistemi E.D.S.), dispositivi per il rilevamento di tracce di esplosivo (dispositivi E.T.D.), cani anti esplosivo (E.D.D.). Individualmente o in combinazione tra loro", "Solo dispositivi per il rilevamento di tracce di esplosivo (dispositivi E.T.D.), cani anti esplosivo (E.D.D.)", "Ispezione manuale o apparecchiature RX"],
      answer: 0,
      image: "",
    },
{
      id: 175,
      category: "Esercitazione Categoria A1",
      text: "Quale tra i seguenti articoli è considerato proibito all'interno di un bagaglio da stiva?",
      options: ["Arma da sparo", "Arma giocattolo", "Entrambe le risposte sono corrette"],
      answer: 0,
      image: "",
    },
{
      id: 176,
      category: "Esercitazione Categoria A1",
      text: "I bagagli da stiva provenienti dai Paesi aderenti al sistema 'One Stop Security' e in transito:",
      options: ["Sono bagagli non sicuri", "Vanno sempre controllati prima di essere imbarcati nuovamente", "Sono esentati dallo screening"],
      answer: 2,
      image: "",
    },
{
      id: 177,
      category: "Esercitazione Categoria A1",
      text: "I materiali organici all’apparecchiatura x-ray si riconoscono dal:",
      options: ["Colore verde", "Colore arancio", "Colore blu"],
      answer: 1,
      image: "",
    },
{
      id: 178,
      category: "Esercitazione Categoria A1",
      text: "Quale è la modalità del controllo manuale del bagaglio da stiva in una 'situazione sospetta'?",
      options: ["L'apertura ed il controllo manuale dei bagagli da stiva, che ha destato dei sospetti durante il controllo, deve essere effettuato dall'addetto al controllo in presenza del passeggero, salvo i casi in cui risulti impossibile reperire lo stesso, intendendo il caso in cui il passeggero non risponda ad una o più chiamate tramite altoparlante. In caso di assenza del passeggero è necessaria la presenza del personale della Polizia di Stato", "L'apertura ed il controllo manuale dei bagagli da stiva, che ha destato dei sospetti durante il controllo, deve essere effettuato dall'addetto al controllo solo in presenza del passeggero opportunatamente rintracciato tramite altoparlante", "L'apertura ed il controllo manuale dei bagagli da stiva, che ha destato dei sospetti durante il controllo, deve essere effettuato dall'addetto al controllo solo in presenza del personale della Polizia di Stato"],
      answer: 0,
      image: "",
    },
{
      id: 179,
      category: "Esercitazione Categoria A1",
      text: "Quali, tra le seguenti, NON è una delle ragioni per le quali l'aviazione civile è un obiettivo per i gruppi terroristici?",
      options: ["Per determinare un alto potenziale letale e un’alta probabilità di colpire cittadini di diversi paesi", "Per ostacolare l’interconnettività, interrompendo il trasporto aereo globale", "Per evitare qualunque forma di pubblicità dell’evento terroristico"],
      answer: 2,
      image: "",
    },
{
      id: 180,
      category: "Esercitazione Categoria A1",
      text: "Quale è la prima attività che devono compiere gli addetti alla sicurezza quando viene aperta una postazione di controllo?",
      options: ["Informare sempre la Direzione Aeroportuale e successivamente il locale ufficio della Polizia di Stato", "Informare il locale ufficio della Polizia di Stato", "Eseguire il test di avvio delle apparecchiature presenti in postazione, per verificarne il corretto funzionamento, prima di rendere operativa la postazione"],
      answer: 2,
      image: "",
    },
{
      id: 181,
      category: "Esercitazione Categoria A1",
      text: "I bagagli a mano:",
      options: ["Solo quelli dei passeggeri sospetti vanno controllati", "Si controllano a campione", "Il 100% dei bagagli a mano è sottoposto a screening"],
      answer: 2,
      image: "",
    },
{
      id: 182,
      category: "Esercitazione Categoria A1",
      text: "Quali indicazioni devono essere riportate sul lasciapassare",
      options: ["Le aree alle quali il veicolo è autorizzato ad accedere, la data di scadenza del lasciapassare (validità massima cinque anni), la targa del veicolo, l’ente o società di appartenenza del veicolo.", "Le aree alle quali il veicolo è autorizzato ad accedere, la data di scadenza del lasciapassare (validità massima cinque anni), la targa del veicolo, nome del guidatore", "Le aree alle quali il veicolo è autorizzato ad accedere, la data di scadenza dell'assicurazione, la targa del veicolo, l’ente o società di appartenenza del veicolo."],
      answer: 0,
      image: "",
    },
{
      id: 183,
      category: "Esercitazione Categoria A1",
      text: "Sono componenti essenziali di uno IED:",
      options: ["Batteria, detonatore, timer, fonte di alimentazione", "Carica esplosiva, innesco, sistema di attivazione", "Innesco, detonatore, timer, fonte di alimentazione"],
      answer: 1,
      image: "",
    },
{
      id: 184,
      category: "Esercitazione Categoria A1",
      text: "Di chi è la responsabilità del riscontro della concordanza tra il nominativo riportato sulla carta d'imbarco del passeggero con quello risultante da un documento di identità?",
      options: ["Dell'handler", "Del Gestore aeroportuale", "Del vettore"],
      answer: 2,
      image: "",
    },
{
      id: 185,
      category: "Esercitazione Categoria A1",
      text: "Quando il bagaglio da stiva in transito indiretto è dispensato dai controlli?",
      options: ["Quando provenga da uno Stato membro (a meno che la Commissione o tale Stato membro abbiano comunicato di ritenenere che esso sia stato sottoposto a controlli di livello inferiore rispetto alle norme fondamentali comuni) o arrivi da un 'paese terzo' incluso nell'Allegato 5 - A del Regolamento (UE) 1998 del 2015", "E' dispensato dal controllo anche se proviene da un altro Stato membro solo se autorizzato dal Comandante dell'aeromobile", "Non è dispensato dal controllo malgrado provenga da un altro Stato membro"],
      answer: 0,
      image: "",
    },
{
      id: 186,
      category: "Esercitazione Categoria A1",
      text: "Quale percentuale di controllo deve essere garantita per i passeggeri che, transitati attraverso il portale W.T.M.D., non hanno generato allarme?",
      options: ["Almeno il 25%", "Almeno il 20%", "Almeno il 10%"],
      answer: 2,
      image: "",
    },
{
      id: 187,
      category: "Esercitazione Categoria A1",
      text: "Il controllo con dispositivo E.T.D. del 90% degli oggetti trasportati dalle persone diverse dai passeggeri, viene effettuato utilizzando campioni prelevati da:",
      options: ["Interno ed esterno", "Parti del lato esterno dell'oggetto, tra cui se nel caso, cuciture, chiusure lampo e fibbie dell'oggetto stesso, oppure dalla fodera interna del bagaglio", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 188,
      category: "Esercitazione Categoria A1",
      text: "Come può essere impiegato il dispositivo H.H.M.D.?",
      options: ["Come modalità supplementare di screening", "Come una delle modalità previste per lo screening dei passeggeri", "Come modalità alternativa al controllo manuale"],
      answer: 0,
      image: "",
    },
{
      id: 189,
      category: "Esercitazione Categoria A1",
      text: "Chi è responsabile del procedimento di emissione del tesserino d’ingresso in aeroporto?",
      options: ["L’ENAC – Direzione Centrale Coordinamento Aeroporti", "Il Gestore aeroportuale su delega della Direzione Territoriale ENAC", "La Polizia di Frontiera"],
      answer: 1,
      image: "",
    },
{
      id: 190,
      category: "Esercitazione Categoria A1",
      text: "Ai sensi del PNS cosa si intende con riferimento ai membri di equipaggio 'immediate vicinanze'",
      options: ["S’intende approssimativamente 10 metri calcolati dal punto più estremo dell’aeromobile", "S’intende approssimativamente 3 metri dallo scortante", "S’intende approssimativamente 3 metri calcolati dal punto piu estremo dell'aeromobile"],
      answer: 0,
      image: "",
    },
{
      id: 191,
      category: "Esercitazione Categoria A1",
      text: "Si possono utilizzare dispositivi ETD, in combinazione con dispositivi HHMD, come metodologia primaria di screening per controllare le persone diverse dai passeggeri?",
      options: ["Si", "Si, solo se sono membri di equipaggio", "No"],
      answer: 2,
      image: "",
    },
{
      id: 300,
      category: "Esercitazione Categoria A4",
      text: "In quale circostanza può essere effettuato il controllo visivo del vano portabagagli di un veicolo?",
      options: ["Mai", "Sempre", "Quando il portabagagli è vuoto"],
      answer: 2,
      image: "",
    },
{
      id: 301,
      category: "Esercitazione Categoria A4",
      text: "Un veicolo con a bordo un tradotto o detenuto è:",
      options: ["Ispezionato in tre parti", "Esentato da ispezione", "Ispezionato solo in una parte"],
      answer: 1,
      image: "",
    },
{
      id: 302,
      category: "Esercitazione Categoria A4",
      text: "Quanti parti del veicolo devono essere sottoposte a controllo di sicurezza in ingresso in parte critica?",
      options: ["3 di 6", "1 di 6", "Dipende dalla valutazione del rischio"],
      answer: 0,
      image: "",
    },
{
      id: 303,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte 'E' del veicolo da ispezionare?",
      options: ["Vano motore", "Vano portabagagli", "Spazio sotto al parafango"],
      answer: 0,
      image: "",
    },
{
      id: 304,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte contrassegnata con la lettera 'F' del veicolo da ispezionare?",
      options: ["Vano portabagagli", "Ogni altra parte del veicolo non indicata alle lettere da 'A' ad 'E'", "Spazio sotto il parafango"],
      answer: 1,
      image: "",
    },
{
      id: 305,
      category: "Esercitazione Categoria A4",
      text: "I dispositivi ETD possono essere utilizzati come metodologia primaria di controllo di un veicolo per le seguenti parti:",
      options: ["Il vano portabagagli", "Il motore", "Per nessuna parte in quanto possono essere usati solo come strumento supplementare di ispezione"],
      answer: 2,
      image: "",
    },
{
      id: 306,
      category: "Esercitazione Categoria A4",
      text: "Quali tra le sottoelencate parti del veicolo, contrassegnate da lettere nel regolamento, è considerata una tra quelle da sottoporre ad ispezione?",
      options: ["Tasche dei sedili e spazio tra i piedi", "Vano motore", "Tasche sulle porte laterali, antine parasole"],
      answer: 1,
      image: "",
    },
{
      id: 307,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte 'A' del veicolo da ispezionare?",
      options: ["Tasche dei sedili, spazio tra pavimento e sedili e spazio per i piedi", "Vano portabagagli", "Tasche sulle porte laterali, antine parasole e vano portaoggetti"],
      answer: 2,
      image: "",
    },
{
      id: 308,
      category: "Esercitazione Categoria A4",
      text: "L'Autorità competente può, per ragioni obiettive, consentire che determinati veicoli siano sottoposti:",
      options: ["A speciali procedure di ispezione, purché vengano scortati da una persona autorizzata ad effettuare la scorta", "A normali procedure di ispezione, purché vengano scortati da una persona autorizzata ad effettuare la scorta", "A speciali procedure di ispezione, purché vengano scortati"],
      answer: 0,
      image: "",
    },
{
      id: 309,
      category: "Esercitazione Categoria A4",
      text: "I veicoli utilizzati per far fronte ad una grave minaccia imprevista per la vita o la proprietà:",
      options: ["Non sono esentati da controllo", "Possono essere esentati da controllo", "Sono sempre esentati da controllo"],
      answer: 1,
      image: "",
    },
{
      id: 310,
      category: "Esercitazione Categoria A4",
      text: "Quando un veicolo è esentato dal controllo di sicurezza?",
      options: ["Nel caso di veicolo appartenente alle Forze di Polizia che opera in aeroporto", "Nel caso di veicolo per far fronte ad una grave minaccia imprevista (VVF, CRI)", "Entrambe le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 311,
      category: "Esercitazione Categoria A4",
      text: "I veicoli che accedono alle parti critiche:",
      options: ["Devono essere ispezionati nella misura del 50%", "Devono essere ispezionati nella misura del 25%", "Devono essere tutti ispezionati"],
      answer: 2,
      image: "",
    },
{
      id: 312,
      category: "Esercitazione Categoria A4",
      text: "Quali tra i seguenti veicoli sono esentati da ispezione?",
      options: ["I veicoli utilizzati dai fornitori conosciuti di forniture d’aeroporto", "I veicoli delle Forze dell’Ordine muniti di lasciapassare valido e condotti da personale in servizio in aeroporto", "Entrambe le altre risposte sono corrette"],
      answer: 1,
      image: "",
    },
{
      id: 313,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte 'C' del veicolo da ispezionare?",
      options: ["Vano portabagagli", "Vano motore", "Spazio sotto al parafango"],
      answer: 0,
      image: "",
    },
{
      id: 314,
      category: "Esercitazione Categoria A4",
      text: "Un'ispezione manuale del veicolo consiste:",
      options: ["In un controllo manuale randomico delle aree selezionate", "In un controllo manuale completo delle aree selezionate", "In un controllo casuale delle aree selezionate"],
      answer: 1,
      image: "",
    },
{
      id: 315,
      category: "Esercitazione Categoria A4",
      text: "Quale delle seguenti affermazioni è corretta?",
      options: ["Il Gestore aeroportuale deve predisporre una procedura per garantire la casualità della selezione dei veicoli e delle aree da ispezionare", "Il Gestore aeroportuale deve predisporre una procedura per garantire l'efficacia della selezione dei veicoli e delle aree da ispezionare", "Il Gestore aeroportuale deve predisporre una procedura per garantire l'effettuazione della selezione dei veicoli e delle aree da ispezionare"],
      answer: 0,
      image: "",
    },
{
      id: 316,
      category: "Esercitazione Categoria A4",
      text: "Il conducente ed eventuali occupanti del veicolo, ai fini del controllo:",
      options: ["Non possono trovarsi al suo interno", "Entrambe le altre risposte sono corrette", "Devono togliere gli oggetti personali dal veicolo per sottoporli a screening"],
      answer: 1,
      image: "",
    },
{
      id: 317,
      category: "Esercitazione Categoria A4",
      text: "Il mezzo dei vigili del fuoco operante in aeroporto e dotato di lasciapassare è esente dai controlli:",
      options: ["No", "Solo se in stato di emergenza per far fronte ad una grave minaccia imprevista per la vita o la proprietà", "Si"],
      answer: 0,
      image: "",
    },
{
      id: 318,
      category: "Esercitazione Categoria A4",
      text: "In caso di controllo di veicoli appartenenti alle Forze dell'Ordine non esenti da controllo, l'ispezione deve essere effettuata:",
      options: ["In presenza di un Supervisore formato per la Categoria A11", "In presenza di personale delle Forze di Polizia", "Senza necessità della presenza di personale delle Forze di Polizia"],
      answer: 1,
      image: "",
    },
{
      id: 319,
      category: "Esercitazione Categoria A4",
      text: "Le parti sigillate dei veicoli sono esentate dai controlli:",
      options: ["No, devono essere ispezionati nella misura del 25%", "Mai", "Nel caso in cui i sigilli non siano stati manomessi"],
      answer: 2,
      image: "",
    },
{
      id: 320,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte contrassegnata dalla lettera 'G' del veicolo da ispezionare?",
      options: ["Non è indicata nell'elenco delle parti del veicolo da ispezionare", "Vano motore", "Vano portabagagli"],
      answer: 0,
      image: "",
    },
{
      id: 321,
      category: "Esercitazione Categoria A4",
      text: "I comparti dei veicoli che trasportano prove giudiziali sono:",
      options: ["Sottoposti ad ispezione", "Sottoposti ad ispezione solo in una parte", "Esentati dall'ispezione"],
      answer: 2,
      image: "",
    },
{
      id: 322,
      category: "Esercitazione Categoria A4",
      text: "Le seguenti modalità possono essere utilizzate come strumento supplementare di ispezione dei veicoli:",
      options: ["Solo dispositivi per il rilevamento di tracce di esplosivi (ETD)", "Entrambe le risposte sono corrette", "Solo cani antiesplosivo (EDD)"],
      answer: 1,
      image: "",
    },
{
      id: 323,
      category: "Esercitazione Categoria A4",
      text: "I veicoli che introducono forniture di aeroporto:",
      options: ["Sono controllati solo se provengono da fornitori sconosciuti che ricadono nella percentuale da sottoporre a screening", "Sono sempre controllati", "Sono controllati solo se provengono da fornitori sconosciuti"],
      answer: 1,
      image: "",
    },
{
      id: 324,
      category: "Esercitazione Categoria A4",
      text: "Il Gestore Aeroportuale deve predisporre una procedura affinchè la selezione delle aree da ispezionare del veicolo presupponga:",
      options: ["La discrezionalità da parte degli addetti preposti al controllo", "La scelta da parte degli organi di Polizia di presidio al varco di accesso", "La casualità delle aree da controllare"],
      answer: 2,
      image: "",
    },
{
      id: 325,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte 'B' del veicolo da ispezionare?",
      options: ["Tasche dei sedili, spazio tra pavimento e sedili e spazio per i piedi", "Spazio sotto al parafango", "Tasche sulle porte laterali, antine parasole e vano portaoggetti"],
      answer: 0,
      image: "",
    },
{
      id: 326,
      category: "Esercitazione Categoria A4",
      text: "L'Autorità competente può, per ragioni obiettive, consentire che a determinati veicoli sia applicata:",
      options: ["Un campionamento in sostituzione dell'ispezione", "L'esenzione dall'ispezione", "La facilitazione nell'ispezione"],
      answer: 1,
      image: "",
    },
{
      id: 327,
      category: "Esercitazione Categoria A4",
      text: "La procedura per garantire la casualità della selezione delle aree dei veicoli da ispezionare deve essere predisposta da:",
      options: ["ENAC", "Ente od impresa preposti ai controlli", "Gestore Aeroportuale"],
      answer: 2,
      image: "",
    },
{
      id: 328,
      category: "Esercitazione Categoria A4",
      text: "Cosa comprende la parte 'D' del veicolo da ispezionare?",
      options: ["Vano portabagagli", "Vano motore", "Spazio sotto al parafango"],
      answer: 2,
      image: "",
    },
{
      id: 329,
      category: "Esercitazione Categoria A4",
      text: "Quante parti dei veicoli che accedono in area critica devono essere controllate?",
      options: ["1", "3", "6"],
      answer: 1,
      image: "",
    },
{
      id: 330,
      category: "Esercitazione Categoria A4",
      text: "I veicoli delle Forze dell'Ordine muniti di lasciapassare valido e condotti da personale in servizio in aeroporto sono:",
      options: ["Sottoposti ad ispezione", "Esentati dall'ispezione", "Sottoposti ad ispezione in una parte"],
      answer: 1,
      image: "",
    },
{
      id: 331,
      category: "Esercitazione Categoria A4",
      text: "Nei veicoli selezionati per l'ispezione prima dell'accesso a parti delle aree sterili diverse da quelle critiche:",
      options: ["Devono essere ispezionate almeno tre delle parti previste", "Devono essere ispezionate almeno due delle parti previste", "Deve essere ispezionata almeno una delle parti previste"],
      answer: 2,
      image: "",
    },
{
      id: 332,
      category: "Esercitazione Categoria A4",
      text: "Quale delle seguenti affermazioni è corretta?",
      options: ["Tutti i veicoli devono essere ispezionati prima di accedere alle parti critiche", "Un veicolo ogni tre deve essere ispezionato prima di accedere alle parti critiche", "Il 30% dei veicoli deve essere ispezionato prima di accedere alle parti critiche"],
      answer: 0,
      image: "",
    },
{
      id: 333,
      category: "Esercitazione Categoria A4",
      text: "Quanti parti del veicolo devono essere sottoposte a controllo di sicurezza in ingresso in area sterile?",
      options: ["1 di 6 a scelta dell’addetto security", "1 di 6 seguendo un modello casuale", "Nessuna"],
      answer: 1,
      image: "",
    },
{
      id: 334,
      category: "Esercitazione Categoria A4",
      text: "In quali casi deve essere controllato il lasciapassare in ingresso in area critica?",
      options: ["Solo la prima volta che entra", "Su base casuale e continua", "Tutte le volte che accede in area critica"],
      answer: 2,
      image: "",
    },
{
      id: 335,
      category: "Esercitazione Categoria A4",
      text: "Quando viene effettuata l'ispezione, il conducente ed eventuali occupanti del veicolo:",
      options: ["Possono trovarsi al suo interno", "Non devono trovarsi al suo interno", "Devono trovarsi al suo interno"],
      answer: 1,
      image: "",
    },
{
      id: 336,
      category: "Esercitazione Categoria A4",
      text: "Le parti da ispezionare dei veicoli:",
      options: ["Vengono individuate in modo casuale attraverso idonea metodologia", "Vengono scelte dal personale delle Forze di Polizia in supporto ai varchi di accesso", "Vengono scelte dal personale addetto allo screening"],
      answer: 0,
      image: "",
    },
{
      id: 337,
      category: "Esercitazione Categoria A4",
      text: "La casualità nella scelta delle parti del veicolo da sottoporre ad ispezione deve essere garantita da una procedura predisposta da:",
      options: ["La Polizia di Frontiera", "L’ENAC", "Il Gestore aeroportuale"],
      answer: 2,
      image: "",
    },
{
      id: 338,
      category: "Esercitazione Categoria A4",
      text: "In ogni lasciapassare veicolare cosa deve essere indicato:",
      options: ["Le aree alle quali è autorizzato ad accedere, la targa", "Le aree alle quali è autorizzato ad accedere, la targa, la società di appartenenza e la data di scadenza", "Le aree alle quali è autorizzato ad accedere, la targa, la società di appartenenza"],
      answer: 1,
      image: "",
    },
{
      id: 339,
      category: "Esercitazione Categoria A4",
      text: "Qualora selezionato per il controllo, lo spazio sotto al parafango:",
      options: ["Viene ispezionato visivamente", "Viene sempre controllato con l'ausilio di idonei strumenti", "Viene sempre controllato manualmente"],
      answer: 0,
      image: "",
    },
{
      id: 340,
      category: "Esercitazione Categoria A4",
      text: "Un'ispezione manuale di un veicolo consiste in un controllo completo delle aree selezionate, compreso il contenuto, allo scopo di garantire con ragionevole sicurezza che esse:",
      options: ["Contengano articoli proibiti", "Non contengano utensili proibiti", "Non contengano articoli proibiti"],
      answer: 2,
      image: "",
    },
{
      id: 341,
      category: "Esercitazione Categoria A4",
      text: "Quali dei seguenti veicoli o parti di essi sono esentati dall'ispezione?",
      options: ["Parti di un veicolo con a bordo un tradotto, un detenuto o qualsiasi persona in stato di arresto o sotto diretta custodia degli organi di Polizia", "Entrambe le altre risposte sono corrette", "Comparti dei veicoli che trasportano prove giudiziali od oggetti sequestrati"],
      answer: 1,
      image: "",
    },
{
      id: 342,
      category: "Esercitazione Categoria A4",
      text: "I veicoli sotto diretta custodia degli organi di Polizia sono:",
      options: ["Esentati dall'ispezione", "Ispezionati in una sola parte", "Sottoposti ad ispezione"],
      answer: 0,
      image: "",
    },
{
      id: 343,
      category: "Esercitazione Categoria A4",
      text: "Con quale percentuale devono essere controllati i veicoli che accedono in area sterile?",
      options: ["10% con controllo a campione continuo", "Controllo su base casuale con una percentuale compresa tra il 25% e il 30 %", "Devono essere tutti controllati"],
      answer: 1,
      image: "",
    },
{
      id: 344,
      category: "Esercitazione Categoria A4",
      text: "I veicoli che accedono alle aree sterili diversi dalle parti critiche:",
      options: ["Devono essere tutti ispezionati", "evono essere ispezionati in una percentuale compresa tra il 45% ed il 50% selezionata su base continua e casuale", "Devono essere ispezionati in una percentuale compresa tra il 25% ed il 30% selezionata su base continua e casuale"],
      answer: 2,
      image: "",
    },
{
      id: 345,
      category: "Esercitazione Categoria A4",
      text: "L'ispezione del vano portabagagli di un veicolo:",
      options: ["Deve essere eseguita visivamente", "Deve essere eseguita manualmente", "Può essere eseguita manualmente"],
      answer: 1,
      image: "",
    },
{
      id: 346,
      category: "Esercitazione Categoria A4",
      text: "Qualora vengano selezionate per il controllo del veicolo le tasche dei sedili, spazio tra pavimento e sedili e spazio per i piedi:",
      options: ["Deve essere effettuata un'ispezione manuale", "Deve essere effettuata un'ispezione visiva", "Può essere effettuata o un'ispezione manuale o un'ispezione visiva"],
      answer: 0,
      image: "",
    },
{
      id: 347,
      category: "Esercitazione Categoria A4",
      text: "L’addetto alla sicurezza prima che il veicolo acceda in area sterile o in una parte critica deve verificare la validità:",
      options: ["Del lasciapassare, della patente aeroportuale, del TIA", "Del lasciapassare, della patente di guida, del TIA", "Del lasciapassare, del libretto di circolazione"],
      answer: 0,
      image: "",
    },
{
      id: 348,
      category: "Esercitazione Categoria A4",
      text: "Quando il vano motore è stato selezionato per l'ispezione su base casuale e tale vano non può essere ispezionato per ragioni operative oggettive:",
      options: ["Il vano motore può essere esentato da controllo dietro autorizzazione delle Forze di Polizia di presidio al varco di accesso", "Può essere scelta un'altra parte del veicolo da controllare, a discrezione dello screener", "Il vano motore è ispezionato servendosi di un endoscopio o di un dispositivo simile che permetta di effettuare controlli visivi"],
      answer: 2,
      image: "",
    },
{
      id: 349,
      category: "Esercitazione Categoria A4",
      text: "Durante l’ispezione del veicolo:",
      options: ["Eventuali occupanti devono scendere mentre il conducente resta a bordo per spostare il veicolo e consentire il controllo dei mezzi a seguire.", "Il conducente deve scendere ma deve lasciare gli oggetti personali per consentirne il controllo da parte degli addetti security", "Il conducente deve scendere e portare con se eventuali oggetti e sottoporsi a screening"],
      answer: 2,
      image: "",
    },
{
      id: 350,
      category: "Esercitazione Categoria A4",
      text: "Il lasciapassare per veicoli può essere:",
      options: ["Entrambe le altre risposte sono corrette", "Permanente", "Temporaneo"],
      answer: 0,
      image: "",
    },
{
      id: 351,
      category: "Esercitazione Categoria A4",
      text: "Quali sono i colori che può avere un LVA:",
      options: ["Rosso, Azzurro, Giallo", "Rosso, Giallo, Verde", "Verde, Giallo, Bianco"],
      answer: 1,
      image: "",
    },
{
      id: 352,
      category: "Esercitazione Categoria A4",
      text: "L'LVA di colore rosso, a quale area da accesso:",
      options: ["Solo strada perimetrale", "Ovunque, tranne sottobordo", "Tutte le aree"],
      answer: 2,
      image: "",
    },
{
      id: 353,
      category: "Esercitazione Categoria A4",
      text: "L'LVA di colore giallo, a quale area da accesso:",
      options: ["Solo strada perimetrale", "Ovunque, tranne sottobordo", "Tutte le aree"],
      answer: 1,
      image: "",
    },
{
      id: 354,
      category: "Esercitazione Categoria A4",
      text: "L'LVA di colore verde, a quale area da accesso:",
      options: ["Solo strada perimetrale", "Ovunque, tranne sottobordo", "Tutte le aree"],
      answer: 0,
      image: "",
    },
{
      id: 500,
      category: "Esercitazione Categoria A5",
      text: "Quanti sono i numeri che possono essere inseriti sul tesserino di ingresso in aeroporto e che contraddistinguono le aree di acceso in aeroporto?",
      options: ["7", "5", "6"],
      answer: 0,
      image: "",
    },
{
      id: 501,
      category: "Esercitazione Categoria A5",
      text: "Tra i motivi legittimi per accedere alle aree sterili, vi sono:",
      options: ["Viaggio e lavoro", "Viaggio, lavoro, formazione, informazione ed educazione", "Viaggio"],
      answer: 1,
      image: "",
    },
{
      id: 502,
      category: "Esercitazione Categoria A5",
      text: "La sorveglianza e pattugliamento vengono effettuati allo scopo di monitorare:",
      options: ["Aree non accessibili al pubblico appartenenti o vicino all'aerostazione", "Aree accessibili al pubblico appartenenti o vicino all'aerostazione, non incluse le aree di parcheggio e le strade di accesso", "Aree accessibili al pubblico appartenenti o vicino all'aerostazione, incluse le aree di parcheggio e le strade di accesso"],
      answer: 2,
      image: "",
    },
{
      id: 503,
      category: "Esercitazione Categoria A5",
      text: "Le aree delle parti critiche di un aeroporto utilizzate dai passeggeri od equipaggi in arrivo da paesi terzi ma che non sono poi utilizzate da passeggeri e/o bagagli da stiva in partenza controllati (es. aree di riconsegna bagagli):",
      options: ["Non devono essere sottoposte ad ispezione di sicurezza", "Non devono essere sottoposte ad ispezione doganale", "Devono essere sottoposte ad ispezione di sicurezza"],
      answer: 0,
      image: "",
    },
{
      id: 504,
      category: "Esercitazione Categoria A5",
      text: "La valutazione del rischio, ai fini della sorveglianza e pattugliamento, viene effettuata:",
      options: ["Dall'ENAC", "Dal Gestore Aeroportuale", "Dalla Polizia di Stato"],
      answer: 1,
      image: "",
    },
{
      id: 505,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto con la banda colore AZZURRO a quali aree autorizza l'accesso?",
      options: ["Aeromobili e loro adiacenze", "Lato volo interno e piazzali aeromobili", "Tale combinazione di colore e numero non esiste"],
      answer: 2,
      image: "",
    },
{
      id: 506,
      category: "Esercitazione Categoria A5",
      text: "Le persone diverse dai passeggeri e gli oggetti da esse trasportati all'ingresso delle parti critiche, sono controllate con le seguenti modalità:",
      options: ["Controllo di sicurezza (screening) al 75%", "Controllo di sicurezza (screening) al 100%", "Controllo di sicurezza (screening) al 50%"],
      answer: 1,
      image: "",
    },
{
      id: 507,
      category: "Esercitazione Categoria A5",
      text: "La sorveglianza ed il pattugliamento vengono effettuati allo scopo di monitorare:",
      options: ["Il bagaglio da stiva, le merci e la posta, le provviste di bordo nonchè la posta ed il materiale del vettore aereo presenti nelle aree sterili in attesa di essere caricati", "Il bagaglio da stiva, le provviste di bordo nonchè la posta ed il materiale del vettore aereo presenti nelle aree sterili in attesa di essere caricati", "Le merci e la posta, le provviste di bordo nonchè la posta ed il materiale del vettore aereo presenti nelle aree sterili in attesa di essere caricati"],
      answer: 0,
      image: "",
    },
{
      id: 508,
      category: "Esercitazione Categoria A5",
      text: "Una tipologia di lasciapassare per veicoli targati è:",
      options: ["Un lasciapassare permanente per veicoli targati, compresi quelli appartenenti agli Enti di Stato, che operano stabilmente in aeroporto e con validità massima di cinque anni", "Un lasciapassare temporaneo per veicoli targati, compresi quelli appartenenti agli Enti di Stato, che operano stabilmente in aeroporto e con validità massima di cinque anni", "Un lasciapassare permanente per veicoli targati, compresi quelli appartenenti agli Enti di Stato, che operano stabilmente in aeroporto e con validità massima di due anni"],
      answer: 0,
      image: "",
    },
{
      id: 509,
      category: "Esercitazione Categoria A5",
      text: "Quali categorie deve possedere il personale che presidia il punto di accesso dei veicoli?",
      options: ["Categoria A1", "Categoria A4", "CategoriaA5"],
      answer: 2,
      image: "",
    },
{
      id: 510,
      category: "Esercitazione Categoria A5",
      text: "Quale tra le seguenti affermazioni è vera?",
      options: ["Accesso alla parte critica dell'area sterile: controllo accesso ed ispezione veicoli nella misura del 100%", "Accesso all'area sterile: controllo accesso veicoli nella misura del 25% ed ispezione veicoli nella misura del 100%", "Nessuna delle altre risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 511,
      category: "Esercitazione Categoria A5",
      text: "Tra i motivi legittimi per accedere alle aree sterili, vi sono:",
      options: ["Le visite guidate dell'aeroporto senza scorta", "Le visite guidate dell'aeroporto con scorta non armata", "Le visite guidate dell'aeroporto scortate da persone autorizzate"],
      answer: 2,
      image: "",
    },
{
      id: 512,
      category: "Esercitazione Categoria A5",
      text: "Per carta d'imbarco valida si intende:",
      options: ["Il documento di imbarco emesso per un volo in partenza da quell'aeroporto nelle ore seguenti all'accesso in area sterile", "L'attestazione di viaggio rilasciata dalla compagnia aerea", "L'attestazione di viaggio rilasciata dalla società di handling"],
      answer: 0,
      image: "",
    },
{
      id: 513,
      category: "Esercitazione Categoria A5",
      text: "I tesserini di colore ARANCIONE, permettono l'accesso di:",
      options: ["Doganalisti", "Diplomatici", "Agenti regolamentati"],
      answer: 1,
      image: "",
    },
{
      id: 514,
      category: "Esercitazione Categoria A5",
      text: "Le persone diverse dai passeggeri, già sottoposte a screening, che lasciano temporaneamente le parti critiche, possono essere esentate dallo screening al loro ritorno in area critica, purchè:",
      options: ["Siano state seguite da personale autorizzato", "Siano state scortate da personale autorizzato", "Siano rimaste sotto costante osservazione da pare del personale autorizzato, presente all'interno dell'area critica"],
      answer: 2,
      image: "",
    },
{
      id: 515,
      category: "Esercitazione Categoria A5",
      text: "Nella sorveglianza e pattugliamento la validità dei documenti identificativi, deve essere sottoposta:",
      options: ["A controlli a campione", "A controlli continui", "A controlli saltuari"],
      answer: 0,
      image: "",
    },
{
      id: 516,
      category: "Esercitazione Categoria A5",
      text: "Come sono individuate sul tesserino di ingresso in aeroporto le parti critiche delle aree sterili ove il titolare può accedere?",
      options: ["Con l'uso di uno o più colori", "Con l'uso di uno o più numeri", "Con l'uso di una o più lettere"],
      answer: 1,
      image: "",
    },
{
      id: 517,
      category: "Esercitazione Categoria A5",
      text: "Chi effettua la valutazione del rischio per la procedura di sorveglianza e pattugliamento?",
      options: ["ENAC", "Gestore aeroportuale", "Gestore aeroportuale tenendo conto delle informazioni fornite dalla Polizia di Stato"],
      answer: 2,
      image: "",
    },
{
      id: 518,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore VERDE) a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo esterno, accessi interni ed area di manovra", "Lato volo interno ed area trattamento bagagli", "Lato volo interno ed area di manovra"],
      answer: 0,
      image: "/images/Tesserinoverde27.png",
    },
{
      id: 519,
      category: "Esercitazione Categoria A5",
      text: "Per essere autorizzata ad accedere alle aree sterili, una persona deve esibire:",
      options: ["Una fidelity card", "Un valido tesserino identificativo di membro dell'equipaggio", "Un passaporto"],
      answer: 1,
      image: "",
    },
{
      id: 520,
      category: "Esercitazione Categoria A5",
      text: "Le parti critiche delle aree sterili, previa bonifica, possono essere istituite anche:",
      options: ["Temporaneamente", "Definitivamente", "Parzialmente"],
      answer: 0,
      image: "",
    },
{
      id: 521,
      category: "Esercitazione Categoria A5",
      text: "Quale requisito deve avere la recinzione perimetrale?",
      options: ["Essere costruita solo con reti metalliche anti intrusione", "Essere dotata di un sistema di allarme che segnali l'eventuale intrusione", "Essere libera da ostacoli lungo l'intera recinzione"],
      answer: 2,
      image: "",
    },
{
      id: 522,
      category: "Esercitazione Categoria A5",
      text: "I tesserini di colore MARRONE, permettono l'accesso:",
      options: ["A tutte le aree non sterili", "Non esiste la tipologia di tessera aeroportuale", "Alle sole aree sterili"],
      answer: 1,
      image: "",
    },
{
      id: 523,
      category: "Esercitazione Categoria A5",
      text: "Il riconcilio tra persona ed articolo proibito deve essere effettuato:",
      options: ["Prima che la persona sia autorizzata a trasportare l'articolo proibito in area sterile", "Almeno 2 ore prima che la persona sia autorizzata a trasportare l'articolo proibito in area sterile", "Non occorre effettuare il riconcilio"],
      answer: 0,
      image: "",
    },
{
      id: 524,
      category: "Esercitazione Categoria A5",
      text: "Il lasciapassare per veicoli:",
      options: ["Non può essere rilasciato su supporto elettronico", "E' stampato solo su supporto cartaceo", "Può essere rilasciato anche su supporto elettronico"],
      answer: 2,
      image: "",
    },
{
      id: 525,
      category: "Esercitazione Categoria A5",
      text: "Ove applicabile, il tesserino di ingresso in aeroporto, deve riportare:",
      options: ["L'indirizzo di residenza del titolare", "La scadenza del contratto", "L'indicazione delle categorie di articoli proibiti, di cui all'Appendice 1-A del Reg. (UE) 1998/2015"],
      answer: 2,
      image: "",
    },
{
      id: 526,
      category: "Esercitazione Categoria A5",
      text: "All'atto del controllo del personale di staff è necessario:",
      options: ["Verificare la concordanza tra titolare e foto presente sulla tessera aeroportuale", "Verificare la data di scadenza della tessera aeroportuale", "Non occorre alcuna verifica in quanto il sistema di controllo accessi la effettua automaticamente"],
      answer: 0,
      image: "",
    },
{
      id: 527,
      category: "Esercitazione Categoria A5",
      text: "La presenza di persone che non espongano un tesserino di ingresso in area critica, deve essere segnalato al:",
      options: ["Gestore Aeroportuale", "Forze dell'Ordine operanti in aeroporto", "Capo scalo"],
      answer: 1,
      image: "",
    },
{
      id: 528,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto con la banda colore ROSA a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo esterno, accessi interni, aree trattamento bagagli ed aree merci", "Lato volo interno, aree trattamento bagagli ed aree merci", "Tale tipologia di tesserino di ingresso in aeroporto non esiste"],
      answer: 2,
      image: "",
    },
{
      id: 529,
      category: "Esercitazione Categoria A5",
      text: "Le categorie di veicoli che possono essere esentate dal controllo dell'accesso sono stabilite:",
      options: ["Nella Decisione riservata 8005/2015", "Nel Regolamento (UE) 1998/2015", "Entrambe le risposte sono corrette"],
      answer: 1,
      image: "",
    },
{
      id: 530,
      category: "Esercitazione Categoria A5",
      text: "Per documento equivalente di una carta d'imbarco, si intende:",
      options: ["Il codice QR visualizzabile su dispositivo elettronico", "l codice a barre anche stampato su carta", "Il documento di imbarco rilasciato a mezzo di web check in o sms o mms da un vettore"],
      answer: 2,
      image: "",
    },
{
      id: 531,
      category: "Esercitazione Categoria A5",
      text: "Come deve essere organizzato il servizio di sorveglianza e pattugliamento?",
      options: ["Su base casuale", "A discrezione delle guardie", "Su decisione della Polizia"],
      answer: 0,
      image: "",
    },
{
      id: 532,
      category: "Esercitazione Categoria A5",
      text: "Quali tra le seguenti tessere aeroportuali non consente l'accesso nelle aree di smistamento dei bagagli da stiva?",
      options: ["Tessera verde con numero 2-3-5-6", "Tessera verde con numero 2-4-5-6", "Tessera rossa con numero 1"],
      answer: 1,
      image: "",
    },
{
      id: 533,
      category: "Esercitazione Categoria A5",
      text: "Quali tra queste tessere aeroportuali non consente l'accesso alle parti critiche dell'area cargo?",
      options: ["Giallo con codice 2 e dicitura 'incluso cargo city'", "Verde con codici 2-5-6 e dicitura 'inclusa perimetrale'", "Nessuna delle altre risposte è corretta"],
      answer: 2,
      image: "",
    },
{
      id: 534,
      category: "Esercitazione Categoria A5",
      text: "Il controllo dei titoli che abilitano i veicoli all'accesso può essere effettuato:",
      options: ["Solo visivamente", "Da personale di controllo che visivamente esamini il titolo di accesso, anche mediante ausili tecnologici (p.es. lettore di badge)", "Solo mediante un sistema elettronico"],
      answer: 1,
      image: "",
    },
{
      id: 535,
      category: "Esercitazione Categoria A5",
      text: "In base alla circolare ENAC SEC 05A, per quale categoria deve essere formato un addetto al controllo dell'accesso in area sterile delle persone diverse dai passeggeri?",
      options: ["Categoria A5", "Categoria A4", "Categoria A1"],
      answer: 0,
      image: "",
    },
{
      id: 536,
      category: "Esercitazione Categoria A5",
      text: "Un tesserino elettronico viene immediatamente disattivato in seguito a:",
      options: ["Ritiro o notifica dello smarrimento", "Restituzione e scadenza", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 537,
      category: "Esercitazione Categoria A5",
      text: "Chi è tenuto a controllare la validità dei tesserini aeroportuali nell’area sterile 'esterna'?",
      options: ["Il Personale GPG in servizio di pattugliamento", "La Security delle Compagnie Aeree", "La Direzione Territoriale ENAC"],
      answer: 0,
      image: "",
    },
{
      id: 538,
      category: "Esercitazione Categoria A5",
      text: "Il Gestore Aeroportuale deve predisporre un registro, anche in formato elettronico, riportante i:",
      options: ["Tesserini smarriti", "Tesserini restituiti", "Tesserini smarriti o rubati per i quali sono stati rilasciati i duplicati ed i tesserini non restituiti"],
      answer: 2,
      image: "",
    },
{
      id: 539,
      category: "Esercitazione Categoria A5",
      text: "Il diplomatico titolare del tesserino di ingresso in aeroporto rappresentato in foto (banda color ARANCIO) in quali aree delle parti critiche delle aree sterili è autorizzato ad accedere?",
      options: ["Aree trattamento bagagli, aree merci, aeromobili e loro adiacenze", "Aree trattamento bagagli, aree merci e piazzali", "Area interna od aree delle parti critiche (sale partenze, moli ed interno altri edifici), aree trattamento bagagli"],
      answer: 1,
      image: "/images/Tesserinoarancio346.png",
    },
{
      id: 540,
      category: "Esercitazione Categoria A5",
      text: "Il sistema di telecamere a circuito chiuso TVCC deve essere configurato:",
      options: ["Solo presso le sale operative della Polizia di Stato", "Presso le sale operative del Gestore e della Polizia di Frontiera", "Solo presso le sale operative del Gestore"],
      answer: 1,
      image: "",
    },
{
      id: 541,
      category: "Esercitazione Categoria A5",
      text: "A chi è riferibile il tesserino di ingresso in aeroporto di colore Bianco?",
      options: ["Agli accessi con scorta", "Agli operatori aeroportuali che svolgono la propria attività lavorativa nell'area lato volo interno", "Agli operatori aeroportuali che svolgono la propria attività lavorativa in area land side"],
      answer: 0,
      image: "",
    },
{
      id: 542,
      category: "Esercitazione Categoria A5",
      text: "Che tipologia di controllo deve essere effettuato sui VVF in servizio operativo aeroportuale non in intervento di emergenza?",
      options: ["Nessuno, i VVF sono sempre esentati", "Devono essere sottoposti a screening sia sulla persona che sugli oggetti al seguito", " I VVF sono esentati dallo screening sulla persona ma devono essere sottoposti a controllo gli oggetti al seguito anche se personali"],
      answer: 2,
      image: "",
    },
{
      id: 543,
      category: "Esercitazione Categoria A5",
      text: "L'Addetto al controllo di sicurezza, prima che un veicolo sia autorizzato ad accedere alle aree sterili, deve:",
      options: ["Solo verificare che sia in possesso di un lasciapassare che abilita all'accesso alle aree sterili", "Solo controllare il lasciapassare per accertare con ragionevole sicurezza che sia valido", "Controllare la corrispondenza tra quanto riportato sul lasciapassare ed il veicolo"],
      answer: 2,
      image: "",
    },
{
      id: 544,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto deve consentire:",
      options: ["L'accesso esclusivamente alle aree dell'aeroporto nelle quali il titolare espleta le proprie attività lavorative", "L'accesso esclusivamente alle aerostazioni dell'aeroporto di pertinenza", "L'accesso alle aree sterili ed alle parti critiche delle aree sterili"],
      answer: 0,
      image: "",
    },
{
      id: 545,
      category: "Esercitazione Categoria A5",
      text: "Un tesserino identificativo di membro dell'equipaggio, dipendente di un vettore aereo dell'Unione Europea, reca:",
      options: ["Il nome del vettore aereo", "Il nome e la fotografia del titolare", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 546,
      category: "Esercitazione Categoria A5",
      text: "Il responsabile dell'Ente/ditta/società titolare del lasciapassare per veicoli, in caso di smarrimento o furto, deve, tra l'altro:",
      options: ["Presentare immediatamente denuncia all'Autorità di Pubblica Sicurezza", "Richiedere al gestore aeroportuale una nuova emissione del lasciapassare", "Nessuna delle altre risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 547,
      category: "Esercitazione Categoria A5",
      text: "Le modalità accettabili, da utilizzare singolarmente od in combinazione tra loro, che diano una ragionevole sicurezza di individuare tentativi di utilizzo improprio di tesserini di ingresso in aeroporto smarriti, rubati o non restituiti, sono:",
      options: ["La presenza di lista cartacea periodicamente aggiornata dei tesserini, presso i varchi di controllo, a disposizione del personale ivi preposto", "La presenza di elenco, anche in formato elettronico, costantemente aggiornato, dei tesserini presso i varchi di controllo, a disposizione del personale ivi preposto", "La presenza di lista aggiornata dei tesserini, presso i varchi di controllo, a disposizione del personale ivi preposto"],
      answer: 1,
      image: "",
    },
{
      id: 548,
      category: "Esercitazione Categoria A5",
      text: "Gli articoli proibiti nelle parti critiche delle aree sterili sono indicati:",
      options: ["Nell'appendice 4-C", "Nell'appendice 1-A", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 549,
      category: "Esercitazione Categoria A5",
      text: "Per 'tesserino identificativo di membro di equipaggio' si intende:",
      options: ["Un tesserino CREW rilasciato da ENAC", "Un tesserino rilasciato dal vettore aereo o dall'Autorità Aeronautica Nazionale competente", "Un tesserino aziendale"],
      answer: 1,
      image: "",
    },
{
      id: 550,
      category: "Esercitazione Categoria A5",
      text: "Quale attività di security occorre porre in essere prima di autorizzare l'acceso in area critica alla persona titolare del tesserino di ingresso in aeroporto rappresentato in foto (banda colore ROSSO) quando non deve effettuare un intervento in emergenza?",
      options: ["La persona è esente dai controlli di sicurezza, gli oggetti da essa trasportati sono sottoposti a controllo radiogeno", "La persona è esente da qualsiasi attività di security, come riportato sul tesserino", "La persona prima di accedere in area critica effettua il controllo accessi ed è esentata dai controlli di sicurezza"],
      answer: 2,
      image: "/images/Tesserinorosso1EsentePolizia.png",
    },
{
      id: 551,
      category: "Esercitazione Categoria A5",
      text: "Cosa individua il colore nel tesserino di ingresso in aeroporto?",
      options: ["L'area dell'aeroporto ove il titolare è autorizzato ad accedere", "La categoria e le mansioni del titolare del tesserino", "Le parti del terminal ove il titolare del tesserino è autorizzato ad accedere"],
      answer: 0,
      image: "",
    },
{
      id: 552,
      category: "Esercitazione Categoria A5",
      text: "Le postazioni di controllo di sicurezza devono essere protette con barriere fisiche tali da impedirne l'accesso non autorizzato in ingresso e/o in uscita alle/dalle aree sterili/critiche:",
      options: ["Quando non sono operative", "Quando sono operative", "Durante le ore notturne"],
      answer: 0,
      image: "",
    },
{
      id: 553,
      category: "Esercitazione Categoria A5",
      text: "Cosa si intende per sorveglianza e pattugliamento:",
      options: ["Attività poste in essere con la finalità di impedire l'accesso di persone non autorizzate e l'introduzione di articoli proibiti in area sterile", "Attività poste in essere con la finalità di impedire l'accesso di persone autorizzate e l'introduzione di articoli proibiti in area sterile", "Attività poste in essere con la finalità di impedire l'accesso di persone non autorizzate e l'introduzione di articoli non proibiti in area sterile"],
      answer: 0,
      image: "",
    },
{
      id: 554,
      category: "Esercitazione Categoria A5",
      text: "La sorveglianza e pattugliamento vengono effettuati allo scopo di monitorare:",
      options: ["L'esibizione e la validità del lasciapassare quando i veicoli non si trovano nell'area lato volo", "L'esibizione e la validità del lasciapassare quando i veicoli si trovano nell'area lato città", "L'esibizione e la validità del lasciapassare quando i veicoli si trovano nell'area lato volo"],
      answer: 2,
      image: "",
    },
{
      id: 555,
      category: "Esercitazione Categoria A5",
      text: "I tesserini di ingresso in aeroporto di colore GIALLO permettono l'accesso:",
      options: ["In Airside", "In Landside", "Negli uffici degli operatori aeroportuali"],
      answer: 1,
      image: "",
    },
{
      id: 556,
      category: "Esercitazione Categoria A5",
      text: "Quale indicazione deve riportare il TIA per permettere all’operatore aeroportuale di accedere all’aeromobile:",
      options: ["Numero 3", "Numero 5 e 6", "Numero 2"],
      answer: 1,
      image: "",
    },
{
      id: 557,
      category: "Esercitazione Categoria A5",
      text: "Gli Istruttori certificati, limitatamente al trasporto in area sterile di articoli necessari per l'espletamento delle attività formative ed addestrative:",
      options: ["Non necessitano di particolari autorizzazioni", "Necessitano obbligatoriamente di autorizzazione da parte del Gestore Aeroportuale, nella persona del Security Manager", "Possono essere autorizzati"],
      answer: 2,
      image: "",
    },
{
      id: 558,
      category: "Esercitazione Categoria A5",
      text: "Se si presenta ad un varco staff un diplomatico munito del tesserino di ingresso in aeroporto in foto (banda colore ARANCIO) quali attività di security devono essere poste in essere nei confronti del titolare?",
      options: ["Viene esentato dai controlli di sicurezza", "Il tesserino rappresentato non è valido in quanto non sono identificate le aree in cui il diplomatico è autorizzato ad accedere", "Viene esentato dai controlli di sicurezza ma gli oggetti personali al seguito dello stesso sono sottoposti ai previsti controlli di sicurezza"],
      answer: 1,
      image: "/images/Tesserinoarancio.png",
    },
{
      id: 559,
      category: "Esercitazione Categoria A5",
      text: "Un'ispezione di sicurezza delle parti critiche di un aeroporto:",
      options: ["Garantisce con ragionevole sicurezza che non contengano articoli proibiti", "Garantisce con sicura ragionevolezza che non contengano articoli proibiti", "Garantisce con concreta certezza che non contengano articoli proibiti"],
      answer: 0,
      image: "",
    },
{
      id: 560,
      category: "Esercitazione Categoria A5",
      text: "Le porte utilizzate come uscite di emergenza, se non continuamente sorvegliate, devono essere dotate di:",
      options: ["Allarmi luminosi", "Allarmi sonori e/o visivi", "Allarmi visivi"],
      answer: 1,
      image: "",
    },
{
      id: 561,
      category: "Esercitazione Categoria A5",
      text: "La procedura della sorveglianza e pattugliamento deve prevedere anche:",
      options: ["Le attività di intervento e le modalità da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi", "Gli scopi di intervento e le attività da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi", "Le modalità di intervento e le azioni da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi"],
      answer: 2,
      image: "",
    },
{
      id: 562,
      category: "Esercitazione Categoria A5",
      text: "Quali tra i seguenti requisiti non è corretto?",
      options: ["Servitù da imporre alle aree adiacenti le recinzioni perimetrali minimo 4,5 metri", "Recinzione aeroportuale costruita in muratura", "Altezza della recinzione aeroportuale 2,5 metri"],
      answer: 0,
      image: "",
    },
{
      id: 563,
      category: "Esercitazione Categoria A5",
      text: "L'accesso in aeroporto, per acquisire conoscenza e familiarità con le aree lato volo è richiesto per:",
      options: ["Viaggio", "Lavoro", "Formazione"],
      answer: 2,
      image: "",
    },
{
      id: 564,
      category: "Esercitazione Categoria A5",
      text: "La valutazione del rischio per la determinazione della frequenza e le modalità per effettuare la sorveglianza e il pattugliamento è effettuata sulla base di:",
      options: ["Dimensioni e configurazione dell'aeroporto", "Possibilità e limiti delle modalità per effettuare la sorveglianza e il pattugliamento", "Entrambe le atre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 565,
      category: "Esercitazione Categoria A5",
      text: "Le persone diverse dai passeggeri e gli oggetti da esse trasportati all'ingresso delle aree sterili, sono controllate con le seguenti modalità:",
      options: ["Controllo di sicurezza (screening) al 25%", "Controllo di sicurezza (screening) al 50%", "Controllo di sicurezza (screening) al 100%"],
      answer: 0,
      image: "",
    },
{
      id: 566,
      category: "Esercitazione Categoria A5",
      text: "I lasciapassare elettronici per veicoli:",
      options: ["Devono poter essere letti elettronicamente anche nelle aree lato volo", "Devono poter essere letti elettronicamente solo ai punti di accesso", "Devono poter essere letti elettronicamente solo nelle aree lato volo"],
      answer: 0,
      image: "",
    },
{
      id: 567,
      category: "Esercitazione Categoria A5",
      text: "Le misure finalizzate ad impedire violazioni ai controlli di sicurezza:",
      options: ["Potrebbero essere attuate", "Possono essere attuate", "Devono essere attuate"],
      answer: 2,
      image: "",
    },
{
      id: 568,
      category: "Esercitazione Categoria A5",
      text: "La procedura di sorveglianza e pattugliamento deve essere approvata:",
      options: ["Dalla Direzione Aeroportuale competente congiuntamente al Ministero dell'Interno", "Dalla Direzione Aeroportuale ENAC competente", "Dalla Direzione Operazioni ENAC"],
      answer: 1,
      image: "",
    },
{
      id: 569,
      category: "Esercitazione Categoria A5",
      text: "Le parti critiche di un aeroporto devono comprendere almeno:",
      options: ["Tutte le parti di un aeroporto attraverso le quali il bagaglio da stiva in partenza già sottoposto a screening può transitare o nelle quali esso può essere conservato", "Tutte le parti di un aeroporto attraverso le quali il bagaglio da stiva in partenza non sottoposto a screening può transitare", "Tutte le parti di un aeroporto attraverso le quali il bagaglio da stiva in arrivo già sottoposto a screening può transitare o nelle quali esso può essere conservato"],
      answer: 0,
      image: "",
    },
{
      id: 570,
      category: "Esercitazione Categoria A5",
      text: "Per quanto concerne la cat. A5 dopo quanti anni è necessario effettuare la ricertificazione",
      options: ["3 anni", "5 anni", "1 anni"],
      answer: 1,
      image: "",
    },
{
      id: 571,
      category: "Esercitazione Categoria A5",
      text: "L'accesso all'area lato volo è autorizzato",
      options: ["Esclusivamente alle persone che hanno un motivo legittimo per entrare", "Esclusivamente ai veicoli che hanno un motivo legittimo per entrare", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 572,
      category: "Esercitazione Categoria A5",
      text: "Un sistema di telecamere a circuito chiuso (TVCC) può essere utilizzato esclusivamente per la sorveglianza?",
      options: ["Si, ma devono essere installate almeno 20 telecamere", "No", "Si"],
      answer: 1,
      image: "",
    },
{
      id: 573,
      category: "Esercitazione Categoria A5",
      text: "Per accedere alle aree trattamento dei bagagli da stiva, bisogna essere in possesso di un tesserino riportante il numero:",
      options: ["3", "7", "5"],
      answer: 0,
      image: "",
    },
{
      id: 574,
      category: "Esercitazione Categoria A5",
      text: "Cosa deve essere verificato dal servizio di sorveglianza e pattugliamento sui lasciapassare veicolari?",
      options: ["L’esposizione sul parabrezza del veicolo", "La corrispondenza con l’area in cui il dipendente si trova", "Tutte le risposte sono esatte"],
      answer: 2,
      image: "",
    },
{
      id: 575,
      category: "Esercitazione Categoria A5",
      text: "Il Gestore Aeroportuale deve assicurare la protezione, al fine di impedire l'accesso a persone non autorizzate e l'utilizzo in situazioni di emergenza, di:",
      options: ["Finestre che consentono l'accesso in airside", "Cancelli di ingresso e porte che consentono l'accesso alle aree sterili o di movimento", "Porte presenti in landside"],
      answer: 1,
      image: "",
    },
{
      id: 576,
      category: "Esercitazione Categoria A5",
      text: "La frequenza e le modalità per effettuare la sorveglianza e il pattugliamento devono essere approvate da:",
      options: ["Gestore aeroportuale", "Polizia di Frontiera", "ENAC"],
      answer: 2,
      image: "",
    },
{
      id: 577,
      category: "Esercitazione Categoria A5",
      text: "In quale appendice vengono indicati gli articoli proibiti che le persone diverse dai passeggeri non possono introdurre nelle parti critiche di un aeroporto?",
      options: ["Appendice 4-C", "Appendice 1-A", "Appendice 5-B"],
      answer: 1,
      image: "",
    },
{
      id: 578,
      category: "Esercitazione Categoria A5",
      text: "Una modalità accettabile, da utilizzare anche singolarmente, che dia una ragionevole sicurezza di individuare tentativi di utilizzo improprio di tesserini di ingresso in aeroporto smarriti, rubati o non restituiti, è il:",
      options: ["Sistema elettronico di lettura dei tesserini di ingresso in aeroporto", "Sistema telematico di lettura dei tesserini di ingresso in aeroporto", "Sistema elettronico di scrittura dei tesserini di ingresso in aeroporto"],
      answer: 0,
      image: "",
    },
{
      id: 579,
      category: "Esercitazione Categoria A5",
      text: "L'addetto ai controlli dovrà negare l'accesso in area sterile alle persone che trasportano con se uno o più articoli proibiti di cui all'Appendice 1-A del Reg. (UE) 1198/2015:",
      options: ["Se in possesso di autorizzazione", "Senza idonea autorizzazione", "Se privo della relativa autorizzazione"],
      answer: 2,
      image: "",
    },
{
      id: 580,
      category: "Esercitazione Categoria A5",
      text: "Cosa si intende per 'strade di accesso':",
      options: ["Le strade lungo il sedime aeroportuale", "Le strade adiacenti le aerostazioni", "Le strade adiacenti le recinzioni aeroportuali"],
      answer: 2,
      image: "",
    },
{
      id: 581,
      category: "Esercitazione Categoria A5",
      text: "La frequenza e le modalità per effettuare la sorveglianza ed il pattugliamento:",
      options: ["Devono essere approvate dall'Autorità competente", "Non devono essere approvate dall'Autorità competente", "Devono essere approvate dal Ministero dell'Interno"],
      answer: 0,
      image: "",
    },
{
      id: 582,
      category: "Esercitazione Categoria A5",
      text: "Al fine di impedire l'accesso non autorizzato alle aree sterili, i punti di accesso devono essere controllati da:",
      options: ["Un sistema elettronico che limita l'accesso a 2 persone per volta", "Un sistema elettronico che limita l'accesso a 1 persona per volta", "Un sistema elettronico che limita l'accesso a 3 persone per volta"],
      answer: 1,
      image: "",
    },
{
      id: 583,
      category: "Esercitazione Categoria A5",
      text: "Sulla base della valutazione del rischio il Gestore Aeroportuale deve predisporre una procedura che riporti:",
      options: ["Frequenza di effettuazione della sorveglianza e pattugliamento", "Modalità di effettuazione della sorveglianza e pattugliamento", "Modalità e frequenza della sorveglianza e pattugliamento"],
      answer: 2,
      image: "",
    },
{
      id: 584,
      category: "Esercitazione Categoria A5",
      text: "In tutte le aree sterili deve essere segnalato alle Forze dell'Ordine operanti in aeroporto la presenza di:",
      options: ["Persone che sono in aree per le quali sono autorizzate", "Persone che non espongono un tesserino di ingresso in aeroporto", "Persone che espongono un tesserino di ingresso in aeroporto"],
      answer: 1,
      image: "",
    },
{
      id: 585,
      category: "Esercitazione Categoria A5",
      text: "Chi gestisce operativamente il servizio di pattugliamento?",
      options: ["La Control Room del Gestore Aeroportuale", "La Sala Operativa della Polizia di Frontiera", "La Control Room dell’ENAC"],
      answer: 0,
      image: "",
    },
{
      id: 586,
      category: "Esercitazione Categoria A5",
      text: "La posta ed il materiale del vettore aereo presenti nelle parti critiche in attesa di essere caricati sono soggetti a monitoraggio per la sorveglianza ed il pattugliamento?",
      options: ["Si", "Si, ma solo da personale del vettore aereo", "No"],
      answer: 1,
      image: "",
    },
{
      id: 587,
      category: "Esercitazione Categoria A5",
      text: "La sorveglianza:",
      options: ["E' finalizzata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)", "Può essere limitata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)", "Non può essere limitata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)"],
      answer: 2,
      image: "",
    },
{
      id: 588,
      category: "Esercitazione Categoria A5",
      text: "Le immagini in diretta del sistema TVCC possono essere visionate:",
      options: ["Dalle Guardie Particolari Giurate e dalle forze di Polizia", "Solo dalle guardie Particolari Giurate", "Solo dalle Forze di Polizia"],
      answer: 0,
      image: "",
    },
{
      id: 589,
      category: "Esercitazione Categoria A5",
      text: "Un'ispezione di sicurezza delle parti sterili di un aeroporto che potrebbero essere state contaminate, deve essere realizzata immediatamente:",
      options: ["Dopo lo sbarco dei passeggeri", "Prima di ripristinare lo stato di un'area sterile", "Prima dell'imbarco dei passeggeri"],
      answer: 1,
      image: "",
    },
{
      id: 590,
      category: "Esercitazione Categoria A5",
      text: "L'addetto al controllo di sicurezza, prima che un veicolo sia autorizzato ad accedere alle aree sterili, deve, tra l'altro:",
      options: ["Controllare il lasciapassare per veicoli per accertarne con ragionevole sicurezza che sia valido nonché controllare la corrispondenza del titolo medesimo al veicolo", "Verificare che sia in possesso di un lasciapassare che abilita all‘accesso alle aree sterili", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 591,
      category: "Esercitazione Categoria A5",
      text: "Il servizio di sorveglianza e pattugliamento:",
      options: ["Viene effettuato armato", "Può essere effettuato armato", "Non può essere effettuato armato"],
      answer: 1,
      image: "",
    },
{
      id: 592,
      category: "Esercitazione Categoria A5",
      text: "Quali tra i seguenti articoli sono considerati proibiti per gli operatori aeroportuali?",
      options: ["Strumenti di lavoro", "Quelli indicati nella lista dell'Appendice 1-A", "Nessuna delle altre risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 593,
      category: "Esercitazione Categoria A5",
      text: "In ogni aeroporto devono essere chiaramente identificabili i confini tra:",
      options: ["Aree lato terra ed aree lato volo", "Aree sterili e parti critiche", "Aree lato terra, aree lato volo, aree sterili, parti critiche e, se del caso, aree delimitate"],
      answer: 2,
      image: "",
    },
{
      id: 594,
      category: "Esercitazione Categoria A5",
      text: "In caso di operatore che stia introducendo un articolo proibito senza la prevista autorizzazione:",
      options: ["L'addetto ne deve impedire l'accesso", "L'addetto ne deve impedire l'accesso informando tempestivamente il personale della Polizia/GdF e successivamente il Security Manager dell'aeroporto", "L'addetto ne deve impedire l'accesso informando tempestivamente il personale della Polizia/GdF"],
      answer: 1,
      image: "",
    },
{
      id: 595,
      category: "Esercitazione Categoria A5",
      text: "Quale delle seguenti affermazioni è esatta?",
      options: ["La sorveglianza non può essere limitata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)", "La sorveglianza deve essere limitata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)", "La sorveglianza può essere limitata all'utilizzo esclusivo di un sistema di telecamere a circuito chiuso (TVCC)"],
      answer: 0,
      image: "",
    },
{
      id: 596,
      category: "Esercitazione Categoria A5",
      text: "La sorveglianza e il pattugliamento vengono effettuati, tra l'altro, allo scopo di monitorare:",
      options: ["Aree accessibili al pubblico appartenenti o vicine all'aerostazione, incluse le aree di parcheggio e le strade di accesso", "I confini tra le aree lato terra, aree lato volo, aree sterili, parti critiche e, se del caso, aree delimitate", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 597,
      category: "Esercitazione Categoria A5",
      text: "Se ad un varco di accesso all'area critica si presenta un operatore con il tesserino rappresentato in foto (banda colore ROSSO) quali attività di security occorre porre in essere?",
      options: ["L'operatore viene sottoposto a speciali procedure di controllo", "L'operatore viene fermato e vengono immediatamente informate le Forze dell'Ordine", "L'operatore viene sottoposto ai previsti controlli di sicurezza"],
      answer: 1,
      image: "/images/Tesserinorosso3.png",
    },
{
      id: 598,
      category: "Esercitazione Categoria A5",
      text: "Quali tra i seguenti elementi NON è previsto sia contenuto nel lasciapassare per veicoli?",
      options: ["L’ente/società a cui appartiene il veicolo", "Le aree dove il veicolo può circolare", "Il numero della patente del conducente"],
      answer: 2,
      image: "",
    },
{
      id: 599,
      category: "Esercitazione Categoria A5",
      text: "Il Gestore effettua la valutazione del rischio tenendo conto delle informazioni fornite:",
      options: ["Dalla Polizia di Stato", "Dall'ENAC", "Dal Ministero delle Infrastrutture e dei Trasporti"],
      answer: 0,
      image: "",
    },
{
      id: 600,
      category: "Esercitazione Categoria A5",
      text: "Che tipologia di controllo deve essere effettuato sul personale delle Agenzie delle Dogane in servizio operativo aeroportuale che svolge con continuità attività di contrasto al traffico di stupefacenti e facenti parte di apposito elenco?",
      options: ["Nessuno, i funzionari delle Agenzie delle Dogane sono sempre esenti", "I funzionari delle Agenzie delle Dogane devono essere sottoposti a screening sia sulla persona che sugli oggetti al seguito", "I funzionari delle Agenzie delle Dogane sono esentati dallo screening sulla persona ma devono essere sottoposti a controllo gli oggetti al seguito anche se personali"],
      answer: 2,
      image: "",
    },
{
      id: 601,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto deve essere esposto in maniera ben visibile:",
      options: ["In tutte le aree dell'aeroporto", "Solo nelle parti critiche", "Solo nelle aree sterili"],
      answer: 0,
      image: "",
    },
{
      id: 602,
      category: "Esercitazione Categoria A5",
      text: "Dopo quanti anni il personale armato che svolge attività di sorveglianza e pattugliamento deve essere sottoposto a nuova certificazione?",
      options: ["5 anni", "1 anno", "3 anni"],
      answer: 0,
      image: "",
    },
{
      id: 603,
      category: "Esercitazione Categoria A5",
      text: "Quale attività di security occorre porre in essere prima di autorizzare l'acceso in area critica alla persona titolare del tesserino di ingresso in aeroporto rappresentato in foto (banda colore ROSSO)?",
      options: ["La persona è esente da qualsiasi attività di security come riportato sul tesserino", "La persona è esente dai controlli di sicurezza, gli oggetti da essa trasportati sono sottoposti a controllo radiogeno", "La persona viene fermata impedendone l'accesso in area critica e viene immediatamente richiesto l'intervento delle Forze di Polizia in quanto il tesserino rappresentato non esiste"],
      answer: 2,
      image: "/images/Tesserinorosso2Esente.png",
    },
{
      id: 604,
      category: "Esercitazione Categoria A5",
      text: "Nel caso in cui una persona diversa dai passeggeri si rifiuta di sottoporsi a controllo di sicurezza prima di accedere in area sterile:",
      options: ["Deve essere immediatamente informato il Security Manager dell’aeroporto", "Deve essere immediatamente informata la Polizia di Frontiera", "Deve essere immediatamente informata la Direzione Territoriale Enac"],
      answer: 1,
      image: "",
    },
{
      id: 605,
      category: "Esercitazione Categoria A5",
      text: "Per accedere agli aeromobili ed alle loro adiacenze, bisogna essere in possesso di un tesserino d'ingresso in aeroporto riportante il numero:",
      options: ["2", "7", "5"],
      answer: 1,
      image: "",
    },
{
      id: 606,
      category: "Esercitazione Categoria A5",
      text: "Un lasciapassare per veicolo deve essere esposto in modo visibile e per tutto il periodo in cui il veicolo si trova:",
      options: ["Nelle aree del sedime aeroportuale", "Nell'area landside dell'aeroporto", "Nelle aree sterili dell'aeroporto"],
      answer: 2,
      image: "",
    },
{
      id: 607,
      category: "Esercitazione Categoria A5",
      text: "Quali autorizzazioni sono riconosciute dall'ENAC come valido titolo di accesso in area sterile?",
      options: ["Tesserino di ingresso in aeroporto, tesserino identificativo di membro di equipaggio dell'UE, tesserino multiservizi rilasciato dall'ENAC", "Tesserino di ingresso in aeroporto, tesserino multiservizi con banda laterale rossa rilasciato dall'ENAC al personale avente compiti ispettivi, tesserino identificativo di membro di equipaggio dell'UE, tessera di riconoscimento rilasciata dall'ANSV", "Tesserino di ingresso in aeroporto, tesserino multiservizi con banda laterale rossa rilasciato dall'ENAC al personale avente compiti ispettivi, tesserino identificativo di membro di equipaggio dell'UE"],
      answer: 1,
      image: "",
    },
{
      id: 608,
      category: "Esercitazione Categoria A5",
      text: "Quale soggetto è responsabile dell'effettuazione ed è preposto all'attività di sorveglianza e pattugliamento?",
      options: ["Gestore aeroportuale", "ENAC", "Polizia di Frontiera"],
      answer: 0,
      image: "",
    },
{
      id: 609,
      category: "Esercitazione Categoria A5",
      text: "Qual è la durata massima che può avere un TIA?",
      options: ["1 anno", "3 anni", "5 anni"],
      answer: 1,
      image: "",
    },
{
      id: 610,
      category: "Esercitazione Categoria A5",
      text: "A quali controlli di sicurezza deve essere sottoposto il titolare del tesserino di ingresso in aeroporto rappresentato in foto (banda colore AZZURRO) prima di essere autorizzato ad accedere in area critica?",
      options: ["E' soggetto a speciali procedure di controllo", "E' soggetto alle previste procedure di controllo riservate alle persone diverse dai passeggeri", "E' esentato dai controlli di sicurezza"],
      answer: 1,
      image: "/images/Tesserinoblu2.png",
    },
{
      id: 611,
      category: "Esercitazione Categoria A5",
      text: "I tesserini identificativi di membro dell'equipaggio e di ingresso in aeroporto vengono rilasciati per un periodo non superiore a:",
      options: ["7 anni", "3 anni", "5 anni"],
      answer: 2,
      image: "",
    },
{
      id: 612,
      category: "Esercitazione Categoria A5",
      text: "Ad un veicolo targato può essere applicata l'esenzione dai requisiti dei lasciapassare per veicoli, a condizione che esso venga:",
      options: ["Scortato ogni volta che si trovi nell'area lato volo", "Segnalato ogni volta che si trovi nell'area lato volo", "Sigillato ogni volta che si trovi nell'area lato volo"],
      answer: 0,
      image: "",
    },
{
      id: 613,
      category: "Esercitazione Categoria A5",
      text: "In aeroporto, il numero dei punti di accesso alle aree sterili/critiche deve:",
      options: ["Essere massimizzato", "Essere regolato in base alle esigenze", "Essere ridotto al minimo garantendo comunque il rispetto delle tempistiche delle operazioni aeroportuali"],
      answer: 2,
      image: "",
    },
{
      id: 614,
      category: "Esercitazione Categoria A5",
      text: "Il Gestore Aeroportuale, ricevuta l'informativa del furto o smarrimento del tesserino di ingresso in aeroporto, immediatamente deve:",
      options: ["Cancellare il tesserino da tutti i registri", "Emettere nuovo tesserino", "Disattivare il tesserino"],
      answer: 2,
      image: "",
    },
{
      id: 615,
      category: "Esercitazione Categoria A5",
      text: "Quali sono i colori che possono essere inseriti sui tesserini di ingresso in aeroporto?",
      options: ["Rosso, Verde, Arancione, Azzurro, Giallo, Bianco", "Rosso, Verde, Arancione, Azzurro, Viola, Giallo, Bianco", " Rosso, Verde, Arancione, Bianco, Azzurro"],
      answer: 0,
      image: "",
    },
{
      id: 616,
      category: "Esercitazione Categoria A5",
      text: "Il lasciapassare per veicoli:",
      options: ["Deve essere esposto in modo visibile almeno all'atto dell'accesso alle aree sterili dell'aeroporto", "Deve essere esposto in modo visibile e per tutto il periodo in cui il veicolo si trova nelle aree sterili dell'aeroporto", "Nessuna delle altre due risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 617,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto con la banda  colore VERDE a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo esterno e piazzali", "Lato volo esterno ed accessi interni, aeromobili e loro adiacenze", "Lato volo interno, aree aeromobili e loro adiacenze"],
      answer: 1,
      image: "",
    },
{
      id: 618,
      category: "Esercitazione Categoria A5",
      text: "Cosa deve essere verificato dal servizio di sorveglianza e pattugliamento sui tesserini aeroportuali?",
      options: ["L’esposizione sull’indumento piu esterno", "La corrispondenza con l’area in cui il dipendente si trova", "Tutte le risposte sono esatte"],
      answer: 2,
      image: "",
    },
{
      id: 619,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto riportante il colore Rosso consente l'accesso:",
      options: ["A tutte le aree", "Alle aree lato volo esterne ed agli accessi interni", "Alle sole aree lato volo interne"],
      answer: 0,
      image: "",
    },
{
      id: 620,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto deve sempre riportare:",
      options: ["Il nome e la fotografia del titolare, il nome del soggetto che lo ha rilasciato, le aree in cui è consentito l'accesso, il nome del datore di lavoro, la data di scadenza, a meno che questi ultimi non siano programmati elettronicamente", " Il nome del datore di lavoro, a meno che non sia programmato elettronicamente, la data di scadenza, a meno che non sia programmata elettronicamente, il timbro e la firma digitalizzata del Direttore Aeroportuale", "Il nome e la fotografia del titolare, il timbro e la firma digitalizzata del Direttore Aeroportuale"],
      answer: 0,
      image: "",
    },
{
      id: 621,
      category: "Esercitazione Categoria A5",
      text: "Se un operatore aeroportuale si rifiuta di esibire il TIA, tale violazione deve essere subito contestata e trasmessa:",
      options: ["All’ufficio di polizia di Frontiera dell’aeroporto in questione", "Alla Direzione Territoriale Enac del luogo dove è stata commessa l’infrazione", "All’ufficio rilascio pass per la revoca del TIA"],
      answer: 1,
      image: "",
    },
{
      id: 622,
      category: "Esercitazione Categoria A5",
      text: "Il personale del Gestore Aeroportuale addetto alla sorveglianza e pattugliamento, può effettuare il servizio:",
      options: ["Armato", "Non armato", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 623,
      category: "Esercitazione Categoria A5",
      text: "I membri dell'equipaggio, diversi da quelli in possesso di un tesserino di ingresso in aeroporto valido, vengono scortati ogni volta si trovino in aree sterili diverse da:",
      options: ["Aree situate nelle immediate vicinanze degli aeromobili con il quale sono arrivati o partiranno", "Aree destinate solo agli equipaggi", "Aree dove possono sostare solo i passeggeri"],
      answer: 0,
      image: "",
    },
{
      id: 624,
      category: "Esercitazione Categoria A5",
      text: "Il personale addetto al controllo, prima che un passeggero sia autorizzato ad accedere ai controlli di sicurezza e, successivamente, alle aree sterili, deve:",
      options: ["Controllare il tesserino aeroportuale per accertarne con ragionevole sicurezza che sia valido", "Controllare la carta d'imbarco/documento equivalente per accertarne con ragionevole sicurezza che sia valida", "Verificare che sia in possesso di una carta d'imbarco/documento equivalente o tessera sanitaria"],
      answer: 1,
      image: "",
    },
{
      id: 625,
      category: "Esercitazione Categoria A5",
      text: "Il controllo dei titoli che abilitano le persone all'accesso può essere effettuato:",
      options: ["Mediante un sistema biometrico che limita l'accesso ad una persona per volta", "Mediante un sistema elettronico (lettore di badge con PIN) che limita l'accesso ad una persona per volta", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 626,
      category: "Esercitazione Categoria A5",
      text: "Un lasciapassare per veicoli può essere rilasciato:",
      options: ["A qualunque soggetto ne faccia richiesta", "Solo quando è stata accertata una necessità operativa", "Nessuna delle altre risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 627,
      category: "Esercitazione Categoria A5",
      text: "Il Gestore Aeroportuale è:",
      options: ["Responsabile dell'effettuazione e preposto all'attività di sorveglianza e pattugliamento", "Corresponsabile dell'effettuazione ed addetto all'attività di sorveglianza e pattugliamento", "Corresponsabile dell'effettuazione e preposto all'attività di sorveglianza e pattugliamento"],
      answer: 0,
      image: "",
    },
{
      id: 628,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto con la banda colore GIALLO a quali aree autorizza l'accesso?",
      options: ["Aree merci e piazzali aeromobili", "Sale partenze, aree merci e piazzali", "Tale combinazione di colore e numeri non è prevista"],
      answer: 2,
      image: "",
    },
{
      id: 629,
      category: "Esercitazione Categoria A5",
      text: "In caso di rinvenimento di articoli proibiti rispetto ai quali il personale non è in possesso di specifica autorizzazione, l'addetto al controllo:",
      options: ["Dovrà impedire alla persona l'accesso alle aree sterili", "Dovrà impedire alla persona l'uscita dalle aree sterili", "Dovrà consentire alla persona l'accesso alle aree sterili"],
      answer: 0,
      image: "",
    },
{
      id: 630,
      category: "Esercitazione Categoria A5",
      text: "I mezzi speciali in uso in Airside non hanno bisogno di lasciapassare:",
      options: ["Falso", "Vero", "Sono soggetti a specifica normativa"],
      answer: 1,
      image: "",
    },
{
      id: 631,
      category: "Esercitazione Categoria A5",
      text: "Chi è il soggetto responsabile del servizio di sorveglianza e pattugliamento?",
      options: ["Polizia", "ENAC", "Società di Gestione"],
      answer: 2,
      image: "",
    },
{
      id: 632,
      category: "Esercitazione Categoria A5",
      text: "Le aree sterili devono comprendere almeno:",
      options: ["Entrambe le altre risposte sono corrette", "Una parte di un aeroporto destinata al parcheggio degli aeromobili sui quali effettuare l'imbarco od il carico dell'aeromobile", "Una parte di un aeroporto alla quale hanno accesso i passeggeri in partenza già sottoposti a screening"],
      answer: 0,
      image: "",
    },
{
      id: 633,
      category: "Esercitazione Categoria A5",
      text: "La tessera di riconoscimento rilasciata dall'Agenzia Nazionale per la sicurezza del volo (ANSV) è riconosciuta dall'ENAC come:",
      options: ["Documento non valido per l'accesso", "Documento multiservizi", "Documento valido di accesso"],
      answer: 2,
      image: "",
    },
{
      id: 634,
      category: "Esercitazione Categoria A5",
      text: "Per essere autorizzata ad accedere alle aree sterili, una persona deve esibire:",
      options: ["Un passaporto", "Un valido biglietto di viaggio e/o carta di imbarco", "Una carta d'identità"],
      answer: 1,
      image: "",
    },
{
      id: 635,
      category: "Esercitazione Categoria A5",
      text: "La presenza di oggetti e bagagli lasciati incustoditi ed abbandonati in un terminal, deve essere segnalata:",
      options: ["All'impresa di sicurezza", "Al gestore aeroportuale", "Alle Forze dell'Ordine"],
      answer: 2,
      image: "",
    },
{
      id: 636,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto con la banda colore AZZURRO a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo interno, area interna o aree delle parti critiche, aree merci", "Tutte le aree", "Lato volo interno, accessi esterni ed aree di trattamento bagagli"],
      answer: 0,
      image: "",
    },
{
      id: 637,
      category: "Esercitazione Categoria A5",
      text: "Se si presenta ad un varco di controllo per accedere in area critica una persona munita del tesserino di ingresso in aeroporto rappresentato in foto, accompagnato / scortato da personale dell'ENAC titolare di regolare tesserino di ingresso in aeroporto in corso di validità, quali attività di security occorre porre in essere prima di consentire l'accesso in area critica?",
      options: ["La persona è sottoposta ai previsti controlli di sicurezza per le persone diverse dai passeggeri", "La persona viene fermata in quanto tale tesserino non esiste", "La persona è esentata dai controlli di sicurezza, in quanto svolge attività di Ispettore security di ENAC"],
      answer: 1,
      image: "/images/Tesserinovisitatoresenzascorta.png",
    },
{
      id: 638,
      category: "Esercitazione Categoria A5",
      text: "Se si presenta ad un varco di controllo per accedere in area critica una persona munita del tesserino di ingresso in aeroporto rappresentato in foto, accompagnato / scortato da personale del Cerimoniale di Stato titolare di regolare tesserino di ingresso in aeroporto in corso di validità, quali attività di security occorre porre in essere prima di consentire l'accesso in area critica?",
      options: ["Vengono eseguite le previste verifiche documentali ed effettuati i controlli di sicurezza previsti per le persone diverse dai passeggeri, espletati i quali si autorizza l'ingresso in area critica", "Sono previste speciali procedure di controllo sotto la diretta supervisione delle Forze di Polizia", "Nessun controllo in quanto tale tesserino viene rilasciato dal Cerimoniale di Stato solo agli ambasciatori degli Stati esteri accreditati dallo Stato italiano"],
      answer: 0,
      image: "/images/Tesserinovisitatore.png",
    },
{
      id: 639,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore GRIGIO) a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo interno, aree trattamento bagagli ed aree merci", "Lato volo esterno, accessi interni, aree trattamento bagagli ed aree merci", "Tale tipologia di tesserino di ingresso in aeroporto non esiste"],
      answer: 2,
      image: "/images/Tesserinogrigio234.png",
    },
{
      id: 640,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore VERDE) a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo esterno e piazzali", "Lato volo esterno ed accessi interni, aeromobili e loro adiacenze", "Lato volo interno, aree aeromobili e loro adiacenze"],
      answer: 1,
      image: "/images/Tesserinoverde256.png",
    },
{
      id: 641,
      category: "Esercitazione Categoria A5",
      text: "Se si presenta una persona munita del tesserino di ingresso in aeroporto rappresentato in foto, accompagnata / scortata dal personale riportato sul retro del tesserino, richiedendo di poter accedere in area critica, può essere autorizzato l'accesso?",
      options: ["Si, dopo aver effettuato sullo stesso e sul personale accompagnatore i previsti controlli di sicurezza", "Si, dopo aver effettuato le verifiche sulla titolarità e sulla validità del titolo presentato e dopo aver effettuato i controlli di sicurezza previsti per le persone diverse dai passeggeri", "No, non si autorizza l'accesso al visitatore ed all'accompagnatore; viene immediatamente richiesta la presenza delle Forze di Polizia in quanto il tesserino non riporta sul fronte il numero di documento d'identità del titolare"],
      answer: 2,
      image: "/images/Tesserinovisitatoresenzadoc.png",
    },
{
      id: 642,
      category: "Esercitazione Categoria A5",
      text: "Qualora il tesserino identificativo di membro dell'equipaggio non riporti la fotografia del titolare, l'accesso è consentito:",
      options: ["Solo previa presentazione di un passaporto/documento d'identità valido", "Esibendo anche il tesserino aeroportuale", "Solo previa verifica biometrica"],
      answer: 0,
      image: "",
    },
{
      id: 643,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore GIALLO) a quali aree autorizza l'accesso?",
      options: ["Sale partenze, aree merci e piazzali", "Aree merci e piazzali aeromobili", "Tale combinazione di colore e numeri non è prevista"],
      answer: 2,
      image: "/images/Tesserinogiallo346.png",
    },
{
      id: 644,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore VERDE) a quali parti critiche delle aree sterili autorizza l'accesso?",
      options: ["Lato volo esterno, accessi interni e piazzali", "Lato volo interno, aree aeromobili e loro adiacenze", "Lato volo interno e piazzali"],
      answer: 0,
      image: "/images/Tesserinoverde26.png",
    },
{
      id: 645,
      category: "Esercitazione Categoria A5",
      text: " Il titolare del tesserino di ingresso in aeroporto rappresentato in foto (banda colore ROSSO) che si presenta al varco di controllo per accedere in area critica a quali controlli di sicurezza viene sottoposto?",
      options: ["E' esentato dai controlli di sicurezza", "Viene sottoposto ai controlli di sicurezza previsti per le persone diverse dai passeggeri", "E' soggetto a speciali procedure di controllo"],
      answer: 1,
      image: "/images/Tesserinorosso1.png",
    },
{
      id: 646,
      category: "Esercitazione Categoria A5",
      text: "Quando si presenta ad un varco di accesso in area sterile un operatore con il tesserino di ingresso in aeroporto rappresentato in foto (banda colore VERDE) quali attività di security occorre porre in essere?",
      options: ["L'operatore è sottoposto a particolari procedure di controllo", "L'operatore è esentato dai controlli di sicurezza", "Viene controllato solo l'articolo da esso trasportato (App. 1-A: A)"],
      answer: 0,
      image: "/images/Tesserinoverde568App1A.png",
    },
{
      id: 647,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino di ingresso in aeroporto rappresentato in foto (banda colore AZZURRO) a quali aree autorizza l'accesso?",
      options: ["Aeromobili e loro adiacenze", "Lato volo interno e piazzali aeromobili", "Tale combinazione di colore e numero non esiste"],
      answer: 2,
      image: "/images/Tesserinoblu256.png",
    },
{
      id: 648,
      category: "Esercitazione Categoria A5",
      text: "Il servizio di sorveglianza e pattugliamento può essere assicurato con il concorso delle Forze di Polizia?",
      options: ["Solo in caso di esigenze particolari e previo accordo tra le parti", "Si, sempre", "No, mai"],
      answer: 0,
      image: "",
    },
{
      id: 649,
      category: "Esercitazione Categoria A5",
      text: "Per consentire il riconcilio della persona autorizzata a trasportare uno o più articoli elencati nell'Appendice 1-A con l'articolo trasportato:",
      options: ["Nel punto di controllo di sicurezza deve essere in funzione un sistema indicante quali persone non sono autorizzate a trasportare determinati articoli e riportante la categoria o l'articolo specifico", "Nel punto di controllo di sicurezza deve essere in funzione un sistema indicante quali persone sono autorizzate a trasportare determinati articoli e riportante la categoria o l'articolo specifico", "Nel punto di controllo di sicurezza deve essere in funzione un sistema indicante quali persone sono autorizzate a trasportare determinati articoli senza indicare la categoria o l'articolo specifico"],
      answer: 1,
      image: "",
    },
{
      id: 650,
      category: "Esercitazione Categoria A5",
      text: "Qualora persone non autorizzate possano aver avuto accesso ad aree sterili, si procede:",
      options: ["Con lo sgombero delle parti che potrebbero essere state contaminate", "Con la sigillatura delle parti che potrebbero essere state contaminate", "Con un'ispezione di sicurezza delle parti che potrebbero essere state contaminate"],
      answer: 2,
      image: "",
    },
{
      id: 651,
      category: "Esercitazione Categoria A5",
      text: "Il personale addetto all'attività di sorveglianza e pattugliamento:",
      options: ["Deve essere in possesso di titolo di Guardia Particolare Giurata e può effettuare il servizio armato", "Deve essere in possesso di titolo di Guardia Particolare Giurata e deve effettuare il servizio armato", "Non necessita di titolo di Guardia Particolare Giurata e può effettuare il servizio armato"],
      answer: 0,
      image: "",
    },
{
      id: 652,
      category: "Esercitazione Categoria A5",
      text: "I tesserini di colore VERDE, permettono l'accesso:",
      options: ["Alle aree non sterili", "Alle aree lato volo interno", "Alle aree lato volo esterno ed accessi interni"],
      answer: 2,
      image: "",
    },
{
      id: 653,
      category: "Esercitazione Categoria A5",
      text: "In ogni postazione di controllo per operatori aeroportuali ed equipaggio, deve essere garantita:",
      options: ["La presenza di n.ro 4 unità", "La presenza contemporanea di almeno 2 unità", "La presenza contemporanea di almeno 3 unità"],
      answer: 1,
      image: "",
    },
{
      id: 654,
      category: "Esercitazione Categoria A5",
      text: "Il personale addetto alla sorveglianza e pattugliamento, deve avere la qualifica di:",
      options: ["Portiere", "Guardia Giurata", "Guardia Particolare Giurata"],
      answer: 2,
      image: "",
    },
{
      id: 655,
      category: "Esercitazione Categoria A5",
      text: "Previa valutazione del rischio, fermo restando quanto indicato in relazione alla corrispondenza di genere per i controlli di sicurezza manuali sullo staff, il presidio può essere ridotto a:",
      options: ["Nr.o 1 unità", "Nr.o 2 unità", "Nr.o 3 unità"],
      answer: 0,
      image: "",
    },
{
      id: 656,
      category: "Esercitazione Categoria A5",
      text: "La frequenza e le modalità per effettuare la sorveglianza ed il pattugliamento si basano:",
      options: ["Su una valutazione della situazione geopolitica", "Su una valutazione dei servizi di Intelligence", "Su una valutazione del rischio"],
      answer: 2,
      image: "",
    },
{
      id: 657,
      category: "Esercitazione Categoria A5",
      text: "In caso di operatore aeroportuale che si rifiuti di sottoporsi ai controlli dell'accesso:",
      options: ["L'addetto ne deve impedire l'accesso", "L'addetto ne deve impedire l'accesso informando tempestivamente il personale della Polizia ed il vettore", "L'addetto ne deve impedire l'accesso informando tempestivamente il personale della Polizia ed il Security Manager"],
      answer: 2,
      image: "",
    },
{
      id: 658,
      category: "Esercitazione Categoria A5",
      text: "Il confine tra area lato terra ed area lato volo, consiste in:",
      options: ["Un ostacolo visibile", "Un ostacolo fisico che sia chiaramente visibile", "Un ostacolo fisico"],
      answer: 1,
      image: "",
    },
{
      id: 659,
      category: "Esercitazione Categoria A5",
      text: "L'accesso in area sterile può essere autorizzato se l'accertamento dell'identità è avvenuto:",
      options: ["Mediante verifica dei dati biometrici", "Mediante autorizzazione vocale", "Mediante autorizzazione telemetrica"],
      answer: 0,
      image: "",
    },
{
      id: 660,
      category: "Esercitazione Categoria A5",
      text: "L'attività di sorveglianza e pattugliamento:",
      options: ["Deve seguire un modello prevedibile", "Non deve seguire un modello prevedibile", "Non deve seguire un modello statistico"],
      answer: 1,
      image: "",
    },
{
      id: 661,
      category: "Esercitazione Categoria A5",
      text: "Nel caso di rinvenimento di un arma da fuoco durante un controllo presso il varco dedicato a persone diverse dai passeggeri è richiesto l'intervento immediato:",
      options: ["Di personale delle Forze di Polizia", "Di un Supervisore", "Di personale della Direzione Aeroportuale"],
      answer: 0,
      image: "",
    },
{
      id: 662,
      category: "Esercitazione Categoria A5",
      text: "Il titolare del tesserino di ingresso in aeroporto con la banda colore ROSSO che si presenta al varco di controllo per accedere in area critica a quali controlli di sicurezza viene sottoposto?",
      options: ["E' soggetto a speciali procedure di controllo", "E' esentato dai controlli di sicurezza", "Viene sottoposto ai controlli di sicurezza previsti per le persone diverse dai passeggeri"],
      answer: 2,
      image: "",
    },
{
      id: 663,
      category: "Esercitazione Categoria A5",
      text: "Il tesserino d'ingresso in aeroporto, deve essere esposto dal titolare:",
      options: ["Nell'apposito porta tesserino", "In modo visibile", "Sulla giacca dell'uniforme"],
      answer: 1,
      image: "",
    },
{
      id: 664,
      category: "Esercitazione Categoria A5",
      text: "In caso di rinvenimento di un articolo proibito l'addetto alla sicurezza dovrà redigere apposito rapporto informativo da trasmettere immediatamente:",
      options: ["Al Safety Manager", "Al Security Manager", "Alla Direzione Aeroportuale"],
      answer: 1,
      image: "",
    },
{
      id: 665,
      category: "Esercitazione Categoria A5",
      text: "Quale delle seguenti affermazioni è corretta?",
      options: ["La procedura della sorveglianza e pattugliamento deve prevedere anche le attivtà di intervento e le modalità da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi", "La procedura della sorveglianza e pattugliamento deve prevedere anche gli scopi di intervento e le attività da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi", "La procedura della sorveglianza e pattugliamento deve prevedere anche le modalità di intervento e le azioni da intraprendere immediatamente nel caso si verifichi una violazione dei sistemi posti a protezione degli accessi"],
      answer: 2,
      image: "",
    },
{
      id: 666,
      category: "Esercitazione Categoria A5",
      text: "Quali attività di security occorre porre in essere prima di consentire l'accesso in area critica al titolare del tesserino di ingresso in aeroporto rappresentato in foto?",
      options: ["Verifica della titolarità del portatore del tesserino e controlli di sicurezza previsti", "Verifica della validità del tesserino, verifica della titolarità del portatore, verifica della presenza del personale addetto alla scorta riportato e previsti controlli di sicurezza", "Verifica della titolarità, validità del tesserino e previsti controlli di sicurezza"],
      answer: 1,
      image: "/images/Tesserinovisitatore.png",
    },
{
      id: 667,
      category: "Esercitazione Categoria A5",
      text: "Per 'documento di approvazione valido dell'Autorità Nazionale Competente' si intende:",
      options: ["Il tesserino multiservizi con banda laterale BLU rilasciato dall'ENAC al personale che svolge compiti ispettivi", "Il tesserino multiservizi con banda laterale ROSSA rilasciato dall'ENAC al personale che svolge compiti ispettivi", "Il tesserino multiservizi con banda laterale VERDE rilasciato dall'ENAC al personale che svolge compiti ispettivi"],
      answer: 1,
      image: "",
    },
{
      id: 668,
      category: "Esercitazione Categoria A5",
      text: "La persona che necessita di scorta deve essere in possesso di un tesserino:",
      options: ["Visitatore", "Ospite", "Giornaliero"],
      answer: 0,
      image: "",
    },
{
      id: 669,
      category: "Esercitazione Categoria A5",
      text: "Per entrare alle strade di accesso lungo la recinzione perimetrale, bisogna essere in possesso di un tesserino di ingresso in aeroporto di colore:",
      options: ["Rosso e verde", "Rosso", "Rosso 1 o verde riportante il numero 6"],
      answer: 2,
      image: "",
    },
{
      id: 670,
      category: "Esercitazione Categoria A5",
      text: "In caso di rinvenimento di un articolo proibito, l'addetto alla sicurezza dovrà:",
      options: ["Redigere apposito rapporto informativo", "Redigere apposita Security Notice", "Redigere apposita Safety Notice"],
      answer: 0,
      image: "",
    },
{
      id: 671,
      category: "Esercitazione Categoria A5",
      text: "Il lasciapassare per veicoli:",
      options: ["Viene rilasciato specificamente per un determinato veicolo", "Riporta solamente le aree alle quali è autorizzato ad accedere", "Nessuna delle altre risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 672,
      category: "Esercitazione Categoria A5",
      text: "Quali sono gli obiettivi principali del servizio di sorveglianza e pattugliamento?",
      options: ["Monitorare i confini aeroportuali", "Monitorare gli obiettivi sensibili individuati dall’analisi dei rischi", "Tutte le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 673,
      category: "Esercitazione Categoria A5",
      text: "Un tesserino di ingresso in aeroporto reca:",
      options: ["Le aree alle quali il titolare non è autorizzato ad accedere", "La data di scadenza, a meno che non sia programmata elettronicamente", "La data di rilascio, a meno che non sia programmata elettronicamente"],
      answer: 1,
      image: "",
    },
{
      id: 674,
      category: "Esercitazione Categoria A5",
      text: "Cosa si intende per sorveglianza e pattugliamento:",
      options: [" Attività poste in essere con la finalità di impedire l'accesso di persone non autorizzate e l'introduzione di articoli proibiti in area sterile", "Attività poste in essere con la finalità di impedire l'accesso di persone non autorizzate e l'introduzione di articoli non proibiti in area sterile", "Attività poste in essere con la finalità di impedire l'accesso di persone autorizzate e l'introduzione di articoli proibiti in area sterile"],
      answer: 0,
      image: "",
    },
{
      id: 675,
      category: "Esercitazione Categoria A5",
      text: "Tra i motivi legittimi per accedere alle aree sterili, vi sono:",
      options: ["Le visite guidate dell'aeroporto con scorta non armata", "Le visite guidate dell'aeroporto senza scorta", "Le visite guidate dell'aeroporto scortate da persone autorizzate"],
      answer: 2,
      image: "",
    },
{
      id: 800,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Ha un certificato medico per questi medicinali?'",
      options: ["Do You have any description for these medicines?", "Do You have any prescription for these medicines?", "Do You have any information for these medicines?"],
      answer: 1,
      image: "",
    },
{
      id: 801,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Cappello/Copricapo'?",
      options: ["Hat/Cap/Headgear", "Jacket/Belt/Scarf", "Belt/Scarf/Gloves"],
      answer: 0,
      image: "",
    },
{
      id: 802,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Forbici'?",
      options: ["Razor blade", "Pocket knife/Swiss knife", "Scissors"],
      answer: 2,
      image: "",
    },
{
      id: 803,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Ha forse delle protesi in metallo?'",
      options: ["Any metal part, Sir/Madam?", "Any metal knife, Sir/Madam?", "Any metal replacement, Sir/Madam?"],
      answer: 2,
      image: "",
    },
{
      id: 804,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può svuotare le tasche, per favore'",
      options: ["Could you empty your pockets, please?", "Could you empty your brain, please?", "Could you empty your mouth, please?"],
      answer: 0,
      image: "",
    },
{
      id: 805,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Il bagaglio è troppo grande e dovrebbe spedirlo come bagaglio da stiva'",
      options: ["Your hand bag is too small. You should send it in the hold at the check-in counter", "Your hand bag is too big. You should send it in the hold at the check-in counter", "Your hand bag is too heavy. You should send it in the hold at the check-in counter"],
      answer: 1,
      image: "",
    },
{
      id: 806,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Buongiorno'",
      options: ["Good afternoon", "Good morning", "Good evening"],
      answer: 1,
      image: "",
    },
{
      id: 807,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Si giri, prego/Mi porga le spalle,prego'",
      options: ["Could You give me your back, please./Could You turn around, please!", "Could You give me your arms, please./Could You turn arm, please", "Could You give me your hands, please./Could You turn hands, please"],
      answer: 0,
      image: "",
    },
{
      id: 808,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può spedirlo come bagaglio da stiva'",
      options: ["You can send it as hand bag", "You can't send it as hold bag", "You can send it as hold bag"],
      answer: 2,
      image: "",
    },
{
      id: 809,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Ha dimenticato qualcosa in tasca?'",
      options: ["Did you forget anything in your pockets?", "Did you forget anything in your head?", "Did you put anything in your pockets?"],
      answer: 0,
      image: "",
    },
{
      id: 810,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può usare la vaschetta'",
      options: ["You can use the bottle, please", "You can use the container, please", "You can use the baggage, please"],
      answer: 1,
      image: "",
    },
{
      id: 811,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'C'è qualcuno all'esterno al quale può consegnare l'oggetto?'",
      options: ["Is there anybody outside which You could give it to?", "Is there anybody with you which You could give it to?", "Is there anybody inside which You could give it to?"],
      answer: 0,
      image: "",
    },
{
      id: 812,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Crema per il corpo'",
      options: ["Cream", "Mouthwash", "Body lotion"],
      answer: 2,
      image: "",
    },
{
      id: 813,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Posso controllare la busta dei liquidi?'",
      options: ["May I paint your bag containing liquids, please?", "May I open your bag containing liquids, please?", "May I check your bag containing liquids, please?"],
      answer: 2,
      image: "",
    },
{
      id: 814,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe dare un sorso/Può assaggiarlo?'",
      options: ["Could You give a price, please/Could You price it, please?", "Could You give a sip, please/Could You taste it, please?", "Could You give a name, please/Could You name it, please?"],
      answer: 1,
      image: "",
    },
{
      id: 815,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Chiavi'",
      options: ["Keys", "Bracelets", "Coins"],
      answer: 0,
      image: "",
    },
{
      id: 816,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe togliere la sua giacca?'",
      options: ["Could You remove your jacket?", "Could You remove your gloves?", "Could You remove your scarf?"],
      answer: 0,
      image: "",
    },
{
      id: 817,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Chiave inglese'",
      options: ["Razor blade", "Wrench", "Hammer"],
      answer: 1,
      image: "",
    },
{
      id: 818,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Collutorio",
      options: ["Mouthwash", "Toothpaste", "Lenses solution"],
      answer: 0,
      image: "",
    },
{
      id: 819,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Cavatappi'",
      options: ["Wrench", "Corkscrew", "Razor blade"],
      answer: 1,
      image: "",
    },
{
      id: 820,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Collana'",
      options: ["Coins", "Bracelets", "Necklace/Collar"],
      answer: 2,
      image: "",
    },
{
      id: 821,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può divaricare le braccia/gambe, per favore?'",
      options: ["Could You spread your arms/legs, please?", "Could You open your arms/legs, please?", "Could You spread your nose/legs, please?"],
      answer: 0,
      image: "",
    },
{
      id: 822,
      category: "Esercitazione Lingua Inglese",
      text: "Come di dice 'Attrezzi da lavoro'",
      options: ["Knife", "Chain", "Tools"],
      answer: 2,
      image: "",
    },
{
      id: 823,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Bastone'",
      options: ["Knife", "Stick/Cane", "Screwdriver"],
      answer: 1,
      image: "",
    },
{
      id: 824,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può seguire il mio collega per un controllo scarpe alla macchina?'",
      options: ["Could You follow my cusin at the shoes analyzer?", "Could You follow my colleague at the shoes analyzer?", "Could You follow my colleague at the shoes machine?"],
      answer: 1,
      image: "",
    },
{
      id: 825,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'I liquidi possono essere trasportati solo all'interno di una busta di plastica trasparente della capacità massima di 1 litro",
      options: ["Liquids could only fly in a transparent plastic bag with a maximum volume of one liter", "Liquids could only be carried in a black plastic bag with a maximum volume of one liter", "Liquids could only be carried in a transparent plastic bag with a maximum volume of one liter"],
      answer: 2,
      image: "",
    },
{
      id: 826,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Al suo ritorno non dovrà fare la fila'",
      options: ["Once You’re back, You won’t queue again", "Once You’re back, You must queue again", "Once You’re back, You have to queue again"],
      answer: 0,
      image: "",
    },
{
      id: 827,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Mi scusi avremmo bisogno di ripassare il bagaglio in macchina'",
      options: ["Excuse me, we need to clean your bag once again", "Excuse me, we need to screen your bag once again", "Excuse me, we need to open your bag once again"],
      answer: 1,
      image: "",
    },
{
      id: 828,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Mazza'",
      options: ["Bat", "Bullet/Cartridge case", "Toy gun"],
      answer: 0,
      image: "",
    },
{
      id: 829,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può separare il computer dal bagaglio?'",
      options: ["Could You separate your laptop from the pocket, please?", "Could You separate your laptop from the bag, please?", "Could You separate your laptop from the wallet, please?"],
      answer: 1,
      image: "",
    },
{
      id: 830,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe rimuovere gli oggetti metallici?'",
      options: ["Could you remove any machine gun, please?", "Could you remove any metal detector, please?", "Could you remove any metal object, please?"],
      answer: 2,
      image: "",
    },
{
      id: 831,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Acqua'",
      options: ["Bottle", "Water", "Drinks"],
      answer: 1,
      image: "",
    },
{
      id: 832,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Grazie ed arrivederci'",
      options: ["Thank you and good-bye", "Thank you indeed", "Thank you and welcome"],
      answer: 0,
      image: "",
    },
{
      id: 833,
      category: "Esercitazione Lingua Inglese",
      text: "Come di dice 'Potrebbe tornare indietro e passare ai raggi ciò che ha in tasca?'",
      options: ["Could You turn back to the conveyor(belt) and pass your jacket contents through the machine?", "Could You turn back to the conveyor(belt) and pass your wallet contents through the machine?", "Could You turn back to the conveyor(belt) and pass your pockets contents through the machine?"],
      answer: 2,
      image: "",
    },
{
      id: 834,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Scalpello'",
      options: ["Chisel/Scalpel", "Knuckle duster/Brass knuckles", "Toy gun"],
      answer: 0,
      image: "",
    },
{
      id: 835,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Monete'",
      options: ["Hair clipper", "Coins", "Necklace/Collar"],
      answer: 1,
      image: "",
    },
{
      id: 836,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Bagnoschiuma'",
      options: ["Bottle", "Body lotion", "Bubble bath"],
      answer: 2,
      image: "",
    },
{
      id: 837,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Mi dispiace, può portare i liquidi che non superino 100ml di capacità. Questo prodotto supera il limite.'",
      options: ["I’m sorry, you are not allowed to carry liquids in containers exceeding one hundred ml. in capacity/this product exceeds the maximum limit", "I’m sorry, you are allowed to carry liquids in containers exceeding one hundred ml. in capacity/this product exceeds the maximum limit", "I’m sorry, you are not allowed to drink liquids in containers exceeding one hundred ml. in capacity/this product exceeds the maximum limit"],
      answer: 0,
      image: "",
    },
{
      id: 838,
      category: "Esercitazione Lingua Inglese",
      text: "Come di dice 'Portafoglio'",
      options: ["Ear rings", "Wallet", "Watch"],
      answer: 1,
      image: "",
    },
{
      id: 839,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe togliere al cintura?'",
      options: ["Could You remove the/your, shirt, please?", "Could You remove the/your, trouser, please?", "Could You remove the/your, belt, please?"],
      answer: 2,
      image: "",
    },
{
      id: 840,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Posso controllarla?'",
      options: ["Is it possible for me to kiss You, Sir/Madam?", "Is it possible for me to check You, Sir/Madam?", "Is it possible for me to hug You, Sir/Madam?"],
      answer: 1,
      image: "",
    },
{
      id: 841,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Martello'",
      options: ["Hammer", "Sword", "Razor blade"],
      answer: 0,
      image: "",
    },
{
      id: 842,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Teniamo conto della massima capacità riportata sul contenitore",
      options: ["We consider what is not specified by the maximum filling capacity indicated on the container", "We not consider what is specified by the minimum filling capacity indicated on the container", "We consider what is specified by the maximum filling capacity indicated on the container"],
      answer: 2,
      image: "",
    },
{
      id: 843,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Tenaglia'",
      options: ["Pincer", "Drill/Drill bits", "Sword"],
      answer: 0,
      image: "",
    },
{
      id: 844,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice, in caso di portatori di Pacemaker 'E' preferibile che non passi sotto il portale metal detector'",
      options: ["It’s preferable for You not to go across the archway/portal", "It’s preferable for You not to step across the archway/portal", "It’s preferable for You not to jump across the archway/portal"],
      answer: 1,
      image: "",
    },
{
      id: 845,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Ha troppi bagagli'",
      options: ["You’ve got too much luggage, Sir/Madam", "You’ve got too much hair, Sir/Madam", "You’ve got too much money, Sir/Madam"],
      answer: 0,
      image: "",
    },
{
      id: 846,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Buonasera'",
      options: ["Good afternoon", "Good morning", "Good evening"],
      answer: 2,
      image: "",
    },
{
      id: 847,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Dentifricio'",
      options: ["Shaving foam", "Toothpaste", "Lenses solution"],
      answer: 1,
      image: "",
    },
{
      id: 848,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Buon pomeriggio'",
      options: ["Good morning", "Good evening", "Good afternoon"],
      answer: 2,
      image: "",
    },
{
      id: 849,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Forcine per capelli'",
      options: ["Hair clipper", "Coins", "Bracelets"],
      answer: 0,
      image: "",
    },
{
      id: 850,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Ho terminato, è tutto! Grazie per la collaborazione'",
      options: ["That’s it! Thanks for your attention and good bye", "That’s it! Thanks for your help and good bye", "That’s it! Thanks for your cooperation and good bye"],
      answer: 2,
      image: "",
    },
{
      id: 851,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Cacciavite'",
      options: ["Screwdriver", "Knife", "Scissors"],
      answer: 0,
      image: "",
    },
{
      id: 852,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Buongiorno, è suo questo bagaglio/borsa?'",
      options: ["Good morning,Sir/Madam! Is this/that hat/wallet yours?", "Good morning,Sir/Madam! Is this/that bag/purse yours?", "Good morning,Sir/Madam! Is this/that shirt/glove yours?"],
      answer: 1,
      image: "",
    },
{
      id: 853,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Portale elettromagnetico'",
      options: ["Walk in metal detector", "Walk through metal detector", "Walk through metal direction"],
      answer: 1,
      image: "",
    },
{
      id: 854,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe mostrare la carta d'imbarco/biglietto?'",
      options: ["Could You show the/your underwear/id pass, please?", "Could You show the/your ticket/boarding pass, please?", "Could You show the/your machine gun/boarding pass, please?"],
      answer: 1,
      image: "",
    },
{
      id: 855,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Fuochi pirotecnici'",
      options: ["Toy gun", "Bullet/Cartridge case", "Fireworks"],
      answer: 2,
      image: "",
    },
{
      id: 856,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Busta di plastica richiudibile'",
      options: ["Re-sealable plastic bag/zip-loc bag", "Re-saleable plastic bag/zip-loc bag", "Re-valuable plastic bag/zip-loc bag"],
      answer: 0,
      image: "",
    },
{
      id: 857,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può seguirmi per un controllo al tavolo?'",
      options: ["Could You follow me for a bag clean at the/that table?", "Could You follow me for a bag check at the/that table?", "Could You follow me for a bag check at the/that space?"],
      answer: 1,
      image: "",
    },
{
      id: 858,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Potrebbe depositare l'oggetto sul nastro?'",
      options: ["Could You put it on the head (belt), please?", "Could You put it on the truck(belt), please?", "Could You put it on the conveyor (belt), please?"],
      answer: 2,
      image: "",
    },
{
      id: 859,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Bibite'",
      options: ["Milk", "Drinks", "Bottle"],
      answer: 1,
      image: "",
    },
{
      id: 860,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Mi dispiace, come da regolamento, questo articolo non può essere portato nel bagaglio a mano'",
      options: ["I’m sorry, according to the rules/to regulations, it is forbidden in the cabin./You can’t take it with You as personal belonginig", "I’m sorry, according to the rules/to regulations, it is allowed in the cabin./You can take it with You as hand bag", "I’m sorry, according to the rules/to regulations, it is forbidden in the cabin./You can’t take it with You as hand bag"],
      answer: 2,
      image: "",
    },
{
      id: 861,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Prego, può entrare'",
      options: ["Come in, please! Sir/Madam!", "Hurry up, please!, Sir/Madam!", "Coming out, please!Sir/Madam!"],
      answer: 0,
      image: "",
    },
{
      id: 862,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Proiettile/Bossolo'",
      options: ["Toy gun", "Chisel/Scalpel", "Bullet/Cartridge case"],
      answer: 2,
      image: "",
    },
{
      id: 863,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Mi dispiace, ma non provenendo da un paese membro dell'UE dovrebbe spedire in stiva le bevande che ha acquistato al duty-free'",
      options: ["Sorry, as You have not boarded in any EU countries, You should keep the drinks You bought in the duty free shop as cabin bag", "Sorry, as You have boarded in any EU countries, You should send the drinks You bought in the duty free shop as hold bag", "Sorry, as You have not boarded in any EU countries, You should send the drinks You bought in the duty free shop as hold bag"],
      answer: 2,
      image: "",
    },
{
      id: 864,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Orologio'",
      options: ["Watch", "Wallet", "Ear rings"],
      answer: 0,
      image: "",
    },
{
      id: 865,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Tirapugni'",
      options: ["Toy gun", "Knuckle duster/Brass knuckles", "Pincer"],
      answer: 1,
      image: "",
    },
{
      id: 866,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Trapano/Punte di trapano'",
      options: ["Bat", "Drill/Drill bits", "Bullet/Cartrigde case"],
      answer: 1,
      image: "",
    },
{
      id: 867,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può tenere il bambino in braccio? Dovremmo radiogenare il passeggino.",
      options: ["Could You eat the baby, please? We need to screen the stroller", "Could You hold the baby, please? We need to clean the stroller", "Could You hold the baby, please? We need to screen the stroller"],
      answer: 2,
      image: "",
    },
{
      id: 868,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Sciarpa'",
      options: ["Scarf", "Hat", "Gloves"],
      answer: 0,
      image: "",
    },
{
      id: 869,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Orecchini'",
      options: ["Watch", "Ear rings", "Necklace/Collar"],
      answer: 1,
      image: "",
    },
{
      id: 870,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Schiuma da barba'",
      options: ["Sunscreen", "Detergents", "Shaving foam"],
      answer: 2,
      image: "",
    },
{
      id: 871,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può separare il computer dal bagaglio?",
      options: ["Could You separate your laptop from the bag, please?", "Could You separate your laptop from the wallet, please?", "Could You separate your laptop from the pocket, please?"],
      answer: 0,
      image: "",
    },
{
      id: 872,
      category: "Esercitazione Lingua Inglese",
      text: "Come si dice 'Può aspettare dietro la linea gialla?'",
      options: ["Can you go behind the yellow line, please?", "Can you wait behind the yellow line, please?", "Can you come behind the yellow line, please?"],
      answer: 1,
      image: "",
    },
    {
      id: 1000,
      category: "Esercitazione Teoria Generale",
      text: "Le Circolari ENAC della Serie Security (SEC):",
      options: ["Sono sviluppate per migliorare la comprensione delle regole", "Sono dedicate agli argomenti attinenti la security", "Tutte le risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 1001,
      category: "Esercitazione Teoria Generale",
      text: "Qual'è il documento principale emesso dall'ICAO in tema di security?",
      options: ["Annesso 17", "Annesso 14", "Documento 30"],
      answer: 0,
      image: "",
    },
{
      id: 1002,
      category: "Esercitazione Teoria Generale",
      text: "L'ECAC è:",
      options: ["Una organizzazione internazionale di tipo politico che elabora suggerimenti sullo sviluppo efficiente e controllato dell'aviazione civile", "Una organizzazione europea di tipo politico che elabora suggerimenti sullo sviluppo efficiente e controllato dell'aviazione civile", "Una organizzazione mondiale il cui obiettivo principale è istituire degli standards per lo sviluppo controllato dell'aviazione civile"],
      answer: 1,
      image: "",
    },
{
      id: 1003,
      category: "Esercitazione Teoria Generale",
      text: "L'allegato al Regolamento (UE) 1998/2015 si compone di:",
      options: ["14 Capitoli", "12 Annessi tecnici", "12 Capitoli"],
      answer: 2,
      image: "",
    },
{
      id: 1004,
      category: "Esercitazione Teoria Generale",
      text: "Il C.I.S.A ha come compito principale quello di:",
      options: ["Elaborare e mantenere aggiornato il P.N.S.", "Fornire pareri e suggerimenti non vincolanti in tema di security del trasporto aereo", "Nessuna delle altre due risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 1005,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa I.C.A.O?",
      options: ["International club of airlines and operators", "International cooperation of air operators", "International civil aviation organization"],
      answer: 2,
      image: "",
    },
{
      id: 1006,
      category: "Esercitazione Teoria Generale",
      text: "Indicare il Decreto ministeriale che determina i servizi affidabili in concessione:",
      options: ["D.M. 88/99", "D.M. 85/99", "D.M. 85/98"],
      answer: 1,
      image: "",
    },
{
      id: 1007,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo I.A.T.A.?",
      options: ["Intercontinental Avio Trade Association", "International Air Trasportation Agency", "International Air Trasportation Association"],
      answer: 2,
      image: "",
    },
{
      id: 1008,
      category: "Esercitazione Teoria Generale",
      text: "La convenzione di Tokyo fu sottoscritta nel:",
      options: ["1963", "1965", "1964"],
      answer: 0,
      image: "",
    },
{
      id: 1009,
      category: "Esercitazione Teoria Generale",
      text: "Il personale che effettua il controllo radioscopico o con altri tipi di apparecchiature dei bagagli da stiva, deve essere in possesso della qualifica di Guardia particolare Giurata?",
      options: ["No", "Si", "No, è sufficiente che sia formato come previsto dal Manuale della formazione per la security ENAC"],
      answer: 1,
      image: "",
    },
{
      id: 1010,
      category: "Esercitazione Teoria Generale",
      text: "Una bomba può essere considerata un'arma propria?",
      options: ["Si", "No", "Solo se è un I.E.D."],
      answer: 0,
      image: "",
    },
{
      id: 1011,
      category: "Esercitazione Teoria Generale",
      text: "Cosa contiene la parte 'A' del P.N.S.?",
      options: ["Disposizioni esplicative del Regolamento (CE) 300 del 2008", "Disposizioni della Decisione Riservata 8005 del 2015", "Disposizioni esplicative del Regolamento (UE) 1998 del 2015"],
      answer: 2,
      image: "",
    },
{
      id: 1012,
      category: "Esercitazione Teoria Generale",
      text: "Cosa contiene la parte 'B' del P.N.S.?",
      options: ["Disposizioni della Decisione Riservata 8005 del 2015", "Disposizioni esplicative del Regolamento (UE) 1998 del 2015", "Disposizioni esplicative del Regolamento (CE) 300 del 2008"],
      answer: 0,
      image: "",
    },
{
      id: 1013,
      category: "Esercitazione Teoria Generale",
      text: "Il P.N.S. è adottato:",
      options: ["Dall'E.N.A.C.", "Dall'E.N.A.C. con provvedimento del Direttore Generale", "Dall'E.N.A.C. con provvedimento del Direttore Generale previa consultazione del C.I.S.A."],
      answer: 2,
      image: "",
    },
{
      id: 1014,
      category: "Esercitazione Teoria Generale",
      text: "L'Aviation Security è:",
      options: ["La combinazione di misure, risorse umane e materiali finalizzate alla protezione degli aerei da atti di interferenza illecita che ne mettano in pericolo la sicurezza", "La combinazione di misure, risorse umane e materiali finalizzate alla protezione dell'aviazione civile da atti di interferenza illecita che ne mettano in pericolo la sicurezza", "La combinazione di misure, risorse umane e materiali finalizzate alla protezione degli aeroporti da atti di interferenza illecita che ne mettano in pericolo la sicurezza"],
      answer: 1,
      image: "",
    },
{
      id: 1015,
      category: "Esercitazione Teoria Generale",
      text: "Il Capitolo 12 del Reg. (UE) 1998/2015 tratta di:",
      options: ["Merci e posta", "Provviste di bordo", "Attrezzature di sicurezza"],
      answer: 2,
      image: "",
    },
{
      id: 1016,
      category: "Esercitazione Teoria Generale",
      text: "Il Capitolo 11 del Reg. (UE) 1998/2015 tratta di:",
      options: ["Selezione e formazione del personale", "Misure per la sicurezza in volo", "Provviste di bordo"],
      answer: 0,
      image: "",
    },
{
      id: 1017,
      category: "Esercitazione Teoria Generale",
      text: "Quale misura di sicurezza fondamentale fu introdotta a seguito dell'attentato terroristico di Lockerbie?",
      options: ["Il profiling (intervista del passeggero all'atto del check in)", "Il riconcilio dei bagagli da stiva", "Il riscontro documentale al gate d'imbarco"],
      answer: 1,
      image: "",
    },
{
      id: 1018,
      category: "Esercitazione Teoria Generale",
      text: "Quale limitazione comportò l'operazione di antiterrorisismo compiuta nel 2006 negli aeroporti britannici?",
      options: ["Limitazione del peso dei bagagli da stiva", "Limitazione del numero di passeggeri imbarcati", "Limitazione dei liquidi trasportabili in cabina"],
      answer: 2,
      image: "",
    },
{
      id: 1019,
      category: "Esercitazione Teoria Generale",
      text: " L'11 settembre 2001 fu compiuto a New York l'attentato alle Torri Gemelle. Quale altro obiettivo americano fu oggetto di attentato con la stessa metodologia, nello stesso giorno?",
      options: ["La sede del Pentagono", "La Casa Bianca", "La sede della CIA"],
      answer: 0,
      image: "",
    },
{
      id: 1020,
      category: "Esercitazione Teoria Generale",
      text: "Quale articolo del Codice della Navigazione designa l'ENAC come unica Autorità di certificazione e vigilanza nel settore del trasporto aereo in Italia?",
      options: ["Art. 718", "Art. 687", "Art. 1174"],
      answer: 1,
      image: "",
    },
{
      id: 1021,
      category: "Esercitazione Teoria Generale",
      text: "L'istituzione dell'ICAO è stata prevista da:",
      options: ["Convenzione di Chicago del 1944", "Convenzione di Tokyo del 1963", "Convenzione di Montreal del 1971"],
      answer: 0,
      image: "",
    },
{
      id: 1022,
      category: "Esercitazione Teoria Generale",
      text: "Cosa indica l'acronimo C.I.S.A.?",
      options: ["Commissione italiana sulla sicurezza aerea", "Comitato interministeriale di strategia aeronautica", "Comitato interministeriale per la sicurezza dei trasporti aerei e degli aeroporti"],
      answer: 2,
      image: "",
    },
{
      id: 1023,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo E.C.A.C.?",
      options: ["Economic Civil Aviation Committee", "European Civil Aviation Conference", "European Commission of Air Companies"],
      answer: 1,
      image: "",
    },
{
      id: 1024,
      category: "Esercitazione Teoria Generale",
      text: "Ai sensi di quale articolo del T.U.L.P.S. il gestore aeroportuale può dotarsi di Guardie particolari Giurate?",
      options: ["133", "135", "143"],
      answer: 0,
      image: "",
    },
{
      id: 1025,
      category: "Esercitazione Teoria Generale",
      text: "Il responsabile della security di un operatore aeroportuale è indicato come:",
      options: ["Safety Manager", "Security Manager", "Direttore Tecnico operativo"],
      answer: 1,
      image: "",
    },
{
      id: 1026,
      category: "Esercitazione Teoria Generale",
      text: "L'I.E.D. è un oggetto:",
      options: ["Esplosivo, di fabbricazione artigianale", "Esplosivo, di tipo convenzionale e quindi in dotazione esclusiva agli eserciti", "Esplosivo, a prescindere dalla fabbricazione"],
      answer: 0,
      image: "",
    },
{
      id: 1027,
      category: "Esercitazione Teoria Generale",
      text: "Una pistola è:",
      options: ["Arma impropria", "Arma generica", "Arma propria"],
      answer: 2,
      image: "",
    },
{
      id: 1028,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo C.S.A.?",
      options: ["Commissione di Sicurezza Aeronautica", "Comitato di Sicurezza Aeroportuale", "Comitato Superiore Aeroportuale"],
      answer: 1,
      image: "",
    },
{
      id: 1029,
      category: "Esercitazione Teoria Generale",
      text: "Quale è il riferimento normativo che devolve in concessione al Gestore aeroportuale o ad altri soggetti privati (imprese di sicurezza) le attività di controllo in ambito aeroportuale?",
      options: ["Il Decreto Ministeriale 85 del 29 gennaio 1999", "Il Programma Nazionale per la Sicurezza dell'Aviazione civile al Cap. 1 della Parte 'A'", "L'Articolo 705 del Codice della Navigazione"],
      answer: 0,
      image: "",
    },
{
      id: 1030,
      category: "Esercitazione Teoria Generale",
      text: "Il Capitolo 7 del Reg. (UE) 1998/2015 tratta di:",
      options: ["Provviste di bordo", "Posta e materiale del vettore aereo", "Forniture per l'aeroporto"],
      answer: 1,
      image: "",
    },
{
      id: 1031,
      category: "Esercitazione Teoria Generale",
      text: "Quale area dell'aeroporto venne interessata dagli attentati del 2016 compiuti a Bruxelles ed Istanbul?",
      options: ["Area gates d'imbarco", "Area riconsegna bagagli", "Area biglietteria / check in"],
      answer: 2,
      image: "",
    },
{
      id: 1032,
      category: "Esercitazione Teoria Generale",
      text: "Qual'è la più grande organizzazione internazionale che si occupa del trasporto aereo?",
      options: ["ICAO", "ECAC", "IATA"],
      answer: 0,
      image: "",
    },
{
      id: 1033,
      category: "Esercitazione Teoria Generale",
      text: "Il Comitato di Sicurezza Aeroportuale:",
      options: ["E' un organo consultivo di cui si avvale l'ENAC a livello locale", "E' presieduto dal Direttore Aeroportuale", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 1034,
      category: "Esercitazione Teoria Generale",
      text: "In quante parti è suddiviso il Programma Nazionale per la Sicurezza dell'aviazione civile?",
      options: ["Parte A, parte B, parte C, parte D", "Parte A, parte B, parte C", "Parte A, parte B"],
      answer: 2,
      image: "",
    },
{
      id: 1035,
      category: "Esercitazione Teoria Generale",
      text: "Quali tra i seguenti articoli sono da considerare materiale del vettore aereo?",
      options: ["Carte d'imbarco, etichette per la registrazione del bagaglio da stiva, etichette per il bagaglio 'rush'", "Etichette utilizzate ai fini esclusivi di identificazione di dati anagrafici e/o di residenza", "Carte d'imbarco"],
      answer: 0,
      image: "",
    },
{
      id: 1036,
      category: "Esercitazione Teoria Generale",
      text: "L'Annesso 17 venne pubblicato dall'I.C.A.O. nel:",
      options: ["1978", "1975", "1977"],
      answer: 1,
      image: "",
    },
{
      id: 1037,
      category: "Esercitazione Teoria Generale",
      text: "Quali sono i servizi di controllo svolti sotto la vigilanza dell'ufficio della Polizia di Stato presso lo scalo aereo?",
      options: ["Controllo dei passeggeri in partenza ed in transito e controllo radioscopico o con altri tipi di apparecchiatura del bagaglio", "Controllo dei passeggeri in partenza ed in transito e controllo radioscopico o con altri tipi di apparecchiatura dei bagagli a mano e da stiva", "Entrambe le altre risposte sono corrette"],
      answer: 0,
      image: "",
    },
{
      id: 1038,
      category: "Esercitazione Teoria Generale",
      text: "Le armi proprie, si dividono in:",
      options: ["Armi da fuoco ed armi bianche", "Armi da fuoco, bombe, gas asfissianti o accecanti", "Armi da fuoco, armi bianche, bombe, gas asfissianti o accecanti"],
      answer: 2,
      image: "",
    },
{
      id: 1039,
      category: "Esercitazione Teoria Generale",
      text: "Alla Guardia particolare Giurata, può essere attribuita la qualifica di pubblico ufficiale?",
      options: ["No, mai", "La Guardia particolare Giurata assume la qualifica solo su esplicita richiesta formulata da Ufficiali ed Agenti di Pubblica Sicurezza e solo per il tempo strettamente necessario", "La Guardia particolare Giurata nel turno di servizio riveste sempre la qualifica di Pubblico Ufficiale"],
      answer: 1,
      image: "",
    },
{
      id: 1040,
      category: "Esercitazione Teoria Generale",
      text: "Gli standard e le procedure adottate periodicamente dall'I.C.A.O.:",
      options: ["Entrano automaticamente in vigore, vincolando tutti gli stati che hanno aderito alla Convenzione", "Hanno efficacia esortativa", "Sono adottati dai singoli stati solo in caso di effettiva necessità"],
      answer: 0,
      image: "",
    },
{
      id: 1041,
      category: "Esercitazione Teoria Generale",
      text: "Quale è l'Autorità responsabile del coordinamento e del controllo dell'attuazione delle norme di sicurezza?",
      options: ["Il Ministero dell'Interno", "Il ministero delle Infrastrutture e Trasporti", "E.N.A.C."],
      answer: 2,
      image: "",
    },
{
      id: 1042,
      category: "Esercitazione Teoria Generale",
      text: "Il Capitolo 4 del Reg. (UE) 1998/2015 tratta di:",
      options: ["Passeggeri e bagaglio a mano", "Bagaglio da stiva", "Sicurezza degli aeromobili"],
      answer: 0,
      image: "",
    },
{
      id: 1043,
      category: "Esercitazione Teoria Generale",
      text: "Il Capitolo 5 del Reg. (UE 1998/2015 tratta di:",
      options: ["Merci e posta", "Bagaglio da stiva", "Passeggeri e bagaglio a mano"],
      answer: 1,
      image: "",
    },
{
      id: 1044,
      category: "Esercitazione Teoria Generale",
      text: "Per 'controllo di sicurezza' si intende:",
      options: ["Applicazione di mezzi tecnici o di altro tipo atti ad identificare e/o rilevare la presenza di articoli proibiti", "Applicazione di mezzi e procedure in grado di impedire l'introduzione di articoli proibiti in area sterile", "Nessuna delle altre risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 1045,
      category: "Esercitazione Teoria Generale",
      text: "Quanti sono gli Annessi I.C.A.O.?",
      options: ["19", "20", "17"],
      answer: 0,
      image: "",
    },
{
      id: 1046,
      category: "Esercitazione Teoria Generale",
      text: "A quali categorie di personale è consentito l'accesso attraverso il passaggio di servizio:",
      options: ["Solo a persone diverse dai passeggeri", "Al solo personale Diplomatico", "Entrambe le altre risposte sono corrette"],
      answer: 2,
      image: "",
    },
{
      id: 1047,
      category: "Esercitazione Teoria Generale",
      text: "In aggiunta al bagaglio a mano, al passeggero è permesso portare al proprio seguito:",
      options: ["Entrambe la altre risposte sono corrette", "Una borsetta o borsa porta documenti", "Un ombrello"],
      answer: 0,
      image: "",
    },
{
      id: 1048,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo E.D.S.?",
      options: ["Explosive Directional System", "Explosive Detection System", "Explosive Disposal Single"],
      answer: 1,
      image: "",
    },
{
      id: 1049,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo LEDS?",
      options: ["Liquid Explosive Device System", "Liquid Energetic Detection System", "Liquid Explosive Detection System"],
      answer: 2,
      image: "",
    },
{
      id: 1050,
      category: "Esercitazione Teoria Generale",
      text: "Una Guardia particolare Giurata è?",
      options: ["Un incaricato di pubblico servizio", "Un esercente di un servizio di pubblica necessità", "Un pubblico ufficiale"],
      answer: 0,
      image: "",
    },
{
      id: 1051,
      category: "Esercitazione Teoria Generale",
      text: "Quale organismo agisce come unica Autorità di regolazione tecnica, certificazione e vigilanza del settore dell'Aviazione civile?",
      options: ["Gestore aeroportuale", "E.N.A.C.", "Ministero dell'Interno"],
      answer: 1,
      image: "",
    },
{
      id: 1052,
      category: "Esercitazione Teoria Generale",
      text: "L'E.N.A.C. è l'Autorità responsabile del coordinamento e del monitoraggio dell'attuazione delle norme comuni per la prevenzione degli atti di interferenza illecita nell'aviazione civile?",
      options: ["Si", "Si, solo nei casi in cui svolge attività ispettiva", "No"],
      answer: 0,
      image: "",
    },
{
      id: 1053,
      category: "Esercitazione Teoria Generale",
      text: "Quali Autorità accertano i requisiti professionali degli addetti ai controlli di sicurezza?",
      options: ["L'E.N.A.V. ed il Ministero dell'Interno Dipartimento di Pubblica Sicurezza", "L'E.N.A.C. ed il Gestore aeroportuale in apposita Commissione", "L'E.N.A.C. ed il Ministero dell'Interno Dipartimento di Pubblica Sicurezza"],
      answer: 2,
      image: "",
    },
{
      id: 1054,
      category: "Esercitazione Teoria Generale",
      text: "La figura della Guardia particolare Giurata è disciplinata da:",
      options: ["Decreto Ministeriale 85 del 1999", "T.U.L.P.S.", "Legge 694 del 1974"],
      answer: 1,
      image: "",
    },
{
      id: 1055,
      category: "Esercitazione Teoria Generale",
      text: "Il Regolamento (CE) 300 del 2008 stabilisce:",
      options: ["Norme comuni per la sicurezza dell'aviazione civile", "Norme di accesso in aeroporto", "Metodologie di screening dei passeggeri e dello staff"],
      answer: 0,
      image: "",
    },
{
      id: 1056,
      category: "Esercitazione Teoria Generale",
      text: "Le armi rientrano nella lista degli:",
      options: ["Oggetti speciali", "Articoli autorizzati", "Articoli proibiti"],
      answer: 2,
      image: "",
    },
{
      id: 1057,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo I.E.D.?",
      options: ["Improvident Energyzing Disposal", "Improvised Explosive Device", "Illegal Explosive Disposal"],
      answer: 1,
      image: "",
    },
{
      id: 1058,
      category: "Esercitazione Teoria Generale",
      text: "Cosa significa l'acronimo H.H.M.D.?",
      options: ["Hand held metal detector", "Handling high metal detection", "Hand held metal device"],
      answer: 0,
      image: "",
    },
{
      id: 1059,
      category: "Esercitazione Teoria Generale",
      text: "Cosa si intende per arma propria?",
      options: ["E' un oggetto che non nasce per offendere", "E' un oggetto che nasce o ha come destinazione naturale quella di offendere", "Entrambe le altre risposte sono corrette"],
      answer: 1,
      image: "",
    },
{
      id: 1060,
      category: "Esercitazione Teoria Generale",
      text: "Quale legge dello Stato italiano regolamenta il trasporto delle armi a bordo dell'aeromobile?",
      options: ["Legge 110 del 1975", "Legge 155 del 1970", "Legge 694 del 1974"],
      answer: 2,
      image: "",
    },
{
      id: 1061,
      category: "Esercitazione Teoria Generale",
      text: "Quali tra queste non è considerata una Convenzione ai fini della prevenzione di atti di interferenza illecita?",
      options: ["Convenzione di Tokyo del 1963", "Convenzione di New York del 1979", "Convenzione dell'Aja del 1970"],
      answer: 1,
      image: "",
    },
{
      id: 1062,
      category: "Esercitazione Teoria Generale",
      text: "Cosa tratta il Capitolo 1 dell'Allegato al Regolamento (UE) 1998 del 2015?",
      options: ["Sicurezza degli aeroporti", "Sicurezza degli aeromobili", "Aree delimitate aeroportuali"],
      answer: 0,
      image: "",
    },
{
      id: 1063,
      category: "Esercitazione Teoria Generale",
      text: "Il P.N.S. prevede la redazione di un Programma per la Sicurezza dell'aeroporto da parte del Gestore aeroportuale?",
      options: ["Si", "No", "Si, ma solo se la valutazione del rischio lo prevede"],
      answer: 0,
      image: "",
    },
{
      id: 1064,
      category: "Esercitazione Teoria Generale",
      text: "La Decisione della Commissione 8005 del 2015 e le successive integrazioni, contiene:",
      options: ["Informazioni riservate esclusivamente al Ministero dell'Interno", "Informazioni rese pubbliche sulla Gazzetta Ufficiale Europea", "Informazioni riservate"],
      answer: 2,
      image: "",
    },
{
      id: 1065,
      category: "Esercitazione Teoria Generale",
      text: "I Regolamenti Europei sono:",
      options: ["Facoltativi", "Direttamente applicabili", "Nessuna della altre risposte è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 1066,
      category: "Esercitazione Teoria Generale",
      text: "Il Regolamento 1998 del 2015 è stato recentemente emendato dal Regolamento:",
      options: ["N.ro 103 del 2019", "N.ro 250 del 2019", "N.ro 260 del 2019"],
      answer: 0,
      image: "",
    },
{
      id: 1067,
      category: "Esercitazione Teoria Generale",
      text: "In riferimento all'aeroporto Leonardo da Vinci di Fiumicino, perché è importante ricordare la data del 27 dicembre 1985?",
      options: ["Perchè transitò sullo scalo il milionesimo passeggero", "Perchè fu eseguito un attentato nella sala partenze del Terminal 3", "Perchè vi fu l'adesione ed il conseguente riconoscimento dell'aeroporto dall'ICAO"],
      answer: 1,
      image: "",
    },
{
      id: 1068,
      category: "Esercitazione Teoria Generale",
      text: "In quale grande capitale il 24 gennaio 2011 nell'area ritiro bagagli dell'aeroporto venne fatto esplodere un ordigno che causò la morte di 37 persone ed il ferimento di oltre 180?",
      options: ["Bruxelles, aeroporto National", "Londra, aeroporto di Gatwick", "Mosca, aeroporto di Domedovo"],
      answer: 2,
      image: "",
    },
{
      id: 1069,
      category: "Esercitazione Teoria Generale",
      text: "In quale Convenzione internazionale si parla di prevenzione e lotta al dirottamento aereo?",
      options: ["Convenzione dell'Aja del 1970", "Convenzione di Montreal del 1971", "Convenzione di Tokyo del 1963"],
      answer: 1,
      image: "",
    },
{
      id: 1070,
      category: "Esercitazione Teoria Generale",
      text: "Quale articolo del Codice della Navigazione assegna all'ENAC funzioni di polizia degli aeroporti in Italia?",
      options: ["Art. 718", "Art. 1174", "Art. 687"],
      answer: 0,
      image: "",
    },
{
      id: 1071,
      category: "Esercitazione Teoria Generale",
      text: "Le disposizioni del P.N.S. si applicano:",
      options: ["A tutti gli aeroporti italiani", "Agli aeroporti italiani non aperti al traffico aereo commerciale", "Agli aeroporti italiani aperti al traffico aereo commerciale"],
      answer: 2,
      image: "",
    },
{
      id: 1072,
      category: "Esercitazione Teoria Generale",
      text: "Il Programma di Sicurezza dell'aeroporto, viene redatto da:",
      options: ["Polizia di Frontiera aerea", "Gestore aeroportuale", "E.N.A.C. a livello locale"],
      answer: 1,
      image: "",
    },
{
      id: 1073,
      category: "Esercitazione Teoria Generale",
      text: "Quale dei seguenti Regolamenti europei prevede che ogni gestore aeroportuale debba produrre un proprio Programma di Sicurezza?",
      options: ["Regolamento Europeo 1998 del 2015", "Regolamento Europeo 72 del 2010", "Regolamento Europeo 300 del 2008"],
      answer: 2,
      image: "",
    },
{
      id: 1074,
      category: "Esercitazione Teoria Generale",
      text: "Quali sono i servizi di controllo esclusi dal Decreto Ministeriale 85/99?",
      options: ["I servizi di controllo per il cui espletamento è richiesto l'esercizio delle pubbliche potestà o l'impiego operativo delle Forze di Polizia", "I servizi di controllo espletati dai Gestori aeroportuali", "I servizi di controllo espletati dagli altri soggetti privati (imprese di sicurezza)"],
      answer: 0,
      image: "",
    },
{
      id: 1075,
      category: "Esercitazione Teoria Generale",
      text: "Cosa sono i Dangerous Goods?",
      options: ["Sostanze altamente infiammabili che non possono essere trasportate con aeromobili", "Beni o merci fragili che richiedono particolari modalità/restrizioni nel trasporto", "Articoli e sostanze che possono essere trasportati esclusivamente secondo le modalità/restrizioni previste per il trasporto di merci pericolose"],
      answer: 2,
      image: "",
    },
{
      id: 1076,
      category: "Esercitazione Teoria Generale",
      text: "Negli aeroporti italiani la 'funzione di polizia e vigilanza' è esercitata da:",
      options: ["Polizia di Frontiera", "ENAC anche mediante le proprie articolazioni periferiche", "Comitato interministeriale per la Sicurezza del trasporto aereo e degli aeroporti"],
      answer: 1,
      image: "",
    },
{
      id: 1077,
      category: "Esercitazione Teoria Generale",
      text: "Come si chiama il piano che descrive le procedure da adottare in caso di atto illecito?",
      options: ["Programma Nazionale delle emergenze", "Piano Leonardo Antiterrorismo", "Piano Leonardo da Vinci"],
      answer: 2,
      image: "",
    },
{
      id: 1078,
      category: "Esercitazione Teoria Generale",
      text: "Che cosa è il Test di Avvio STP?",
      options: ["E' un test per verificare il corretto funzionamento delle apparecchiature X-Ray", "E' un test necessario per resettare un'apparecchiatura X-Ray", "E' un test per verificare la connessione ad internet delle apparecchiature X-Ray"],
      answer: 0,
      image: "",
    },
{
      id: 1079,
      category: "Esercitazione Teoria Generale",
      text: "Quale è la validità temporale del Decreto di Guardia particolare Giurata?",
      options: ["3 anni", "2 anni", "5 anni"],
      answer: 1,
      image: "",
    },
{
      id: 1080,
      category: "Esercitazione Teoria Generale",
      text: "Gli elementi base di un ordigno sono:",
      options: ["Massa, detonatore e timer", "Timer, congegno di attivazione e massa", "Innesco, massa e congegno di attivazione"],
      answer: 2,
      image: "",
    },
{
      id: 1081,
      category: "Esercitazione Teoria Generale",
      text: "Cosa si intende per arma impropria?",
      options: ["E' un oggetto che nasce o ha come destinazione naturale quella di offendere", "E' un oggetto che non nasce per offendere", "Entrambe le risposte sono corrette"],
      answer: 1,
      image: "",
    },
{
      id: 1082,
      category: "Esercitazione Teoria Generale",
      text: "Come si suddividono le armi?",
      options: ["Armi proprie ed improprie", "Armi da fuoco ed armi bianche", "Armi clandestine ed armi storiche"],
      answer: 0,
      image: "",
    },
{
      id: 1083,
      category: "Esercitazione Teoria Generale",
      text: "L'Annesso I.C.A.O. che disciplina la security è il numero:",
      options: ["16", "19", "17"],
      answer: 2,
      image: "",
    },
{
      id: 1084,
      category: "Esercitazione Teoria Generale",
      text: "I gas accecanti possono essere considerati armi proprie?",
      options: ["No", "Si", "Solo se compressi ed assemblati con innesco attivo"],
      answer: 1,
      image: "",
    },
{
      id: 1085,
      category: "Esercitazione Teoria Generale",
      text: "Il P.N.S. è adottato con:",
      options: ["Disposizione del C.S.A.", "Ordinanza del Direttore aeroportuale", "Disposizione del Direttore Generale E.N.A.C."],
      answer: 2,
      image: "",
    },
{
      id: 1086,
      category: "Esercitazione Teoria Generale",
      text: "Cosa è una Ordinanza aeroportuale?",
      options: ["Un atto amministrativo che tratta materie inerenti l'aviazione civile e che ha valenza in ambito aeroportuale", "Un atto amministrativo che obbliga gli Enti di Stato ad applicare le procedure aeroportuali", "Un atto che impone sanzioni penali in ambito aeroportuale"],
      answer: 0,
      image: "",
    },
{
      id: 1087,
      category: "Esercitazione Teoria Generale",
      text: "Classico esempio di arma propria, è:",
      options: ["Un martello", "Un coltello da cucina", "Una spada"],
      answer: 2,
      image: "",
    },
{
      id: 1088,
      category: "Esercitazione Teoria Generale",
      text: "In riferimento all'aeroporto Leonardo da Vinci di Fiumicino, perché è importante ricordare la data del 17 dicembre 1973?",
      options: ["Perchè fu inaugurato il Terminal 3, progettato dall'architetto Pierluigi Nervi e realizzato in soli 3 anni", "Perchè, conseguentemente ad un attentato terroristico, persero la vita 34 persone", "Perchè fu operato il primo volo diretto a Buenos Aires"],
      answer: 1,
      image: "",
    },
{
      id: 1089,
      category: "Esercitazione Teoria Generale",
      text: "Con il termine 'screening' si intende:",
      options: ["Applicazione di mezzi tecnici o di altro tipo atti ad identificare e/o rilevare la presenza di articoli proibiti", "Applicazione di mezzi e procedure in grado di impedire l'introduzione di articoli proibiti in area sterile", "Nessuna delle altre risposte è corretta"],
      answer: 0,
      image: "",
    },
{
      id: 1090,
      category: "Esercitazione Teoria Generale",
      text: "Il Documento 30 è stato elaborato da:",
      options: ["ENAC", "ECAC", "ICAO"],
      answer: 1,
      image: "",
    },
{
      id: 1200,
      category: "Esercitazione Categoria A3",
      text: "Il Gestore Aeroportuale ogni quanto aggiorna l'elenco dei fornitori conosciuti per le forniture d'aeroporto?",
      options: ["E' aggiornato mensilmente", "E' aggiornato annualmente", "E' aggiornato costantemente, ad ogni nuova designazione, sospensione e/o ritiro"],
      answer: 2,
      image: "",
    },
{
      id: 1201,
      category: "Esercitazione Categoria A3",
      text: "Quando viene selezionata una fornitura di aeroporto da un fornitore sconosciuto per il controllo:",
      options: ["L'addetto deve controllare il 100% della fornitura", "L'addetto deve controllare almeno il 25% della fornitura", "L'addetto deve controllare il 50% della fornitura"],
      answer: 1,
      image: "",
    },
{
      id: 1202,
      category: "Esercitazione Categoria A3",
      text: "Sono considerati articoli proibiti nelle forniture di aeroporto:",
      options: ["Balestre, archi e fionde", "Coltelli da cucina con lame lunghe oltre i 6 cm", "Utensili con punte/lame superiori i 6 cm"],
      answer: 0,
      image: "",
    },
{
      id: 1203,
      category: "Esercitazione Categoria A3",
      text: "Quando sul certificato di sicurezza della fornitura di aeroporto proveniente da un fornitore conosciuto è presente l'indicazione di un sigillo, cosa deve fare l'addetto alla sicurezza?",
      options: ["Si deve limitare a controllare se il sigillo è stato manomesso", "Oltre a controllare l'integrità deve controllare che la numerazione corrisponda a quella indicata sul certificato", "Nessuna delle risposte precedenti è corretta"],
      answer: 1,
      image: "",
    },
{
      id: 1204,
      category: "Esercitazione Categoria A3",
      text: "Cosa deve essere sempre presente nei punti di accesso delle aree sterili?",
      options: ["Un elenco dei fornitori conosciuti per le forniture di aeroporto, un elenco dei fornitori sconosciuti", "Un elenco dei fornitori conosciuti per le forniture di aeroporto, un elenco di fornitori regolamentati di bordo, un elenco dei fornitori sconosciuti", "Un elenco dei fornitori conosciuti di forniture di aeroporto, un elenco dei fornitori regolamentati di bordo, un elenco di eventuali fornitori conosciuti dei fornitori regolamentati e/o vettore aereo"],
      answer: 2,
      image: "",
    },
{
      id: 1205,
      category: "Esercitazione Categoria A3",
      text: "Le forniture provenienti da fornitori sconosciuti che, per loro natura, non possono essere sottoposte a screening al punto di accesso come ghiaia, sabbia, cemento etc. Come vengono controllate?",
      options: ["Sono controllate tramite ETD e controllo visivo", "Sono scortate al punto di scarico e sottoposte a screening durante e dopo lo scarico sotto la costante sorveglianza degli addetti alla sicurezza (Certificati per categoria A3 ed A5)", "Sono scortate al punto di scarico e sottoposte a screening durante e dopo lo scarico sotto la costante sorveglianza degli addetti alla sicurezza (Certificati per categoria A1 ed A5)"],
      answer: 1,
      image: "",
    },
{
      id: 1206,
      category: "Esercitazione Categoria A3",
      text: "La documentazione relativa ed attestante l'aeronavigabilità dei ricambi per aeromobili:",
      options: ["Deve essere controllata da personale del vettore aereo all'ingresso dell'area sterile prima del carico sull'aeromobile", "Viene controllata esclusivamente dagli addetti alla sicurezza", "Non deve essere controllata"],
      answer: 0,
      image: "",
    },
{
      id: 1207,
      category: "Esercitazione Categoria A3",
      text: "Il controllo visivo delle forniture di aeroporto:",
      options: ["Non è mai autorizzato", "E' autorizzato in combinazione con altri metodi", "E' sempre autorizzato"],
      answer: 1,
      image: "",
    },
{
      id: 1208,
      category: "Esercitazione Categoria A3",
      text: "Il Certificato di sicurezza delle forniture aeroportuali deve includere:",
      options: ["Firma del Responsabile di Sicurezza", "N.ro fattura, natura della fornitura, sito di consegna, eventuale numero di sigilli, dichiarazione del Responsabile della Sicurezza e data", "N.ro fattura, natura della fornitura, sito di consegna, eventuale numero di sigilli, dichiarazione del Responsabile della Sicurezza, data e firma del Responsabile"],
      answer: 2,
      image: "",
    },
{
      id: 1209,
      category: "Esercitazione Categoria A3",
      text: "Le forniture sono classificate come 'Forniture di aeroporto':",
      options: ["Dal momento un cui diventano identificabili come forniture destinate ad essere vendute, utilizzate o messe a disposizione nelle aree sterili dell'aeroporto", "Dal momento in cui sono messe a disposizione nelle aree sterili degli aeroporti", "Dal momento in cui arrivano ai punti di accesso delle aree sterili degli aeroporti"],
      answer: 0,
      image: "",
    },
{
      id: 1210,
      category: "Esercitazione Categoria A3",
      text: "In riferimento al regolamento (UE) 2015/1998, l'elenco degli articoli proibiti nelle forniture è specificato nell'appendice?",
      options: ["4-C", "1-A", "4-A"],
      answer: 1,
      image: "",
    },
{
      id: 1211,
      category: "Esercitazione Categoria A3",
      text: "Le forniture di bordo provenienti da un fornitore regolamentato, al momento dell'ingresso in airside, devono essere corredate di cosa?",
      options: ["Dichiarazione di Impegni", "Dichiarazione di Sicurezza", "Certificato di Sicurezza"],
      answer: 2,
      image: "",
    },
{
      id: 1212,
      category: "Esercitazione Categoria A3",
      text: "Se al varco di ingresso all'area airside arriva un camion con forniture di bordo già messe in sicurezza, qual è la prima azione che deve compiere l'adetto al controllo di sicurezza?",
      options: ["Verificare se la società Fornitore Regolamentato è presente nell'elenco dei fornitori messo a disposizione del Gestore Aeroportuale", "Verificare l'identità del trasportatore richiedendo la carta d'identità", "Verificare se sono presenti sigilli"],
      answer: 0,
      image: "",
    },
{
      id: 1213,
      category: "Esercitazione Categoria A3",
      text: "Qual è la finalità del sigillo di sicurezza?",
      options: ["Identificare il produttore", "Semplificare lo scarico", "Garantire che la fornitura non sia stata manomessa"],
      answer: 2,
      image: "",
    },
{
      id: 1214,
      category: "Esercitazione Categoria A3",
      text: "La documentazione di sicurezza accompagna:",
      options: ["Solo i colli voluminosi", "Tutte le forniture e provviste già sottoposte a screening", "Nessuna fornitura"],
      answer: 1,
      image: "",
    },
{
      id: 1215,
      category: "Esercitazione Categoria A3",
      text: "Le forniture controllate devono essere conservate:",
      options: ["In aree sicure, delimitate e accessibili solo a personale autorizzato", "In qualunque magazzino disponibile", "Vicino all’area passeggeri"],
      answer: 0,
      image: "",
    },
{
      id: 1216,
      category: "Esercitazione Categoria A3",
      text: "Le 'provviste di bordo' sono:",
      options: ["Materiale di manutenzione", "Attrezzature di carico", "Il catering per l’aeromobile"],
      answer: 2,
      image: "",
    },
{
      id: 1217,
      category: "Esercitazione Categoria A3",
      text: "Le 'forniture aeroportuali' sono:",
      options: ["Materiali, attrezzature e beni destinati all’aeroporto", "Articoli personali dell’equipaggio", "Forniture di carburante"],
      answer: 0,
      image: "",
    },
{
      id: 1218,
      category: "Esercitazione Categoria A3",
      text: "Le provviste di bordo comprendono:",
      options: ["Soltanto i pasti degli equipaggi", "Carichi di merce commerciale", "Tutto ciò che è destinato all’aeromobile per il servizio passeggeri"],
      answer: 2,
      image: "",
    },
{
      id: 1219,
      category: "Esercitazione Categoria A3",
      text: "Quando una fornitura è considerata 'sicura'?",
      options: ["Quando è stata sottoposta a screening e correttamente sigillata", "Quando proviene da un’azienda conosciuta", "Quando è consegnata da personale con tesserino"],
      answer: 0,
      image: "",
    },
{
      id: 1220,
      category: "Esercitazione Categoria A3",
      text: "Se un sigillo di sicurezza risulta danneggiato:",
      options: ["La fornitura è accettata ugualmente", "Si può risigillare senza controllo", "Deve essere sottoposta a nuovo screening"],
      answer: 2,
      image: "",
    },
{
      id: 1221,
      category: "Esercitazione Categoria A3",
      text: "Chi rilascia l’autorizzazione a operare come 'fornitore conosciuto'?",
      options: ["Gestore Aeroportuale", "ENAC", "Il vettore aereo"],
      answer: 1,
      image: "",
    },
{
      id: 1222,
      category: "Esercitazione Categoria A3",
      text: "Se il certificato di sicurezza è incompleto:",
      options: ["Si accetta se il sigillo è integro", "La fornitura può essere accettata", "Deve essere respinta o sottoposta a nuovo controllo"],
      answer: 2,
      image: "",
    },
{
      id: 1223,
      category: "Esercitazione Categoria A3",
      text: "Un fornitore conosciuto perde la qualifica se:",
      options: ["Non rispetta i requisiti di sicurezza ENAC", "Cambia il logo aziendale", "Trasporta merci diverse"],
      answer: 0,
      image: "",
    },
{
      id: 1224,
      category: "Esercitazione Categoria A3",
      text: "Le aree di stoccaggio delle forniture controllate devono essere dotate di:",
      options: ["Sistemi di allarme, videosorveglianza e accesso controllato", "Accesso libero per tutti", "Nessuna misura particolare"],
      answer: 0,
      image: "",
    },
{
      id: 1225,
      category: "Esercitazione Categoria A3",
      text: "Qual è la differenza principale tra una fornitura aeroportuale e una provvista di bordo?",
      options: ["Le provviste di bordo sono per i passeggeri, le forniture per il personale", "Le forniture aeroportuali sono sempre alimentari", "Le forniture aeroportuali sono destinate all’aeroporto, le provviste all’aeromobile"],
      answer: 2,
      image: "",
    },
{
      id: 1226,
      category: "Esercitazione Categoria A3",
      text: "In quale momento una fornitura perde il suo status di sicurezza?",
      options: ["Dopo 24 ore dal controllo", "Se viene lasciata incustodita o perde il sigillo", "Dopo la consegna"],
      answer: 1,
      image: "",
    },
     // Aggiungi qui tutte le tue altre domande con ID univoci
  ];

  // --- Funzioni Helper ---

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  const isExpired = (iso) => {
    if (!iso) return false;
    return new Date() > new Date(iso);
  };

  // --- Logica Firebase (Sostituzione di localStorage) ---

  // Funzione per leggere dati da una collezione
  const readCollection = useCallback(async (collectionName) => {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }, []);

  // Sostituisce seedUsers: Popola Firebase se vuoto
  const seedFirebase = useCallback(async () => {
    // 1. Popola gli utenti
    const users = await readCollection('users');
    if (users.length === 0) {
        const initialUsers = [
            { username: "Admin", password: "Admin", expiresAt: null, disabled: false, archive: [], firstName: "Super", lastName: "Admin" },
            { username: "TestUser", password: "password", expiresAt: null, disabled: false, archive: [], firstName: "Utente", lastName: "Test" }, // Scadenza rimossa per semplicità nel seed
        ];
        for (const userRec of initialUsers) {
            await setDoc(doc(db, 'users', String(userRec.username)), userRec); // Usa username come ID documento
        }
    }

    // 2. Popola le domande
    const questions = await readCollection('questions');
    if (questions.length === 0) {
        for (const question of INITIAL_QUESTIONS) {
            await setDoc(doc(db, 'questions', String(question.id)), question);
        }
    }
    console.log("Dati Firebase inizializzati.");
  }, [readCollection]);


  // useEffect iniziale per inizializzare Firebase e caricare i dati
  useEffect(() => {
    document.title = "Security Quiz";
    const initApp = async () => {
        await seedFirebase();
        // Carica tutti gli utenti nel momento in cui l'app si avvia (serve all'admin)
        const usersList = await readCollection('users');
        setAllUsers(usersList); 
        setStage("login"); // Passa al login una volta pronti i dati
    };
    initApp();
  }, [seedFirebase, readCollection]);

  // --- Logica Principale (Modificata per essere asincrona) ---

  const submitQuiz = useCallback(async () => {
    if (!quizQuestions.length || !user?.username || !selectedCategory) return;
    
    let correct = 0;
    const wrongList = [];
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
      else wrongList.push({ ...q, chosen: answers[q.id] });
    });
    const percent = (correct / quizQuestions.length) * 100;
    const passed = percent >= 80;
    
    const historyRecord = {
        id: Date.now(),
        category: selectedCategory,
        correct,
        total: quizQuestions.length,
        percent: Math.round(percent),
        date: new Date().toISOString(),
        passed,
    };

    // AGGIORNARE FIREBASE: Recupera l'utente corrente e aggiorna il suo archivio
    const usersList = await readCollection('users');
    const currentUserDoc = usersList.find(u => u.username === user.username);

    if (currentUserDoc) {
        const updatedArchive = [...(currentUserDoc.archive || []), historyRecord];
        const userDocRef = doc(db, 'users', String(user.username));
        await updateDoc(userDocRef, { archive: updatedArchive });
        
        setUserHistory(updatedArchive); // Aggiorna stato locale
        // Aggiorna anche lo stato globale allUsers per l'admin view
        setAllUsers(prevUsers => prevUsers.map(u => u.username === user.username ? {...u, archive: updatedArchive} : u));
    }


    setResult({ correct, total: quizQuestions.length, percent, passed });
    setWrongAnswers(wrongList);
    setStage("result");
  }, [answers, quizQuestions, user, selectedCategory, readCollection]);

  useEffect(() => {
    if (stage === "quiz" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (stage === "quiz" && timeLeft === 0) {
      submitQuiz();
    }
  }, [stage, timeLeft, submitQuiz]);

  const handleLogin = async (username, password) => {
    const users = await readCollection('users'); // Legge da Firebase
    const userRec = users.find((u) => u.username === username && u.password === password);
    if (!userRec) return setMessage("Credenziali errate");
    if (userRec.disabled) return setMessage("Account disabilitato.");
    if (isExpired(userRec.expiresAt)) return setMessage(`Account scaduto il ${formatDate(userRec.expiresAt)}.`);
    
    setUser({ username: userRec.username, firstName: userRec.firstName, lastName: userRec.lastName});
    setAdminMode(userRec.username === "Admin");
    setUserHistory(userRec.archive || []); // Carica l'archivio

    // Non usiamo più localStorage per loggedBefore
    const welcomeMsg = `Bentornato/a, ${userRec.username}!`; 
    setMessage(welcomeMsg);
    
    setTimeout(() => {
        setMessage(""); 
    }, 3000); 

    setTimeout(() => setStage("menu"), 800);
  };

  const logout = () => {
    setUser(null);
    setStage("login");
    setMessage("");
    setAdminMode(false);
    setUserHistory([]);
  };

  // --- Inizio del NUOVO codice per il controllo attivo ---
 useEffect(() => {
    let intervalId = null;

    const checkUserStatus = async () => {
      if (user && user.username) {
        // Legge la lista utenti aggiornata
        const usersList = await readCollection('users');
        // Trova i dettagli dell'utente loggato
        const currentUserDoc = usersList.find(u => u.username === user.username);

        // Se l'utente esiste e risulta disabilitato nel DB
        if (currentUserDoc && currentUserDoc.disabled) {
          console.log("Account disattivato, esecuzione logout forzato.");
          alert("Il tuo account è stato disattivato. Verrai disconnesso.");
          logout(); // Chiama la funzione di logout esistente
        }
      }
    };

    // Avvia il controllo periodico solo se un utente è loggato
    if (user) {
        // Esegue il controllo subito al login, poi ogni 60 secondi
        checkUserStatus(); 
        intervalId = setInterval(checkUserStatus, 60000); // 60000ms = 1 minuto
    }

    // Funzione di pulizia: ferma l'intervallo quando il componente viene smontato o l'utente fa logout
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    
  }, [user, readCollection, logout]); // Dipendenze: riesegui quando user, readCollection o logout cambiano
  // --- Fine del NUOVO codice per il controllo attivo ---



  const startQuiz = async (category) => {
    setSelectedCategory(category);
    const allQuestions = await readCollection('questions'); // Legge le domande da Firebase
    const pool = allQuestions.filter((q) => q.category === category);
    if (!pool.length) return setStage("nodata");
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, Math.min(10, pool.length));
    setQuizQuestions(selected);
    setAnswers({});
    setCurrentIndex(0);
    setResult(null);
    setTimeLeft(600);
    setStage("quiz");
  };

  const chooseAnswer = (questionId, optionIndex) => setAnswers((a) => ({ ...a, [questionId]: optionIndex }));
  const goToQuestion = (idx) => {
    if (idx >= 0 && idx < quizQuestions.length) setCurrentIndex(idx);
  };
  const goToAdmin = () => {
    if (user?.username === "Admin") {
        setStage("admin");
    }
  };
  const goToUserStats = () => {
    setStage("userStats");
  };

  // --- Sub-Componenti (Header, Screens) ---

const Header = () => (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      {user && <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">Utente: {user.firstName} {user.lastName}</span>}
      
      {adminMode && stage !== "admin" && (
        <button onClick={goToAdmin} className="px-3 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">
            Gestione Utenti
        </button>
      )}

      <button onClick={logout} className="px-3 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">Logout</button>
    </div>
  );

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // ... (QuizScreen, ResultScreen, LoginScreen, MenuScreen, NoDataScreen, UserStatsScreen rimangono invariate) ...
  // NB: Controlla che ResultScreen non abbia il codice delle spiegazioni rimosso come richiesto prima.

  const ResultScreen = () => (
    <div className="min-h-screen p-6 flex items-center justify-center relative">
      <Header />
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow text-center">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {result?.passed ? (
            <span className="text-green-600">Test superato</span>
          ) : (
            <span className="text-red-600">Test non superato</span>
          )}
        </h2>
        <p className="mb-2">Hai risposto correttamente a {result?.correct} domande su {result?.total} ({Math.round(result?.percent)}%).</p>
        {wrongAnswers.length > 0 && (
          <div className="text-left mt-4 max-h-60 overflow-y-auto">
            <h3 className="font-semibold mb-2">Domande sbagliate:</h3>
            {wrongAnswers.map((w, i) => (
              <div key={i} className="mb-3 p-3 border rounded-lg bg-gray-50">
                <div className="font-medium">{w.text}</div>
                <div className="text-sm text-red-600">Risposta scelta: {w.options?.[w.chosen] ?? 'Nessuna risposta'}</div>
                <div className="text-sm text-green-700">Risposta corretta: {w.options?.[w.answer] ?? 'N/A'}</div>
              </div>
            ))}
          </div>
        )}
        <button onClick={() => setStage("menu")} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Torna al menu</button>
      </div>
    </div>
  );

  const LoginScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(username, password);
    };

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center">Security Quiz</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" />
            <button type="submit" className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Accedi</button>
          </form>
          {message && <p className={`mt-4 text-center text-sm ${message.includes('errate') || message.includes('scaduto') || message.includes('disabilitato') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>}
        </div>
      </div>
    );
  };

const MenuScreen = () => (
    <div className="min-h-screen p-6 relative">
      <Header />
      <div className="max-w-6xl mx-auto mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-center">Seleziona Categoria Quiz</h2>
        
        {userHistory.length > 0 && (
            <div className="text-center mb-6">
                <button onClick={goToUserStats} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md">
                    Visualizza le tue Statistiche
                </button>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> 
          {CATEGORIES.map((cat) => (
            <button 
                key={cat} 
                onClick={() => startQuiz(cat)} 
                className="w-full p-8 bg-white border rounded-lg shadow-lg hover:bg-gray-100 text-center text-lg font-medium transition duration-150" 
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {message && <p className="mt-4 text-center text-sm text-green-500">{message}</p>}
    </div>
  );

  const NoDataScreen = () => (
    <div className="min-h-screen p-6 flex items-center justify-center relative">
      <Header />
      <div className="bg-white p-8 rounded-2xl shadow text-center">
        <p>Nessuna domanda trovata per la categoria selezionata.</p>
        <button onClick={() => setStage("menu")} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Torna al menu</button>
      </div>
    </div>
  );

  const UserStatsScreen = () => {
    
    const statsByCategory = userHistory.reduce((acc, test) => {
        if (!acc[test.category]) {
            acc[test.category] = { totalTests: 0, totalPercent: 0, passedTests: 0 };
        }
        acc[test.category].totalTests++;
        acc[test.category].totalPercent += test.percent;
        if (test.passed) acc[test.category].passedTests++;
        return acc;
    }, {});

    const totalTests = userHistory.length;
    const overallAverage = totalTests > 0 ? (userHistory.reduce((sum, test) => sum + test.percent, 0) / totalTests) : 0;

    return (
        <div className="min-h-screen p-6 relative">
            <Header />
            <div className="max-w-4xl mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-semibold mb-4">Le Tue Statistiche di Allenamento</h2>
                
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                    <p className="text-lg">Test totali completati: **{totalTests}**</p>
                    <p className="text-lg">Percentuale media complessiva: **{Math.round(overallAverage)}%**</p>
                </div>

                <h3 className="font-semibold mt-6 mb-3">Progressi per Categoria:</h3>
                <div className="space-y-3">
                    {Object.entries(statsByCategory).map(([category, stats]) => (
                        <div key={category} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                            <p className="font-medium">{category}</p>
                            <p className="text-sm">
                                Media: **{Math.round(stats.totalPercent / stats.totalTests)}%** | 
                                Test Passati: {stats.passedTests} / {stats.totalTests}
                            </p>
                        </div>
                    ))}
                </div>

                <button onClick={() => setStage("menu")} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Torna al menu
                </button>
            </div>
        </div>
    );
  };


  const AdminScreen = () => {
    // AdminScreen ora usa allUsers che viene aggiornato globalmente
    // const [users, setUsers] = useState(readUsers()); <-- VECCHIO STATO LOCALE
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newExpiryDate, setNewExpiryDate] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    const [viewingHistoryOf, setViewingHistoryOf] = useState(null); 

    // Funzioni Admin modificate per usare Firebase
    const deleteUser = async (username) => {
        if (username === "Admin") {
            setAdminMessage("Non puoi eliminare l'account Admin principale.");
            return;
        }
        await deleteDoc(doc(db, 'users', String(username))); // Elimina da Firebase
        // Aggiorna lo stato locale globale
        setAllUsers(prevUsers => prevUsers.filter(u => u.username !== username));
        setAdminMessage(`Utente ${username} eliminato.`);
    };

const addUser = async (e) => {
    e.preventDefault();
    // 1. Aggiungiamo controlli di validazione per i nuovi campi
    if (!newUsername || !newPassword || !newFirstName || !newLastName) {
        return setAdminMessage("Inserisci username, password, nome e cognome.");
    }
    if (allUsers.some(u => u.username === newUsername)) return setAdminMessage("Username già esistente.");

    const expiryAtISO = newExpiryDate ? new Date(newExpiryDate).toISOString() : null;
    
    // 2. Includi firstName e lastName nel nuovo record utente
    const newUserRec = { 
        username: newUsername, 
        password: newPassword, 
        expiresAt: expiryAtISO, 
        disabled: false, 
        archive: [],
        firstName: newFirstName, // <--- Nuovo campo
        lastName: newLastName,   // <--- Nuovo campo
    };

    await setDoc(doc(db, 'users', String(newUsername)), newUserRec); // Aggiungi a Firebase
    // Aggiorna lo stato locale globale
    setAllUsers(prevUsers => [...prevUsers, newUserRec]);
    
    // 3. Resetta i campi del form dopo l'invio, inclusi i nuovi
    setNewUsername("");
    setNewPassword("");
    setNewExpiryDate("");
    setNewFirstName(""); // <--- Resetta
    setNewLastName("");  // <--- Resetta
    setAdminMessage(`Utente ${newUsername} aggiunto.`);
};
    
    const handleExpiryDateChange = async (username, newDateString) => {
        const newExpiry = newDateString ? new Date(newDateString).toISOString() : null;
        const userDocRef = doc(db, 'users', String(username));
        await updateDoc(userDocRef, { expiresAt: newExpiry }); // Aggiorna su Firebase

        // Aggiorna lo stato locale globale
        setAllUsers(prevUsers => prevUsers.map(u => u.username === username ? {...u, expiresAt: newExpiry} : u));
        setAdminMessage(`Scadenza per ${username} aggiornata.`);
    };

    const clearUserArchive = async (username) => {
        if (window.confirm(`Sei sicuro di voler cancellare l'intero archivio test per ${username}? Questa azione è irreversibile.`)) {
            const userDocRef = doc(db, 'users', String(username));
            await updateDoc(userDocRef, { archive: [] }); // Svuota archivio su Firebase

            // Aggiorna lo stato locale globale
            setAllUsers(prevUsers => prevUsers.map(u => u.username === username ? {...u, archive: []} : u));

            if (viewingHistoryOf && viewingHistoryOf.username === username) {
                setViewingHistoryOf(null); 
            }
            setAdminMessage(`Archivio per ${username} cancellato.`);
        }
    };

    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch (e) {
            return '';
        }
    };

    // UserHistoryModal rimane invariato (usa i dati passati via props)
    const UserHistoryModal = ({ userRec, onClose }) => {
        if (!userRec) return null;
        // ... (resto del codice del modale invariato) ...

        if (!userRec.archive || userRec.archive.length === 0) {
            return (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full">
                        <h3 className="text-xl font-semibold mb-4">Archivio Test di {userRec.username}</h3>
                        <p>Nessun test completato per questo utente.</p>
                        <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Chiudi</button>
                    </div>
                </div>
            );
        }
        
        const statsByCategory = userRec.archive.reduce((acc, test) => {
            if (!acc[test.category]) {
                acc[test.category] = { totalTests: 0, totalPercent: 0, passedTests: 0 };
            }
            acc[test.category].totalTests++;
            acc[test.category].totalPercent += test.percent;
            if (test.passed) acc[test.category].passedTests++;
            return acc;
        }, {});

        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-2xl font-semibold mb-4">Archivio Test di {userRec.username}</h3>
                    <h4 className="font-semibold mt-6 mb-2">Riepilogo per Categoria:</h4>
                    <div className="space-y-2 mb-6">
                        {Object.entries(statsByCategory).map(([category, stats]) => (
                            <div key={category} className="p-3 bg-gray-100 rounded-lg">
                                <p className="font-medium">{category}</p>
                                <p className="text-sm">Media Percentuale: **{Math.round(stats.totalPercent / stats.totalTests)}%** | Test Passati: {stats.passedTests} / {stats.totalTests}</p>
                            </div>
                        ))}
                    </div>
                    <h4 className="font-semibold mb-2">Tutti i Test Completati:</h4>
                    <ul className="space-y-3">
                        {[...userRec.archive].sort((a, b) => new Date(b.date) - new Date(a.date)).map((test) => (
                            <li key={test.id} className={`flex justify-between items-center p-3 border rounded-lg ${test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                <div>
                                    <p className="font-medium">{test.category}</p>
                                    <p className="text-xs text-gray-500">{formatDate(test.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{test.percent}%</p>
                                    <p className="text-sm">{test.correct}/{test.total} corretti</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button onClick={onClose} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Chiudi Archivio</button>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen p-6 relative">
            <Header />
            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="text-2xl font-semibold mb-6">Pannello Amministrazione Utenti</h2>
                
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h3 className="text-xl mb-4">Aggiungi Nuovo Utente</h3>
                    <form onSubmit={addUser} className="flex flex-wrap gap-4">
                        <input type="text" placeholder="Nome" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" required />
                       <input type="text" placeholder="Cognome" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" required />
                        <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" />
                        <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" />
                        <input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" title="Data di scadenza (lascia vuoto per illimitato)" />
                        <button type="submit" className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Aggiungi</button>
                    </form>
                    {adminMessage && <p className={`mt-4 text-sm ${adminMessage.includes('eliminato') || adminMessage.includes('aggiunto') || adminMessage.includes('aggiornata') ? 'text-green-500' : 'text-red-500'}`}>{adminMessage}</p>}
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl mb-4">Elenco Utenti</h3>
                    <ul className="space-y-3">
                        {allUsers.map((u) => ( // Usa allUsers qui
                            <li key={u.username} className="flex flex-wrap items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex-grow mb-2 md:mb-0">
                                    <span className="font-medium">{u.firstName} {u.lastName}</span>
                                    <p className={`text-xs mt-0.5 ${isExpired(u.expiresAt) ? 'text-red-500' : 'text-gray-500'}`}>
                                        Stato: {isExpired(u.expiresAt) ? 'Scaduto' : 'Attivo'}
                                    </p>
                                </div>
                                
                                {u.username !== "Admin" && (
                                    <div className="flex items-center gap-2 mb-2 md:mb-0 mr-4">
                                        <label className="text-sm">Scadenza:</label>
                                        <input 
                                            type="date" 
                                            value={formatDateForInput(u.expiresAt)}
                                            onChange={(e) => handleExpiryDateChange(u.username, e.target.value)}
                                            className="p-2 border rounded-lg text-sm w-[150px]"
                                            title="Modifica la data di scadenza"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 mr-2">
                                    <button onClick={() => setViewingHistoryOf(u)} className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white">
                                        Archivio ({u.archive?.length || 0})
                                    </button>
                                    
                                    {u.archive?.length > 0 && (
                                        <button onClick={() => clearUserArchive(u.username)} className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white" title="Cancella archivio utente">
                                            Cancella Arch.
                                        </button>
                                    )}
                                </div>
                                

                                <button onClick={() => deleteUser(u.username)} disabled={u.username === "Admin"} className={`px-3 py-1 text-white rounded-lg ${u.username === "Admin" ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
                                    Elimina
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <button onClick={() => setStage("menu")} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Torna al menu</button>
            </div>
            
            {viewingHistoryOf && (
                <UserHistoryModal 
                    userRec={viewingHistoryOf} 
                    onClose={() => setViewingHistoryOf(null)} 
                />
            )}
        </div>
    );
  };

const QuizScreen = () => {
    const q = quizQuestions[currentIndex];
    if (!q) return null;

    const isEndingSoon = timeLeft <= 60;

    return (
      <div className="min-h-screen p-6 relative">
        <Header />
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <h3 className="text-lg font-semibold mb-3">Domanda {currentIndex + 1} di {quizQuestions.length}</h3>
            <div className="p-4 rounded-xl border bg-gray-50 mb-4">
              <div className="mb-4 text-center font-medium">{q.text}</div>
              {q.options.map((opt, idx) => (
                <label key={idx} className={`block p-3 rounded-xl border mb-2 ${answers[q.id] === idx ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
                  <input type="radio" name={`q_${q.id}`} checked={answers[q.id] === idx} onChange={() => chooseAnswer(q.id, idx)} /> <span className="ml-2">{opt}</span>
                </label>
              ))}
            </div>
            <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
              <button onClick={() => goToQuestion(currentIndex - 1)} disabled={currentIndex === 0} className="px-3 py-2 rounded-lg border">Precedente</button>
              <div className={`text-sm font-semibold ${isEndingSoon ? 'text-red-600 animate-pulse' : 'text-indigo-700'}`}>⏱️ Tempo rimanente: {formatTime(timeLeft)}</div>
              <button onClick={() => goToQuestion(currentIndex + 1)} disabled={currentIndex === quizQuestions.length - 1} className="px-3 py-2 rounded-lg border">Successiva</button>
              <button type="button" onClick={submitQuiz} className="px-3 py-2 rounded-lg bg-indigo-50 border">Concludi Test</button>
            </div>
          </div>
          {q.image && (
            <div className="w-full md:w-1/3 flex items-center justify-center">
              <img src={q.image} alt="Immagine di supporto" className="rounded-xl border object-contain w-full h-auto" />
            </div>
          )}
        </div>
      </div>
    );
  };


  const renderStage = () => {
    switch (stage) {
      case "loading": // Schermata di caricamento mentre si connette a Firebase
        return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl">Caricamento dati...</h1></div>;
      case "login":
        return <LoginScreen />;
      case "menu":
        return <MenuScreen />;
      case "quiz":
        return <QuizScreen />;
      case "result":
        return <ResultScreen />;
      case "nodata":
        return <NoDataScreen />;
      case "admin":
        return <AdminScreen />;
      case "userStats":
        return <UserStatsScreen />;
      default:
        return <LoginScreen />;
    }
  };

   return (
    <div className="font-sans min-h-screen"> 
        <div className="bg-[url('/images/background.jpg')] bg-cover bg-center bg-fixed min-h-screen">
             {renderStage()}
        </div>
    </div>
  );
}

export default SecurityQuiz;
