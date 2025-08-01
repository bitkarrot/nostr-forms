import React, { useEffect, useRef, useState, useCallback } from "react";
import { AnswerSettings } from "@formstr/sdk/dist/interfaces";
import { FormInitData, IFormBuilderContext, RelayItem } from "./typeDefs";
import { generateQuestion } from "../../utils";
import { getDefaultRelays } from "@formstr/sdk";
import { makeTag } from "../../../../utils/utility";
import { HEADER_MENU_KEYS } from "../../components/Header/config";
import { IFormSettings } from "../../components/FormSettings/types";
import { Tag } from "@formstr/sdk/dist/formstr/nip101";
import { bytesToHex } from "@noble/hashes/utils";
import { getPublicKey } from "nostr-tools";
import { useNavigate } from "react-router-dom";
import { useProfileContext } from "../../../../hooks/useProfileContext";
import { createForm } from "../../../../nostr/createForm";
import { getItem, LOCAL_STORAGE_KEYS, setItem} from "../../../../utils/localStorage";
import { Field } from "../../../../nostr/types";
import { message } from 'antd';
import { ProcessedFormData } from "../../components/AIFormGeneratorModal/aiProcessor";

const LOCAL_STORAGE_CUSTOM_RELAYS_KEY = "formstr:customRelays";

export const FormBuilderContext = React.createContext<IFormBuilderContext>({
  questionsList: [],
  initializeForm: () => null,
  saveForm: () => Promise.resolve(),
  editQuestion: () => null,
  addQuestion: () => null,
  deleteQuestion: () => null,
  questionIdInFocus: undefined,
  setQuestionIdInFocus: () => null,
  formSettings: { titleImageUrl: "", formId: "" },
  updateFormSetting: () => null,
  updateFormTitleImage: () => null,
  closeSettingsOnOutsideClick: () => null,
  closeMenuOnOutsideClick: () => null,
  isRightSettingsOpen: false,
  isLeftMenuOpen: false,
  setIsLeftMenuOpen: () => null,
  toggleSettingsWindow: () => null,
  formName: "",
  updateFormName: () => null,
  updateQuestionsList: () => null,
  getFormSpec: () => [],
  saveDraft: () => null,
  selectedTab: HEADER_MENU_KEYS.BUILDER,
  setSelectedTab: () => {},
  bottomElementRef: null,
  relayList: [],
  editList: null,
  setEditList: () => null,
  viewList: null,
  setViewList: () => null,
  isRelayManagerModalOpen: false,
  toggleRelayManagerModal: () => null,
  addRelayToList: () => null,
  editRelayInList: () => null,
  deleteRelayFromList: () => null,
  isAiModalOpen: false,
  setIsAiModalOpen: () => null,
  handleAIFormGenerated: () => null,
});

const InitialFormSettings: IFormSettings = {
  titleImageUrl:
    "https://images.pexels.com/photos/733857/pexels-photo-733857.jpeg",
  description:
    "This is the description, you can use markdown while editing it!" +
    " tap anywhere on the form to edit, including this description.",
  thankYouPage: true,
  formId: makeTag(6),
  encryptForm: true,
  viewKeyInUrl: true,
  backgroundColor: "#ffffff",
  fontColor: "#000000",
  fontSize: "medium",
};

export default function FormBuilderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userRelays } = useProfileContext();

  const [questionsList, setQuestionsList] = useState<Array<Field>>([
    generateQuestion(),
  ]);
  const [questionIdInFocus, setQuestionIdInFocus] = useState<string | undefined>();
  const [formSettings, setFormSettings] = useState<IFormSettings>(InitialFormSettings);
  const [isRightSettingsOpen, setIsRightSettingsOpen] = useState(false);
  const [isLeftMenuOpen, setIsLeftMenuOpen] = useState(false);
  const [formName, setFormName] = useState<string>(
    "This is the title of your form! Tap to edit."
  );
  const bottomElement = useRef<HTMLDivElement>(null);
  const { pubkey: userPubkey } = useProfileContext();
  const [editList, setEditList] = useState<Set<string>>(
    new Set(userPubkey ? [userPubkey] : [])
  );
  const [viewList, setViewList] = useState<Set<string>>(new Set([]));
  const [selectedTab, setSelectedTab] = useState<string>(HEADER_MENU_KEYS.BUILDER);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState<string | null | undefined>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const navigate = useNavigate();

  const [relayList, setRelayList] = useState<RelayItem[]>([]);
  const [isRelayManagerModalOpen, setIsRelayManagerModalOpen] = useState(false);
  useEffect(() => {
    let baseList: RelayItem[];
    const storedUserManagedRelays = getItem<RelayItem[]>(LOCAL_STORAGE_CUSTOM_RELAYS_KEY);

    if (userRelays && userRelays.length > 0) {
      baseList = userRelays.map(url => {
        const existingStoredRelay = storedUserManagedRelays?.find(r => r.url === url);
        return existingStoredRelay || { url, tempId: makeTag(6) };
      });
    } else if (storedUserManagedRelays) {
      baseList = storedUserManagedRelays;
    } else {
      baseList = [];
    }

    const defaultRelayUrls = getDefaultRelays();
    const finalRelayList = [...baseList];
    const baseListUrls = new Set(baseList.map(r => r.url));

    defaultRelayUrls.forEach(defaultUrl => {
      if (!baseListUrls.has(defaultUrl)) {
        const existingStoredDefault = storedUserManagedRelays?.find(r => r.url === defaultUrl);
        if (existingStoredDefault) {
            finalRelayList.push(existingStoredDefault);
        } else {
            finalRelayList.push({ url: defaultUrl, tempId: makeTag(6) });
        }
      }
    });
    
    const uniqueRelayMap = new Map<string, RelayItem>();
    baseList.forEach(relay => uniqueRelayMap.set(relay.url, relay));
    finalRelayList.forEach(relay => {
        if (!uniqueRelayMap.has(relay.url)) {
            uniqueRelayMap.set(relay.url, relay);
        }
    });
    const uniqueFinalRelayList = Array.from(uniqueRelayMap.values());

    setRelayList(uniqueFinalRelayList);
  }, [userRelays]);
  const toggleRelayManagerModal = useCallback(() => {
    setIsRelayManagerModalOpen(prev => !prev);
  }, []);

  const addRelayToList = useCallback((url: string) => {
    setRelayList(prevRelayList => {
        if (prevRelayList.some(relay => relay.url === url)) {
            message.warning(`Relay URL ${url} already exists.`);
            return prevRelayList;
        }
        const newRelay: RelayItem = { url, tempId: makeTag(6) };
        const updatedList = [...prevRelayList, newRelay];
        setItem(LOCAL_STORAGE_CUSTOM_RELAYS_KEY, updatedList.filter(r => !getDefaultRelays().includes(r.url))); // Only store custom relays
        return updatedList;
    });
  }, []);

  const editRelayInList = useCallback((tempId: string, newUrl: string) => {
    setRelayList(prevRelayList => {
        if (prevRelayList.some(relay => relay.url === newUrl && relay.tempId !== tempId)) {
            message.warning(`Relay URL ${newUrl} already exists.`);
            return prevRelayList;
        }
        const updatedList = prevRelayList.map(relay =>
            relay.tempId === tempId ? { ...relay, url: newUrl } : relay
        );
        setItem(LOCAL_STORAGE_CUSTOM_RELAYS_KEY, updatedList.filter(r => !getDefaultRelays().includes(r.url))); // Only store custom relays
        return updatedList;
    });
  }, []);

  const deleteRelayFromList = useCallback((tempId: string) => {
    setRelayList(prevRelayList => {
        const relayToDelete = prevRelayList.find(r => r.tempId === tempId);
        if (!relayToDelete) return prevRelayList;
        let updatedList = prevRelayList.filter(relay => relay.tempId !== tempId);
        setItem(LOCAL_STORAGE_CUSTOM_RELAYS_KEY, updatedList.filter(r => !getDefaultRelays().includes(r.url))); // Only store custom relays
        return updatedList;
    });
  }, []);

  const toggleSettingsWindow = () => {
    setIsRightSettingsOpen((open) => !open);
  };

  const closeSettingsOnOutsideClick = () => {
    if (isRightSettingsOpen) toggleSettingsWindow();
  };

  const closeMenuOnOutsideClick = () => {
    if (isLeftMenuOpen) setIsLeftMenuOpen(false);
  };

  const getFormSpec = (): Tag[] => {
    let formSpec: Tag[] = [];
    formSpec.push(["d", formSettings.formId || ""]);
    formSpec.push(["name", formName]);
    formSpec.push(["settings", JSON.stringify(formSettings)]);
    formSpec = [...formSpec, ...questionsList];
    return formSpec;
  };

  const saveForm = async (onRelayAccepted?: (url: string) => void) => {
    const formToSave = getFormSpec();
    if (!formSettings.formId) {
      message.error("Form ID is required");
      return;
    }
    const relayUrls = relayList.map((relay) => relay.url);
    await createForm(
      formToSave,
      relayUrls,
      viewList,
      editList,
      formSettings.encryptForm,
      onRelayAccepted,
      secretKey,
      viewKey
    ).then(
      (artifacts: {
        signingKey: Uint8Array;
        viewKey: Uint8Array;
        acceptedRelays: string[];
      }) => {
        const { signingKey, viewKey: formViewKey, acceptedRelays } = artifacts;
        navigate("/dashboard", {
          state: {
            pubKey: getPublicKey(signingKey),
            formId: formSettings.formId,
            secretKey: bytesToHex(signingKey),
            viewKey: formSettings.viewKeyInUrl ? bytesToHex(formViewKey) : null,
            name: formName,
            relay: acceptedRelays.length > 0 ? acceptedRelays[0] : "",
          },
        });
      },
      (error) => {
        console.error("Error creating form:", error);
        message.error("Error creating the form: " + (error instanceof Error ? error.message : String(error)));
      }
    );
  };

  const saveDraft = () => {
    if (formSettings.formId === "") return;
    type Draft = { formSpec: Tag[]; tempId: string };
    const formSpec = getFormSpec();
    const draftObject = { formSpec, tempId: formSettings.formId! };
    let draftArr = getItem<Draft[]>(LOCAL_STORAGE_KEYS.DRAFT_FORMS) || [];
    const draftIds = draftArr.map((draft: Draft) => draft.tempId);
    if (!draftIds.includes(draftObject.tempId)) {
      draftArr.push(draftObject);
    } else {
      draftArr = draftArr.map((draft: Draft) => {
        if (draftObject.tempId === draft.tempId) {
          return draftObject;
        }
        return draft;
      });
    }
    setItem(LOCAL_STORAGE_KEYS.DRAFT_FORMS, draftArr);
  };

  const editQuestion = (question: Field, tempId: string) => {
    const editedList = questionsList.map((existingQuestion: Field) => {
      if (existingQuestion[1] === tempId) {
        return question;
      }
      return existingQuestion;
    });
    setQuestionsList(editedList);
  };

  const addQuestion = (
    primitive?: string,
    label?: string,
    answerSettings?: AnswerSettings
  ) => {
    setIsLeftMenuOpen(false);
    setQuestionsList([
      ...questionsList,
      generateQuestion(primitive, label, [], answerSettings),
    ]);
    setTimeout(() => {
      bottomElement?.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const deleteQuestion = (tempId: string) => {
    if (questionIdInFocus === tempId) {
      setQuestionIdInFocus(undefined);
    }
    setQuestionsList((preQuestions) => {
      return preQuestions.filter((question) => question[1] !== tempId);
    });
  };

  const updateQuestionsList = (newQuestionsList: Field[]) => {
    setQuestionsList(newQuestionsList);
  };

  const updateFormSetting = (settings: IFormSettings) => {
    setFormSettings((preSettings) => ({ ...preSettings, ...settings }));
  };

  const updateFormTitleImage = (e: React.FormEvent<HTMLInputElement>) => {
    const imageUrl = e.currentTarget.value;
    updateFormSetting({
      titleImageUrl: imageUrl || "",
    });
  };

  const initializeForm = (form: FormInitData) => {
    setFormName(form.spec.filter((f) => f[0] === "name")?.[0]?.[1] || "");
    let settingsFromFile = JSON.parse(
      form.spec.filter((f) => f[0] === "settings")?.[0]?.[1] || "{}"
    );
    settingsFromFile = { ...InitialFormSettings, ...settingsFromFile };
    let fields = form.spec.filter((f) => f[0] === "field") as Field[];
    setFormSettings((currentSettings) => ({ ...currentSettings, ...settingsFromFile, formId: form.id }));
    let newViewList = form.spec.filter((f) => f[0] === "allowed").map((t) => t[1]);
    let allKeys = form.spec.filter((f) => f[0] === "p").map((t) => t[1]);
    let newEditList: string[] = allKeys.filter((p) => !newViewList.includes(p));
    setViewList(new Set(newViewList));
    setEditList(new Set(newEditList));
    setQuestionsList(fields);
    setSecretKey(form.secret || null);
    setViewKey(form.viewKey);
  };

  const handleAIFormGenerated = (processedData: ProcessedFormData) => {
    try {
        if (processedData.formName) {
            setFormName(processedData.formName);
        }
        if (processedData.description) {
            updateFormSetting({ description: processedData.description });
        }
        if (processedData.fields && processedData.fields.length > 0) {
            updateQuestionsList(processedData.fields);
            setQuestionIdInFocus(undefined);
        } else {
            message.warning("AI generated data, but no fields were created.");
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Failed to apply the generated form data.";
        message.error(errorMsg);
    }
  };


  return (
    <FormBuilderContext.Provider
      value={{
        initializeForm,
        questionsList,
        saveForm,
        editQuestion,
        addQuestion,
        deleteQuestion,
        questionIdInFocus,
        setQuestionIdInFocus,
        formSettings,
        updateFormSetting,
        updateFormTitleImage,
        closeSettingsOnOutsideClick,
        closeMenuOnOutsideClick,
        toggleSettingsWindow,
        isRightSettingsOpen,
        isLeftMenuOpen,
        setIsLeftMenuOpen,
        formName,
        updateFormName: setFormName,
        updateQuestionsList,
        getFormSpec,
        saveDraft,
        selectedTab,
        setSelectedTab,
        bottomElementRef: bottomElement,
        relayList,
        editList,
        setEditList,
        viewList,
        setViewList,
        isRelayManagerModalOpen,
        toggleRelayManagerModal,
        addRelayToList,
        editRelayInList,
        deleteRelayFromList,
        isAiModalOpen,
        setIsAiModalOpen,
        handleAIFormGenerated,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
}