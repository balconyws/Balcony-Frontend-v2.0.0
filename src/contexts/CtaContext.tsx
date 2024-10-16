'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';

type CtaContextType = {
  open: boolean;
  title: string;
  description: string;
  submitBtnText: string | null;
  closeBtnText: string | null;
  disableSubmitBtn: boolean;
  disableCloseBtn: boolean;
  loading: boolean;
  submitBtnAction: () => void;
  closeBtnAction: () => void;
  setOpen: Dispatch<SetStateAction<boolean>>;
  setTitle: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setSubmitBtnText: Dispatch<SetStateAction<string | null>>;
  setCloseBtnText: Dispatch<SetStateAction<string | null>>;
  setSubmitBtnAction: Dispatch<SetStateAction<() => void>>;
  setCloseBtnAction: Dispatch<SetStateAction<() => void>>;
  setDisableSubmitBtn: Dispatch<SetStateAction<boolean>>;
  setDisableCloseBtn: Dispatch<SetStateAction<boolean>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const CtaContext = createContext<CtaContextType | undefined>(undefined);

export const useCta = () => {
  const context = useContext(CtaContext);
  if (!context) {
    throw new Error('useCta must be used within a CtaProvider');
  }
  return context;
};

export const CtaProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('your all set!');
  const [description, setDescription] = useState<string>('');
  const [submitBtnText, setSubmitBtnText] = useState<string | null>(null);
  const [disableSubmitBtn, setDisableSubmitBtn] = useState<boolean>(false);
  const [closeBtnText, setCloseBtnText] = useState<string | null>(null);
  const [closeBtnAction, setCloseBtnAction] = useState<() => void>(() => {
    setOpen(false);
  });
  const [submitBtnAction, setSubmitBtnAction] = useState<() => void>(() => {});
  const [disableCloseBtn, setDisableCloseBtn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      setTitle('your all set!');
      setDescription('');
      setSubmitBtnText(null);
      setSubmitBtnAction(() => {});
      setSubmitBtnText(null);
      setDisableSubmitBtn(false);
      setDisableCloseBtn(false);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (loading) {
      setOpen(true);
    }
  }, [loading]);

  return (
    <CtaContext.Provider
      value={{
        open,
        setOpen,
        title,
        description,
        submitBtnText,
        submitBtnAction,
        disableSubmitBtn,
        closeBtnText,
        closeBtnAction,
        disableCloseBtn,
        loading,
        setTitle,
        setDescription,
        setSubmitBtnText,
        setCloseBtnText,
        setSubmitBtnAction,
        setCloseBtnAction,
        setDisableSubmitBtn,
        setDisableCloseBtn,
        setLoading,
      }}>
      {children}
    </CtaContext.Provider>
  );
};
