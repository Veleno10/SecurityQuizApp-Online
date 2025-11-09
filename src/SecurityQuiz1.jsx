import React, { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
    "Esercitazione Teoria Generale",
    "Esercitazione Categoria A1",
    "Esercitazione Categoria A2",
    "Esercitazione Categoria A3",
    "Esercitazione Categoria A4",
    "Esercitazione Categoria A5",
    "Esercitazione Lingua Inglese",
  ];

  const ALL_QUESTIONS = [
    {
      id: 2,
      category: "Esercitazione Teoria G", // Corretto il nome della categoria
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
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
     // Aggiungi qui tutte le tue altre domande
  ];

function SecurityQuiz() {
  const [stage, setStage] = useState("login");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [adminMode, setAdminMode] = useState(false); // Nuovo stato per l'admin

  const USERS_KEY = "sq_users_v1";
  const RESULTS_KEY = "sq_results_v1"; // Nuova chiave per i risultati

  // --- Funzioni Helper per Dati e Utenti ---

  

  const saveUsers = (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Errore nel salvataggio utenti", e);
    }
  };

// NUOVE FUNZIONI PER I RISULTATI DEI TEST
  const readTestResults = useCallback(() => {
      try {
          return JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]");
      } catch (e) {
          console.error("Errore lettura risultati test", e);
          return [];
      }
  }, []);

  const saveTestResult = (result) => {
      try {
          const allResults = readTestResults();
          const updatedResults = [...allResults, result];
          localStorage.setItem(RESULTS_KEY, JSON.stringify(updatedResults));
      } catch (e) {
          console.error("Errore nel salvataggio risultato test", e);
      }
  };

  const readUsers = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    } catch (e) {
      console.error("Errore lettura utenti", e);
      return [];
    }
  }, []);

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

  const seedUsers = useCallback(() => {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) return;
    const now = new Date();
    const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
    const users = [
      { username: "Admin", password: "Admin", expiresAt: null, disabled: false },
      { username: "TestUser", password: "password", expiresAt: addDays(now, -3).toISOString(), disabled: false },
    ];
    saveUsers(users);
  }, []);

  // --- Logica Principale del Componente ---

  useEffect(() => {
    document.title = "Security Quiz";
    seedUsers();
  }, [seedUsers]);

  const submitQuiz = useCallback(() => {
    if (!quizQuestions.length) return;
    let correct = 0;
    const wrongList = [];
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.answer) correct++;
      else wrongList.push({ ...q, chosen: answers[q.id] });
    });
    const percent = (correct / quizQuestions.length) * 100;
    const passed = percent >= 80;

 // --- INIZIO NUOVA LOGICA DI SALVATAGGIO ---
    if (user?.username) { // Assicurati che un utente sia loggato
        const testResult = {
            username: user.username,
            category: selectedCategory, // Aggiunto anche selectedCategory nello stato
            correct,
            total: quizQuestions.length,
            percent,
            passed,
            date: new Date().toISOString()
        };
        saveTestResult(testResult);
    }
    // --- FINE NUOVA LOGICA DI SALVATAGGIO ---

    setResult({ correct, total: quizQuestions.length, percent, passed });
    setWrongAnswers(wrongList);
    setStage("result");
  }, [answers, quizQuestions, user, selectedCategory]);

  useEffect(() => {
    if (stage === "quiz" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
    if (stage === "quiz" && timeLeft === 0) {
      submitQuiz();
    }
  }, [stage, timeLeft, submitQuiz]);

  const handleLogin = (username, password) => {
    const users = readUsers();
    const userRec = users.find((u) => u.username === username && u.password === password);
    if (!userRec) return setMessage("Credenziali errate");
    if (userRec.disabled) return setMessage("Account disabilitato.");
    if (isExpired(userRec.expiresAt)) return setMessage(`Account scaduto il ${formatDate(userRec.expiresAt)}.`);
    
    setUser({ username: userRec.username });
    setAdminMode(userRec.username === "Admin"); // Imposta adminMode
    
     const firstLogin = !localStorage.getItem("loggedBefore");
    const welcomeMsg = firstLogin ? `Benvenuto/a, ${userRec.username}!` : `Bentornato/a, ${userRec.username}!`;
    setMessage(welcomeMsg);
    localStorage.setItem("loggedBefore", true);
    
    // MODIFICA QUI: Nasconde il messaggio dopo 3 secondi
    setTimeout(() => {
        setMessage(""); 
    }, 3000); // Il messaggio scompare dopo 3000 millisecondi (3 secondi)

    // Passa alla schermata del menu dopo 0.8 secondi (come prima)
    setTimeout(() => setStage("menu"), 800);
  };

  const logout = () => {
    setUser(null);
    setStage("login");
    setMessage("");
    setAdminMode(false); // Resetta adminMode
  };

  const startQuiz = (category) => {
    setSelectedCategory(category);
    const pool = ALL_QUESTIONS.filter((q) => q.category === category);
    if (!pool.length) return setStage("nodata");
    const selected = pool.sort(() => Math.random() - 0.5).slice(0, 10);
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

  // Funzione per navigare alla schermata admin
  const goToAdmin = () => {
    if (user?.username === "Admin") {
        setStage("admin");
    }
  };

  // --- Sub-Componenti (Header, Screens) ---

const Header = () => (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      {user && <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">Utente: {user.username}</span>}
      
      {/* MODIFICA AGGIUNTA: Tasto Gestione Utenti nell'Header */}
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

  // Resto di QuizScreen, ResultScreen, LoginScreen... (rimangono invariati rispetto al codice originale)

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
          <div className="text-left mt-4">
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
        
        {/* MODIFICA: Rimosso il blocco del pulsante Admin da qui */}
        {/* ... */}

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

  // --- Nuovo Componente AdminScreen ---
  // Questa schermata ha un suo layout, ma usa l'Header originale
 // Nel tuo file SecurityQuiz.js, trova e sostituisci la funzione AdminScreen:

const AdminScreen = ({ readUsers, saveUsers, formatDate, isExpired, setStage, logout}) => {
    const [users, setUsers] = useState(readUsers());
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newExpiryDate, setNewExpiryDate] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    // Nuovo stato per tenere traccia dell'utente che stiamo modificando
    const [allTestResults, setAllTestResults] = useState(readTestResults()); 
    const [selectedUserForResults, setSelectedUserForResults] = useState(null); 
    const [filterCategory, setFilterCategory] = useState("Tutte le categorie"); 
    console.log("Utente selezionato per risultati:", selectedUserForResults);
    console.log("Utente selezionato per risultati:", selectedUserForResults, typeof selectedUserForResults);  
    //const [editingUser, setEditingUser] = useState(null); 

    const refreshUsers = () => {
        setUsers(readUsers());
        setAllTestResults(readTestResults()); // Aggiorna anche i risultati
    };

    const deleteUser = (username) => {
        if (username === "Admin") {
            setAdminMessage("Non puoi eliminare l'account Admin principale.");
            return;
        }
        const updatedUsers = users.filter(u => u.username !== username);
        saveUsers(updatedUsers);
        refreshUsers();
        setAdminMessage(`Utente ${username} eliminato.`);
    };

{/* NUOVA SEZIONE: Visualizzazione Archivio Test Selezionato */}
{selectedUserForResults && (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl">Archivio Test per: {selectedUserForResults}</h3>

            {/* MENU A TENDINA PER FILTRARE */}
            <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className="p-2 border rounded-lg"
            >
                <option value="Tutte le categorie">Tutte le categorie</option>
                {/* Usa la costante CATEGORIES definita nel componente padre */}
                {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

        </div>

        {/* Logica di Filtraggio */}
        {(() => {
            let filteredResults = allTestResults.filter(r => r.username === selectedUserForResults);

            if (filterCategory !== "Tutte le categorie") {
                filteredResults = filteredResults.filter(r => r.category === filterCategory);
            }

            filteredResults.sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordina dal più recente

            if (filteredResults.length > 0) {
                return (
                    <>
                        <ul className="space-y-3">
                            {filteredResults.map((result, i) => (
                                <li key={i} className={`p-3 border rounded-lg ${result.passed ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
                                    <p>Data: {formatDate(result.date)}</p>
                                    <p>Categoria: {result.category}</p>
                                    <p>Risultato: {result.correct} / {result.total} ({Math.round(result.percent)}%)</p>
                                    <p className="font-semibold">Esito: {result.passed ? 'Superato ✅' : 'Non Superato ❌'}</p>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setSelectedUserForResults(null)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Chiudi Archivio</button>
                    </>
                );
            } else {
                return (
                    <>
                        <p>Nessun test registrato per questo utente o per questa categoria.</p>
                        <button onClick={() => setSelectedUserForResults(null)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Chiudi Archivio</button>
                    </>
                );
            }
        })()}

    </div>
)}
{/* FINE NUOVA SEZIONE */}

    const addUser = (e) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return setAdminMessage("Inserisci username e password.");
        if (users.some(u => u.username === newUsername)) return setAdminMessage("Username già esistente.");

        const expiryAtISO = newExpiryDate ? new Date(newExpiryDate).toISOString() : null;

        const updatedUsers = [
            ...users, 
            { username: newUsername, password: newPassword, expiresAt: expiryAtISO, disabled: false }
        ];
        saveUsers(updatedUsers);
        refreshUsers();
        setNewUsername("");
        setNewPassword("");
        setNewExpiryDate("");
        setAdminMessage(`Utente ${newUsername} aggiunto.`);
    };

    // NUOVA FUNZIONE: Salva la modifica della data di scadenza
    const handleExpiryDateChange = (username, newDateString) => {
        const updatedUsers = users.map(u => {
            if (u.username === username) {
                // Salva come stringa ISO o null se la data è vuota
                const newExpiry = newDateString ? new Date(newDateString).toISOString() : null;
                return { ...u, expiresAt: newExpiry };
            }
            return u;
        });
        saveUsers(updatedUsers);
        setUsers(updatedUsers); // Aggiorna lo stato locale per il re-render
        setAdminMessage(`Scadenza per ${username} aggiornata.`);
    };

    // Helper per formattare la data per l'input type="date" (YYYY-MM-DD)
    const formatDateForInput = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            // Assicura il formato YYYY-MM-DD
            return date.toISOString().split('T')[0]; 
        } catch (e) {
            return '';
        }
    };


    return (
        <div className="min-h-screen p-6 relative">
            <Header />
            <div className="max-w-4xl mx-auto mt-12">
                <h2 className="text-2xl font-semibold mb-6">Pannello Amministrazione Utenti</h2>
                
                {/* Sezione Aggiungi Utente (invariata) */}
                <div className="bg-white p-6 rounded-xl shadow mb-8">
                    <h3 className="text-xl mb-4">Aggiungi Nuovo Utente</h3>
                    <form onSubmit={addUser} className="flex flex-wrap gap-4">
                        <input type="text" placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" />
                        <input type="password" placeholder="Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" />
                        <input type="date" value={newExpiryDate} onChange={(e) => setNewExpiryDate(e.target.value)} className="p-3 border rounded-lg flex-grow w-full md:w-auto" title="Data di scadenza (lascia vuoto per illimitato)" />
                        <button type="submit" className="p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Aggiungi</button>
                    </form>
                    {adminMessage && <p className={`mt-4 text-sm ${adminMessage.includes('eliminato') || adminMessage.includes('aggiunto') || adminMessage.includes('aggiornata') ? 'text-green-500' : 'text-red-500'}`}>{adminMessage}</p>}
                </div>

                {/* Sezione Elenco Utenti (modificata) */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl mb-4">Elenco Utenti</h3>
                    <ul className="space-y-3">
                        {users.map((u) => (
                            <li key={u.username} className="flex flex-wrap items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex-grow mb-2 md:mb-0">
                                    <span className="font-medium">{u.username}</span>
                                    <p className={`text-xs mt-0.5 ${isExpired(u.expiresAt) ? 'text-red-500' : 'text-gray-500'}`}>
                                        Stato: {isExpired(u.expiresAt) ? 'Scaduto' : 'Attivo'}
                                    </p>
                                </div>
                                
                                {/* Campo Modifica Scadenza inline */}
                                {u.username !== "Admin" && (
                                    <div className="flex items-center gap-2 mb-2 md:mb-0">
                                        <label className="text-sm">Scadenza:</label>
                                        <input 
                                            type="date" 
                                            value={formatDateForInput(u.expiresAt)}
                                            onChange={(e) => handleExpiryDateChange(u.username, e.target.value)}
                                            className="p-2 border rounded-lg text-sm"
                                            title="Modifica la data di scadenza"
                                        />
                                    </div>
                                )}

                                {/* NUOVO BOTTONE: Visualizza Archivio Test */}
                                <button onClick={() => setSelectedUserForResults(u.username)} className="px-3 py-1 mr-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                                    Archivio Test
                                </button>


                                <button onClick={() => deleteUser(u.username)} disabled={u.username === "Admin"} className={`px-3 py-1 text-white rounded-lg ${u.username === "Admin" ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
                                    Elimina
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

 {/* NUOVA SEZIONE: Visualizzazione Archivio Test Selezionato */}
                {selectedUserForResults && (
                    <div className="bg-white p-6 rounded-xl shadow mt-8">
                        <h3 className="text-xl mb-4">Archivio Test per: {selectedUserForResults}</h3>
                        {/* Filtra i risultati per l'utente selezionato */}
                        {allTestResults.filter(r => r.username === selectedUserForResults).length > 0 ? (
                            <ul className="space-y-3">
                                {allTestResults
                                    .filter(r => r.username === selectedUserForResults)
                                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Ordina dal più recente
                                    .map((result, i) => (
                                        <li key={i} className={`p-3 border rounded-lg ${result.passed ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'}`}>
                                            <p>Data: {formatDate(result.date)}</p>
                                            <p>Categoria: {result.category}</p>
                                            <p>Risultato: {result.correct} / {result.total} ({Math.round(result.percent)}%)</p>
                                            <p className="font-semibold">Esito: {result.passed ? 'Superato ✅' : 'Non Superato ❌'}</p>
                                        </li>
                                    ))}
                            </ul>
                        ) : (
                            <p>Nessun test registrato per questo utente.</p>
                        )}
                        <button onClick={() => setSelectedUserForResults(null)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Chiudi Archivio</button>
                    </div>
                )}
                {/* FINE NUOVA SEZIONE */}

                <button onClick={() => setStage("menu")} className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Torna al menu</button>
            </div>
        </div>
    );
};

  // --- Fine Nuovo Componente AdminScreen ---


  // --- Render Stage ---
  const renderStage = () => {
    switch (stage) {
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
      case "admin": // Aggiunto il caso per AdminScreen
        return (
        <AdminScreen 
            // ... (altre props) ...
            readUsers={readUsers}
            saveUsers={saveUsers}
            formatDate={formatDate}
            isExpired={isExpired}
            setStage={setStage}
            logout={logout}
            // CATEGORIES={CATEGORIES}
        />
    );
      default:
        return <LoginScreen />;
    }
  };

   return (
    <div className="font-sans min-h-screen"> 
        {/*
          Applichiamo lo sfondo usando classi Tailwind:
          bg-[url('/images/miobgsfondo.jpg')] -> Specifica l'URL dell'immagine
          bg-cover                      -> Copre l'intera area senza ripetersi
          bg-center                     -> Centra l'immagine
          bg-fixed                      -> (Opzionale) Mantiene lo sfondo fisso durante lo scroll
        */}
        <div className="bg-[url('/images/background.jpg')] bg-cover bg-center bg-fixed min-h-screen">
             {renderStage()}
        </div>
    </div>
  );
}

export default SecurityQuiz;
