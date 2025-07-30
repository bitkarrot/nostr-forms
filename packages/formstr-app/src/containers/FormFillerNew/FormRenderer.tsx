import { Form, Typography } from "antd";
import Markdown from "react-markdown";
import { FormFields } from "./FormFields";
import { Field, Tag } from "../../nostr/types";
import FillerStyle from "./formFiller.style";
import FormBanner from "../../components/FormBanner";
import { IFormSettings } from "../CreateFormNew/components/FormSettings/types";
import { Link } from "react-router-dom";
import { isMobile } from "../../utils/utility";
import { ReactComponent as CreatedUsingFormstr } from "../../Images/created-using-formstr.svg";

const { Text } = Typography;

interface FormRendererProps {
  formTemplate: Tag[];
  form: any;
  onInput: (questionId: string, answer: string, message?: string) => void;
  footer?: React.ReactNode;
  hideTitleImage?: boolean;
  hideDescription?: boolean;
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: string;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  formTemplate,
  form,
  onInput,
  footer,
  hideTitleImage,
  hideDescription,
  backgroundColor,
  fontColor,
  fontSize,
}) => {
  const name = formTemplate.find((tag) => tag[0] === "name")?.[1] || "";
  const settings = JSON.parse(
    formTemplate.find((tag) => tag[0] === "settings")?.[1] || "{}",
  ) as IFormSettings;
  const fields = formTemplate.filter((tag) => tag[0] === "field") as Field[];

  // Map fontSize string to pixel values
  const getFontSizeInPx = (size?: string) => {
    switch (size) {
      case "small":
        return "14px";
      case "large":
        return "18px";
      case "medium":
      default:
        return "16px";
    }
  };

  // Apply custom styles from props or settings
  const containerStyles = {
    color: fontColor || settings?.fontColor || "#000000",
    fontSize: getFontSizeInPx(fontSize || settings?.fontSize),
  };
  
  // Background color will be applied to both container and form-filler
  const bgColor = backgroundColor || settings?.backgroundColor || "#ffffff";

  return (
    <FillerStyle>
      <div className="filler-container" style={{...containerStyles, backgroundColor: bgColor}}>
        <div className="form-filler" style={{backgroundColor: bgColor}}>

          {!hideTitleImage && settings?.titleImageUrl && (
            <FormBanner
              imageUrl={settings.titleImageUrl}
              formTitle={name}
            />
          )}

          {!hideDescription && settings?.description && (
            <div className="form-description">
              <Text>
                <Markdown components={{
                  p: ({children}) => (
                    <p style={{
                      color: fontColor || settings?.fontColor || "#000000",
                      fontSize: getFontSizeInPx(fontSize || settings?.fontSize)
                    }}>
                      {children}
                    </p>
                  )
                }}>
                  {settings.description}
                </Markdown>
              </Text>
            </div>
          )}

          <Form form={form} onFinish={() => { }} className="with-description">
            <FormFields 
              fields={fields} 
              handleInput={onInput} 
              fontColor={fontColor || settings?.fontColor || "#000000"}
            />
            {footer}
          </Form>
        </div>

        <div className="branding-container">
          <Link to="/">
            <CreatedUsingFormstr />
          </Link>
          {!isMobile() && (
            <a
              href="https://github.com/abhay-raizada/nostr-forms"
              className="foss-link"
            >
              <Text className="text-style">
                Formstr is free and Open Source
              </Text>
            </a>
          )}
        </div>
      </div>
    </FillerStyle>
  );
};