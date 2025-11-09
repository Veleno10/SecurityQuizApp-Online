import React, { useState, useEffect, useCallback } from "react";

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
  const [adminMode, setAdminMode] = useState(false);
  const [userHistory, setUserHistory] = useState([]); 

  const USERS_KEY = "sq_users_v1";

  // --- Funzioni Helper per Dati e Utenti ---

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
      category: "Esercitazione Teoria Generale",
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
{
      id: 3,
      category: "Esercitazione Categoria A1",
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
{
      id: 4,
      category: "Esercitazione Categoria A2",
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
{
      id: 5,
      category: "Esercitazione Categoria A4",
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
{
      id: 6,
      category: "Esercitazione Categoria A5",
      text: "Quanto fa 5 + 3?",
      options: ["6", "8", "9"],
      answer: 1,
      image: "/images/Tesserinoverde235.png",
    },
     // Aggiungi qui tutte le tue altre domande
  ];

  const saveUsers = (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error("Errore nel salvataggio utenti", e);
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
      { username: "Admin", password: "Admin", expiresAt: null, disabled: false, archive: [] },
      { username: "TestUser", password: "password", expiresAt: addDays(now, -3).toISOString(), disabled: false, archive: [] },
    ];
    saveUsers(users);
  }, []);

  // --- Logica Principale del Componente ---

  useEffect(() => {
    document.title = "Security Quiz";
    seedUsers();
  }, [seedUsers]);

  const submitQuiz = useCallback(() => {
    if (!quizQuestions.length || !user?.username) return;
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

    const users = readUsers();
    const updatedUsers = users.map(u => {
        if (u.username === user.username) {
            return { ...u, archive: [...(u.archive || []), historyRecord] };
        }
        return u;
    });
    saveUsers(updatedUsers);
    
    setUserHistory(prev => [...prev, historyRecord]); 

    setResult({ correct, total: quizQuestions.length, percent, passed });
    setWrongAnswers(wrongList);
    setStage("result");
  }, [answers, quizQuestions, user, selectedCategory, readUsers]);

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
    setAdminMode(userRec.username === "Admin");
    setUserHistory(userRec.archive || []); 

    const firstLogin = !localStorage.getItem("loggedBefore");
    const welcomeMsg = firstLogin ? `Benvenuto/a, ${userRec.username}!` : `Bentornato/a, ${userRec.username}!`;
    setMessage(welcomeMsg);
    localStorage.setItem("loggedBefore", true);
    
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

  const startQuiz = (category) => {
    setSelectedCategory(category);
    const pool = ALL_QUESTIONS.filter((q) => q.category === category);
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

  // --- Sub-Componenti (Header, Screens) ---

const Header = () => (
    <div className="absolute top-4 right-4 flex items-center gap-3">
      {user && <span className="text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">Utente: {user.username}</span>}
      
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

  const AdminScreen = () => {
    const [users, setUsers] = useState(readUsers());
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newExpiryDate, setNewExpiryDate] = useState("");
    const [adminMessage, setAdminMessage] = useState("");
    const [viewingHistoryOf, setViewingHistoryOf] = useState(null); 

    const refreshUsers = () => setUsers(readUsers());

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

    const addUser = (e) => {
        e.preventDefault();
        if (!newUsername || !newPassword) return setAdminMessage("Inserisci username e password.");
        if (users.some(u => u.username === newUsername)) return setAdminMessage("Username già esistente.");

        const expiryAtISO = newExpiryDate ? new Date(newExpiryDate).toISOString() : null;

        const updatedUsers = [
            ...users, 
            { username: newUsername, password: newPassword, expiresAt: expiryAtISO, disabled: false, archive: [] }
        ];
        saveUsers(updatedUsers);
        refreshUsers();
        setNewUsername("");
        setNewPassword("");
        setNewExpiryDate("");
        setAdminMessage(`Utente ${newUsername} aggiunto.`);
    };
    
    const handleExpiryDateChange = (username, newDateString) => {
        const updatedUsers = users.map(u => {
            if (u.username === username) {
                const newExpiry = newDateString ? new Date(newDateString).toISOString() : null;
                return { ...u, expiresAt: newExpiry };
            }
            return u;
        });
        saveUsers(updatedUsers);
        setUsers(updatedUsers); 
        setAdminMessage(`Scadenza per ${username} aggiornata.`);
    };

    // NUOVA FUNZIONE: Cancella l'archivio di un utente
    const clearUserArchive = (username) => {
        if (window.confirm(`Sei sicuro di voler cancellare l'intero archivio test per ${username}? Questa azione è irreversibile.`)) {
            const updatedUsers = users.map(u => {
                if (u.username === username) {
                    return { ...u, archive: [] }; // Svuota l'array archive
                }
                return u;
            });
            saveUsers(updatedUsers);
            setUsers(updatedUsers); // Aggiorna lo stato locale per il re-render
            // Se l'admin sta visualizzando l'archivio dell'utente che sta cancellando, chiudi il modale
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
            return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
        } catch (e) {
            return '';
        }
    };

    const UserHistoryModal = ({ userRec, onClose }) => {
        if (!userRec) return null;

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
                        {users.map((u) => (
                            <li key={u.username} className="flex flex-wrap items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex-grow mb-2 md:mb-0">
                                    <span className="font-medium">{u.username}</span>
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
      case "admin":
        return <AdminScreen />;
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
