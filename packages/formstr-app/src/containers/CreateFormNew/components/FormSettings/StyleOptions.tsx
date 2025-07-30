import { Typography, Input, Select } from "antd";
import useFormBuilderContext from "../../hooks/useFormBuilderContext";
import { ChangeEvent } from "react";

const { Text } = Typography;
const { Option } = Select;

interface StyleOptionsProps {
  backgroundColor?: string;
  fontColor?: string;
  fontSize?: string;
}

function StyleOptions({ backgroundColor, fontColor, fontSize }: StyleOptionsProps) {
  const { updateFormSetting } = useFormBuilderContext();

  const handleBackgroundColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormSetting({
      backgroundColor: e.target.value,
    });
  };

  const handleFontColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateFormSetting({
      fontColor: e.target.value,
    });
  };

  const handleFontSizeChange = (value: string) => {
    updateFormSetting({
      fontSize: value,
    });
  };

  return (
    <>
      <div className="property-setting">
        <Text className="property-name">Background Color</Text>
      </div>
      <Input
        type="color"
        value={backgroundColor || "#ffffff"}
        onChange={handleBackgroundColorChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      
      <div className="property-setting">
        <Text className="property-name">Description Font Color</Text>
      </div>
      <Input
        type="color"
        value={fontColor || "#000000"}
        onChange={handleFontColorChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      
      <div className="property-setting">
        <Text className="property-name">Font Size</Text>
      </div>
      <Select
        value={fontSize || "medium"}
        onChange={handleFontSizeChange}
        style={{ width: "100%", marginBottom: "10px" }}
      >
        <Option value="small">Small</Option>
        <Option value="medium">Medium</Option>
        <Option value="large">Large</Option>
      </Select>
    </>
  );
}

export default StyleOptions;
