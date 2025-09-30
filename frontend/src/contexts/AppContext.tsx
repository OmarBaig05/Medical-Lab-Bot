import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Report {
  id: string;
  title: string;
  date: string;
  status: 'processing' | 'completed' | 'failed';
  latexTable?: string;
  interpretation?: string;
}

interface AppContextType {
  reports: Report[];
  currentReport: Report | null;
  setCurrentReport: (report: Report | null) => void;
  addReport: (report: Report) => void;
  updateReport: (reportId: string, updates: Partial<Report>) => void;
  deleteReport: (reportId: string) => void;
  chatMessages: Array<{ id: string; sender: 'user' | 'assistant'; message: string; timestamp: Date }>;
  addChatMessage: (message: string, sender: 'user' | 'assistant') => void;
  freeQuestionsLeft: number;
  decrementFreeQuestions: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Lipid Panel',
      date: '2024-01-10',
      status: 'completed'
    }
  ]);

  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'assistant'; message: string; timestamp: Date }>>([]);
  const [freeQuestionsLeft, setFreeQuestionsLeft] = useState(2);

  const addReport = (report: Report) => {
    setReports(prev => [...prev, report]);
  };

  const updateReport = (reportId: string, updates: Partial<Report>) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, ...updates } : report
    ));
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
  };

  const addChatMessage = (message: string, sender: 'user' | 'assistant') => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date()
    }]);
  };

  const decrementFreeQuestions = () => {
    setFreeQuestionsLeft(prev => Math.max(0, prev - 1));
  };

  return (
    <AppContext.Provider value={{
      reports,
      currentReport,
      setCurrentReport,
      addReport,
      updateReport,
      deleteReport,
      chatMessages,
      addChatMessage,
      freeQuestionsLeft,
      decrementFreeQuestions
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}