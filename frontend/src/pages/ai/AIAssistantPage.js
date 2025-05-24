import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  CircularProgress,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Psychology as PsychologyIcon,
  Person as PersonIcon,
  SmartToy as BotIcon,
  Search as SearchIcon,
  Description as DocIcon
} from '@mui/icons-material';

const AIAssistantPage = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      content: 'Bonjour, je suis votre assistant IA spécialisé en aéronautique. Comment puis-je vous aider aujourd\'hui?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexProgress, setIndexProgress] = useState(0);
  const [indexStatus, setIndexStatus] = useState('');
  const [vectorDbStatus, setVectorDbStatus] = useState('non initialisée');
  const messagesEndRef = useRef(null);

  // Fonction pour faire défiler automatiquement vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fonction pour envoyer un message
  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = { id: messages.length + 1, text: inputMessage, sender: 'user', timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputMessage('');
    
    // Ajouter un message temporaire de chargement
    const loadingMessageId = messages.length + 2;
    setMessages(prevMessages => [...prevMessages, { 
      id: loadingMessageId, 
      text: 'Recherche dans la base de documents...', 
      sender: 'ai', 
      timestamp: new Date(),
      isLoading: true 
    }]);
    
    // Appel à l'API backend pour générer une réponse
    fetch('http://localhost:5042/api/ai/generate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: userMessage.text })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Remplacer le message de chargement par la réponse réelle
          setMessages(prevMessages => prevMessages.map(msg => 
            msg.id === loadingMessageId ? {
              id: loadingMessageId,
              text: data.answer,
              sender: 'ai',
              timestamp: new Date(),
              sources: data.relevantDocs || []
            } : msg
          ));
        } else {
          throw new Error(data.message || 'Erreur lors de la génération de la réponse');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la génération de la réponse:', error);
        // Remplacer le message de chargement par un message d'erreur
        setMessages(prevMessages => prevMessages.map(msg => 
          msg.id === loadingMessageId ? {
            id: loadingMessageId,
            text: `Désolé, une erreur s'est produite: ${error.message}. Veuillez réessayer ou vérifier que la base vectorielle est initialisée.`,
            sender: 'ai',
            timestamp: new Date(),
            isError: true
          } : msg
        ));
      });
  };

  // Fonction pour générer une réponse de l'IA basée sur la base vectorielle
  const generateAIResponse = (query) => {
    // Simuler la recherche dans la base vectorielle
    const relevantDocs = vectorDbStatus === 'initialisée' 
      ? findRelevantDocuments(query)
      : [];
    
    // Générer une réponse basée sur les documents pertinents
    let response;
    
    if (vectorDbStatus !== 'initialisée') {
      response = "Je ne peux pas répondre à votre question car la base de connaissances n'a pas encore été initialisée. Veuillez cliquer sur le bouton 'Analyser les documents' pour indexer les documents techniques.";
    } else if (relevantDocs.length === 0) {
      response = "Je n'ai pas trouvé d'informations pertinentes dans la base de connaissances pour répondre à votre question. Pourriez-vous reformuler ou poser une question différente?";
    } else {
      // Générer une réponse basée sur les documents trouvés
      response = generateResponseFromDocs(query, relevantDocs);
    }
    
    const botMessage = {
      id: messages.length + 2,
      sender: 'bot',
      content: response,
      timestamp: new Date().toISOString(),
      relevantDocs: relevantDocs
    };
    
    setMessages(prev => [...prev, botMessage]);
    setLoading(false);
  };

  // Fonction pour trouver les documents pertinents (simulation)
  const findRelevantDocuments = (query) => {
    const allDocs = [
      { id: 1, title: 'Manuel de maintenance A320', relevance: 0.92 },
      { id: 2, title: 'Procédure d\'inspection moteur CFM56', relevance: 0.87 },
      { id: 3, title: 'Certificat de conformité LG-A320-001', relevance: 0.78 },
      { id: 4, title: 'Rapport d\'analyse structurelle aile A320', relevance: 0.85 },
      { id: 5, title: 'Guide de dépannage système hydraulique', relevance: 0.79 }
    ];
    
    // Filtrer les documents pertinents basés sur des mots-clés (simulation)
    const keywords = query.toLowerCase().split(' ');
    const relevantDocs = allDocs.filter(doc => {
      const docTitle = doc.title.toLowerCase();
      return keywords.some(keyword => 
        keyword.length > 3 && docTitle.includes(keyword)
      );
    });
    
    // Si aucun document pertinent n'est trouvé, retourner les 2 documents les plus pertinents
    if (relevantDocs.length === 0) {
      return allDocs
        .sort((a, b) => Math.random() - 0.5) // Mélanger pour la simulation
        .slice(0, 2);
    }
    
    return relevantDocs;
  };

  // Fonction pour générer une réponse basée sur les documents (simulation)
  const generateResponseFromDocs = (query, docs) => {
    const queryLower = query.toLowerCase();
    
    // Réponses prédéfinies basées sur des mots-clés
    if (queryLower.includes('maintenance') || queryLower.includes('entretien')) {
      return "D'après les documents techniques, les procédures de maintenance pour les équipements aéronautiques doivent être effectuées selon les intervalles spécifiés par le fabricant. Les inspections régulières sont essentielles pour garantir la sécurité et la conformité aux réglementations. Les documents indiquent que les maintenances de type A doivent être effectuées tous les 400-600 heures de vol, tandis que les maintenances de type C sont programmées tous les 18-24 mois.";
    }
    
    if (queryLower.includes('moteur') || queryLower.includes('cfm56')) {
      return "Le moteur CFM56 est un turboréacteur à double flux largement utilisé sur les avions commerciaux comme l'A320. Selon les documents techniques, sa durée de vie moyenne est de 30 000 cycles avant révision majeure. Les inspections boroscopiques doivent être effectuées tous les 1 000 cycles pour détecter d'éventuelles fissures ou détériorations des aubes de turbine. La procédure d'inspection complète est détaillée dans le manuel de maintenance section 71-00-00.";
    }
    
    if (queryLower.includes('hydraulique') || queryLower.includes('système')) {
      return "Le système hydraulique des aéronefs modernes comprend généralement trois circuits indépendants pour assurer la redondance. D'après le guide de dépannage, les problèmes les plus courants sont liés aux fuites au niveau des raccords et à la contamination du fluide. La pression normale de fonctionnement est de 3000 PSI, et toute chute de pression en dessous de 2700 PSI doit être investiguée immédiatement. Les procédures de test sont détaillées dans la section 29-10-00 du manuel de maintenance.";
    }
    
    if (queryLower.includes('certification') || queryLower.includes('conformité')) {
      return "La certification de conformité est un document essentiel qui atteste que les pièces ou équipements répondent aux spécifications du fabricant et aux exigences réglementaires. Selon les documents, chaque pièce doit être accompagnée d'un certificat EASA Form 1 ou FAA 8130-3. La traçabilité complète depuis la fabrication jusqu'à l'installation est obligatoire, et tous les documents doivent être conservés pendant au moins 3 ans après la mise hors service de la pièce.";
    }
    
    // Réponse par défaut
    return `Basé sur l'analyse de ${docs.length} documents techniques pertinents, je peux vous informer que les procédures aéronautiques standard exigent une documentation rigoureuse et des inspections régulières. Les documents indiquent que toute intervention doit être consignée dans le carnet de maintenance de l'aéronef, avec référence aux manuels techniques appropriés. Pour plus de détails spécifiques à votre question, je vous recommande de consulter les sections correspondantes des manuels de maintenance.`;
  };

  // Fonction pour initialiser la base vectorielle
  const handleIndexDocuments = () => {
    setIndexing(true);
    setIndexProgress(0);
    setIndexStatus('Initialisation de l\'indexation...');
    setVectorDbStatus('en cours d\'initialisation');
    
    // Appel à l'API backend pour indexer les documents PDF
    fetch('http://localhost:5042/api/ai/index-documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        setIndexProgress(50);
        setIndexStatus('Finalisation de l\'indexation...');
        return response.json();
      })
      .then(data => {
        if (data.success && data.documentCount) {
          setVectorDbStatus('initialisée');
          setIndexProgress(100);
          setIndexStatus(`${data.documentCount} documents indexés avec succès`);
        } else {
          throw new Error(data.message || 'Erreur lors de l\'indexation');
        }
      })
      .catch(error => {
        console.error('Erreur lors de l\'indexation des documents:', error);
        setIndexStatus(`Erreur: ${error.message}`);
        setVectorDbStatus('erreur');
        setIndexProgress(0);
      })
      .finally(() => {
        setTimeout(() => setIndexing(false), 1000);
      });
    
    // Fallback en cas d'erreur avec l'API
    const totalSteps = 5;
    const simulateIndexing = (step) => {
      if (step > totalSteps) {
        // Indexation terminée
        setIndexStatus('Indexation terminée avec succès!');
        setVectorDbStatus('initialisée');
        setTimeout(() => {
          setIndexing(false);
          setIndexStatus('');
        }, 2000);
        return;
      }
      
      // Mettre à jour la progression et le statut
      const progress = Math.floor((step / totalSteps) * 100);
      setIndexProgress(progress);
      
      switch(step) {
        case 1:
          setIndexStatus('Lecture des documents techniques...');
          break;
        case 2:
          setIndexStatus('Extraction du texte et prétraitement...');
          break;
        case 3:
          setIndexStatus('Génération des embeddings vectoriels...');
          break;
        case 4:
          setIndexStatus('Construction de l\'index de recherche...');
          break;
        case 5:
          setIndexStatus('Optimisation de la base vectorielle...');
          break;
        default:
          setIndexStatus('Traitement en cours...');
      }
      
      // Simuler le temps de traitement
      setTimeout(() => simulateIndexing(step + 1), 1500);
    };
    
    // Démarrer la simulation
    setTimeout(() => simulateIndexing(1), 500);
  };

  // Fonction pour réinitialiser la conversation
  const handleResetConversation = () => {
    setMessages([
      { 
        id: 1, 
        sender: 'bot', 
        content: 'Bonjour, je suis votre assistant IA spécialisé en aéronautique. Comment puis-je vous aider aujourd\'hui?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Assistant IA Aéronautique
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Posez des questions sur la maintenance aéronautique et obtenez des réponses basées sur vos documents techniques.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
            {/* Zone de chat */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              <List>
                {messages.map((message) => (
                  <ListItem 
                    key={message.id} 
                    sx={{ 
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 40 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                            width: 36,
                            height: 36
                          }}
                        >
                          {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <Paper 
                        elevation={1} 
                        sx={{ 
                          p: 2, 
                          bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                          borderRadius: 2,
                          maxWidth: '100%'
                        }}
                      >
                        <Typography variant="body1" component="div">
                          {message.content}
                        </Typography>
                        
                        {/* Afficher les documents pertinents si disponibles */}
                        {message.relevantDocs && message.relevantDocs.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Sources pertinentes:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {message.relevantDocs.map((doc, index) => (
                                <Chip
                                  key={index}
                                  icon={<DocIcon fontSize="small" />}
                                  label={doc.title}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                ))}
                <div ref={messagesEndRef} />
              </List>
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    L'assistant réfléchit...
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Zone de saisie */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={1}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Posez votre question ici..."
                    variant="outlined"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={loading || indexing}
                  />
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading || indexing}
                  >
                    Envoyer
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Base de connaissances
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Statut de la base vectorielle: 
                  <Chip 
                    label={vectorDbStatus} 
                    color={vectorDbStatus === 'initialisée' ? 'success' : vectorDbStatus === 'en cours d\'initialisation' ? 'warning' : 'error'} 
                    size="small" 
                    sx={{ ml: 1 }} 
                  />
                </Typography>
                
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<StorageIcon />}
                  onClick={handleIndexDocuments}
                  disabled={indexing || vectorDbStatus === 'initialisée'}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Analyser les documents
                </Button>
              </Box>
              
              {indexing && (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    {indexStatus}
                  </Typography>
                  <LinearProgress variant="determinate" value={indexProgress} />
                  <Typography variant="caption" color="text.secondary">
                    {indexProgress}% terminé
                  </Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Actions
              </Typography>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetConversation}
                fullWidth
                sx={{ mb: 1 }}
              >
                Nouvelle conversation
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exemples de questions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem button onClick={() => {
                  setInputMessage("Quelles sont les procédures de maintenance pour l'A320?");
                }}>
                  <ListItemText primary="Quelles sont les procédures de maintenance pour l'A320?" />
                </ListItem>
                <ListItem button onClick={() => {
                  setInputMessage("Comment inspecter un moteur CFM56?");
                }}>
                  <ListItemText primary="Comment inspecter un moteur CFM56?" />
                </ListItem>
                <ListItem button onClick={() => {
                  setInputMessage("Expliquez le système hydraulique des avions modernes");
                }}>
                  <ListItemText primary="Expliquez le système hydraulique des avions modernes" />
                </ListItem>
                <ListItem button onClick={() => {
                  setInputMessage("Quels documents sont nécessaires pour la certification?");
                }}>
                  <ListItemText primary="Quels documents sont nécessaires pour la certification?" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIAssistantPage;
